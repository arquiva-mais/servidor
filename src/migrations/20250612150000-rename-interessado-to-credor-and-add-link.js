'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renomear coluna interessado para credor
    await queryInterface.renameColumn('processos', 'interessado', 'credor');
    
    // Adicionar coluna link_processo
    await queryInterface.addColumn('processos', 'link_processo', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna link_processo
    await queryInterface.removeColumn('processos', 'link_processo');
    
    // Renomear coluna credor de volta para interessado
    await queryInterface.renameColumn('processos', 'credor', 'interessado');
  }
};
