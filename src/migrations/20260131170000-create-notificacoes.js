'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificacoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índice para buscar notificações por usuário
    await queryInterface.addIndex('notificacoes', ['usuario_id']);
    
    // Índice para a rotina de limpeza (busca por data)
    await queryInterface.addIndex('notificacoes', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notificacoes');
  }
};
