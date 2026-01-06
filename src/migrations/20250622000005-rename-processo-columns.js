'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar e renomear colunas se existirem com o nome antigo
    const tableInfo = await queryInterface.describeTable('processos');
    
    if (tableInfo.object_id) {
      await queryInterface.renameColumn('processos', 'object_id', 'objeto_id');
      console.log('Coluna object_id renomeada para objeto_id');
    }

    if (tableInfo.creditor_id) {
      await queryInterface.renameColumn('processos', 'creditor_id', 'credor_id');
      console.log('Coluna creditor_id renomeada para credor_id');
    }

    if (tableInfo.body_id) {
      await queryInterface.renameColumn('processos', 'body_id', 'orgao_gerador_id');
      console.log('Coluna body_id renomeada para orgao_gerador_id');
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverter renomeação
    const tableInfo = await queryInterface.describeTable('processos');

    if (tableInfo.objeto_id) {
      await queryInterface.renameColumn('processos', 'objeto_id', 'object_id');
    }

    if (tableInfo.credor_id) {
      await queryInterface.renameColumn('processos', 'credor_id', 'creditor_id');
    }

    if (tableInfo.orgao_gerador_id) {
      await queryInterface.renameColumn('processos', 'orgao_gerador_id', 'body_id');
    }
  }
};
