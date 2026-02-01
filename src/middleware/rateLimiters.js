const rateLimit = require('express-rate-limit');

/**
 * Extrai o IP real do request considerando a cadeia de proxies:
 * Cloudflare -> Nginx -> Node.js (Express)
 * 
 * Hierarquia de prioridade:
 * 1. cf-connecting-ip: IP real garantido pela Cloudflare (mais confiável)
 * 2. x-forwarded-for: Primeiro IP da lista (fallback se Cloudflare não estiver presente)
 * 3. req.ip: IP processado pelo Express (trust proxy deve estar configurado)
 * 4. req.socket.remoteAddress: Fallback final (conexão direta)
 * 
 * @param {Request} req 
 * @returns {string}
 */
const getClientIp = (req) => {
  // 1. Cloudflare: Header mais confiável quando usando Cloudflare
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // 2. X-Forwarded-For: Primeiro IP da lista (IP original do cliente)
  // Formato: "client, proxy1, proxy2" - pegamos o primeiro
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // 3. req.ip: IP processado pelo Express (funciona com trust proxy configurado)
  if (req.ip) {
    return req.ip;
  }

  // 4. Fallback final: conexão direta do socket
  return req.socket?.remoteAddress || 'unknown';
};

/**
 * Limiter geral para toda a API (proteção contra flooding)
 * 
 * Estratégia:
 * - Janela curta (1 minuto) para liberar rapidamente após picos
 * - Limite dinâmico: usuários autenticados têm mais margem
 * - Identificador inteligente: usa userId para evitar bloquear escritórios inteiros (NAT)
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  
  // Limite dinâmico baseado em autenticação
  max: (req) => {
    // Se usuário está autenticado, permite uso intenso (300 req/min)
    if (req.usuario?.id || req.userId) {
      return 300;
    }
    // Visitantes anônimos: limite mais restrito (30 req/min)
    return 30;
  },
  
  // Identificador: userId para autenticados, IP para anônimos
  keyGenerator: (req) => {
    // Prioriza userId para evitar punir escritórios inteiros por NAT
    if (req.usuario?.id) {
      return `user_${req.usuario.id}`;
    }
    if (req.userId) {
      return `user_${req.userId}`;
    }
    // Fallback para IP (visitantes não autenticados)
    return `ip_${getClientIp(req)}`;
  },
  
  standardHeaders: true,  // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false,   // Desabilita headers `X-RateLimit-*` legados
  
  // Mensagem de erro personalizada
  message: {
    error: 'Muitas requisições. Por favor, aguarde um momento e tente novamente.'
  },
  
  // Handler customizado para log (opcional, útil para monitoramento)
  handler: (req, res, next, options) => {
    const identifier = req.usuario?.id ? `Usuário ${req.usuario.id}` : `IP ${getClientIp(req)}`;
    console.warn(`[Rate Limit] ${identifier} excedeu o limite de requisições.`);
    
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Limiter estrito para autenticação (proteção contra Brute Force)
 * 
 * Estratégia:
 * - Janela longa (15 minutos) para dificultar ataques de força bruta
 * - Limite baixo (10 tentativas) por IP
 * - Sempre usa IP como identificador (não há userId antes do login)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // Máximo 10 tentativas de login
  
  keyGenerator: (req) => `auth_${getClientIp(req)}`,
  
  standardHeaders: true,
  legacyHeaders: false,
  
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente após 15 minutos.'
  },
  
  // Skip successful requests (não conta logins bem-sucedidos)
  skipSuccessfulRequests: true
});

module.exports = {
  apiLimiter,
  authLimiter,
  getClientIp // Exporta para uso em logs de auditoria
};
