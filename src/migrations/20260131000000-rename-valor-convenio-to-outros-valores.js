'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renomeia a coluna preservando os dados existentes
    await queryInterface.renameColumn('processos', 'valor_convenio', 'outros_valores');
  },

  async down(queryInterface, Sequelize) {
    // Reverte a mudança: outros_valores -> valor_convenio
    await queryInterface.renameColumn('processos', 'outros_valores', 'valor_convenio');
  }
};
