const rateLimit = require('express-rate-limit');

// Limiter geral para toda a API (proteção contra flooding básico)
// 15 minutos, 200 requisições por IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.'
  }
});

// Limiter estrito para autenticação (proteção contra Brute Force)
// 15 minutos, 10 tentativas de login por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de login, por favor tente novamente após 15 minutos.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
