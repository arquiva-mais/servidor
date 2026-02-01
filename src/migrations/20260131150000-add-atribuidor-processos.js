'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('processos', 'atribuido_por_usuario_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Adicionar índice para melhorar performance de buscas
    await queryInterface.addIndex('processos', ['atribuido_por_usuario_id'], {
      name: 'idx_processos_atribuido_por'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('processos', 'idx_processos_atribuido_por');
    await queryInterface.removeColumn('processos', 'atribuido_por_usuario_id');
  }
};
