const notificacaoService = require('../services/notificacao.service');

/**
 * Lista notificações do usuário logado
 * GET /notificacoes
 */
async function listar(req, res) {
  try {
    const usuarioId = req.usuario.id;
    
    const notificacoes = await notificacaoService.listarNotificacoes(usuarioId);
    const naoLidas = await notificacaoService.contarNaoLidas(usuarioId);
    
    res.json({
      notificacoes,
      naoLidas
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
}

/**
 * Marca uma notificação específica como lida
 * PATCH /notificacoes/:id/ler
 */
async function marcarLida(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    
    const notificacao = await notificacaoService.marcarComoLida(parseInt(id), usuarioId);
    
    res.json({
      message: 'Notificação marcada como lida',
      notificacao
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    
    if (error.message === 'Notificação não encontrada') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Erro ao atualizar notificação' });
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 * PATCH /notificacoes/ler-todas
 */
async function marcarTodasLidas(req, res) {
  try {
    const usuarioId = req.usuario.id;
    
    const quantidade = await notificacaoService.marcarTodasComoLidas(usuarioId);
    
    res.json({
      message: 'Todas as notificações foram marcadas como lidas',
      quantidade
    });
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
    res.status(500).json({ message: 'Erro ao atualizar notificações' });
  }
}

module.exports = {
  listar,
  marcarLida,
  marcarTodasLidas
};
