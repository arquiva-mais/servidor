const { Notificacao } = require('../relations/models.relations');
const { Op } = require('sequelize');

/**
 * Cria uma nova notificação para um usuário
 * @param {number} usuarioId - ID do usuário que receberá a notificação
 * @param {string} mensagem - Texto da notificação
 * @returns {Promise<object>} - Notificação criada
 */
async function criarNotificacao(usuarioId, mensagem) {
  try {
    const notificacao = await Notificacao.create({
      usuario_id: usuarioId,
      mensagem,
      lida: false,
      created_at: new Date()
    });
    return notificacao;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

/**
 * Lista todas as notificações de um usuário
 * @param {number} usuarioId - ID do usuário
 * @returns {Promise<object[]>} - Lista de notificações ordenadas por data DESC
 */
async function listarNotificacoes(usuarioId) {
  try {
    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: usuarioId },
      order: [['created_at', 'DESC']],
      limit: 50 // Limitar para não sobrecarregar
    });
    return notificacoes;
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    throw error;
  }
}

/**
 * Conta notificações não lidas de um usuário
 * @param {number} usuarioId - ID do usuário
 * @returns {Promise<number>} - Quantidade de não lidas
 */
async function contarNaoLidas(usuarioId) {
  try {
    const count = await Notificacao.count({
      where: { 
        usuario_id: usuarioId,
        lida: false
      }
    });
    return count;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    throw error;
  }
}

/**
 * Marca uma notificação específica como lida
 * @param {number} notificacaoId - ID da notificação
 * @param {number} usuarioId - ID do usuário (para validação de propriedade)
 * @returns {Promise<object>} - Notificação atualizada
 */
async function marcarComoLida(notificacaoId, usuarioId) {
  try {
    const notificacao = await Notificacao.findOne({
      where: { 
        id: notificacaoId,
        usuario_id: usuarioId // Garante que pertence ao usuário
      }
    });

    if (!notificacao) {
      throw new Error('Notificação não encontrada');
    }

    await notificacao.update({ lida: true });
    return notificacao;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 * @param {number} usuarioId - ID do usuário
 * @returns {Promise<number>} - Quantidade de notificações atualizadas
 */
async function marcarTodasComoLidas(usuarioId) {
  try {
    const [affectedCount] = await Notificacao.update(
      { lida: true },
      { 
        where: { 
          usuario_id: usuarioId,
          lida: false
        } 
      }
    );
    return affectedCount;
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
    throw error;
  }
}

/**
 * Remove notificações com mais de 7 dias (rotina de limpeza TTL)
 * @returns {Promise<number>} - Quantidade de notificações excluídas
 */
async function limparNotificacoesAntigas() {
  try {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const deletedCount = await Notificacao.destroy({
      where: {
        created_at: {
          [Op.lt]: seteDiasAtras
        }
      }
    });

    console.log(`[Cleanup] ${deletedCount} notificações antigas removidas.`);
    return deletedCount;
  } catch (error) {
    console.error('Erro ao limpar notificações antigas:', error);
    throw error;
  }
}

module.exports = {
  criarNotificacao,
  listarNotificacoes,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  limparNotificacoesAntigas
};
