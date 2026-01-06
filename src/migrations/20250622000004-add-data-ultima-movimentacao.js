'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('processos', 'data_ultima_movimentacao', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Atualizar registros existentes para ter a data de criação como data de última movimentação
    await queryInterface.sequelize.query(`
      UPDATE processos SET data_ultima_movimentacao = "createdAt" WHERE data_ultima_movimentacao IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('processos', 'data_ultima_movimentacao');
  }
};
