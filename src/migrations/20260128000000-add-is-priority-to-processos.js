'use strict';

/**
 * Migration: Adiciona coluna is_priority para priorização de processos
 * 
 * - is_priority: boolean, default false
 * - Processos prioritários aparecem no topo da listagem
 * - Apenas GESTOR+ pode alterar prioridade
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('processos', 'is_priority', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o processo é prioritário (aparece no topo da listagem)'
    });

    // Adiciona índice para otimizar ordenação por prioridade
    await queryInterface.addIndex('processos', ['is_priority'], {
      name: 'idx_processos_is_priority'
    });

    // Índice composto para otimizar a ordenação padrão: is_priority DESC, data_entrada DESC
    await queryInterface.addIndex('processos', ['is_priority', 'data_entrada'], {
      name: 'idx_processos_priority_data_entrada'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('processos', 'idx_processos_priority_data_entrada');
    await queryInterface.removeIndex('processos', 'idx_processos_is_priority');
    await queryInterface.removeColumn('processos', 'is_priority');
  }
};
