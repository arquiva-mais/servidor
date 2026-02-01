/**
 * Jobs de manutenção agendados (Cron Jobs)
 * 
 * Este arquivo configura tarefas periódicas que rodam em background.
 * 
 * Para usar: importe e chame `iniciarJobs()` no app.js após o servidor iniciar.
 */

const cron = require('node-cron');
const notificacaoService = require('../services/notificacao.service');

/**
 * Job de limpeza de notificações antigas (TTL de 7 dias)
 * Executa todos os dias às 03:00 AM
 */
function agendarLimpezaNotificacoes() {
  // Cron expression: "0 3 * * *" = às 03:00 de cada dia
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron Job] Iniciando limpeza de notificações antigas...');
    
    try {
      const deletados = await notificacaoService.limparNotificacoesAntigas();
      console.log(`[Cron Job] Limpeza concluída. ${deletados} notificações removidas.`);
    } catch (error) {
      console.error('[Cron Job] Erro na limpeza de notificações:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo' // Fuso horário de Brasília
  });

  console.log('[Cron Job] Job de limpeza de notificações agendado (diariamente às 03:00).');
}

/**
 * Inicializa todos os jobs agendados
 */
function iniciarJobs() {
  console.log('[Cron Jobs] Inicializando jobs de manutenção...');
  
  agendarLimpezaNotificacoes();
  
  console.log('[Cron Jobs] Todos os jobs foram inicializados.');
}

module.exports = {
  iniciarJobs,
  agendarLimpezaNotificacoes
};
