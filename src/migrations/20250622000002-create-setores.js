'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar tabela de setores
    await queryInterface.createTable('setores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Adicionar coluna setor_id na tabela processos
    await queryInterface.addColumn('processos', 'setor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'setores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrar dados existentes do campo setor_atual para a tabela setores
    await queryInterface.sequelize.query(`
      INSERT INTO setores (nome, "createdAt", "updatedAt")
      SELECT DISTINCT TRIM(setor_atual), NOW(), NOW()
      FROM processos
      WHERE setor_atual IS NOT NULL AND TRIM(setor_atual) != ''
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Atualizar setor_id baseado no setor_atual
    await queryInterface.sequelize.query(`
      UPDATE processos p
      SET setor_id = s.id
      FROM setores s
      WHERE TRIM(p.setor_atual) = s.nome
      AND p.setor_atual IS NOT NULL
      AND TRIM(p.setor_atual) != '';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover coluna setor_id
    await queryInterface.removeColumn('processos', 'setor_id');
    
    // Dropar tabela setores
    await queryInterface.dropTable('setores');
  }
};
