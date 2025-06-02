'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela já existe
    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('usuarios');
    });

    if (tableExists) {
      console.log('Tabela "usuarios" já existe, pulando criação...');
      return;
    }

    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      senha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
      },
      orgao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orgaos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refresh_token_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Tabela "usuarios" criada com sucesso!');

    // Criar índices com verificação
    const indexes = [
      { fields: ['email'], name: 'idx_usuarios_email', unique: true },
      { fields: ['orgao_id'], name: 'idx_usuarios_orgao_id' },
      { fields: ['role'], name: 'idx_usuarios_role' },
      { fields: ['ativo'], name: 'idx_usuarios_ativo' },
      { fields: ['refresh_token_expires'], name: 'idx_usuarios_refresh_expires' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('usuarios', index.fields, {
          name: index.name,
          unique: index.unique || false
        });
        console.log(`Índice ${index.name} criado!`);
      } catch (error) {
        console.log(`Índice ${index.name} já existe ou erro:`, error.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Verificar se a tabela existe antes de tentar deletar
    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('usuarios');
    });

    if (tableExists) {
      // Primeiro remover a constraint do enum
      try {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_usuarios_role" CASCADE;');
      } catch (error) {
        console.log('Erro ao remover enum:', error.message);
      }

      await queryInterface.dropTable('usuarios');
      console.log('Tabela "usuarios" removida com sucesso!');
    } else {
      console.log('Tabela "usuarios" não existe, nada para remover.');
    }
  }
};