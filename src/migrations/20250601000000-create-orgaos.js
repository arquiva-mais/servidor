'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('orgaos');
    });

    if (tableExists) {
      console.log('Tabela "orgaos" já existe, pulando criação...');
      return;
    }

    await queryInterface.createTable('orgaos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      cnpj: {
        type: Sequelize.STRING(18),
        allowNull: false,
        unique: true
      },
      tipo: {
        type: Sequelize.ENUM('PREFEITURA', 'SECRETARIA', 'DEPARTAMENTO'),
        allowNull: false,
        defaultValue: 'PREFEITURA'
      },
      endereco: {
        type: Sequelize.STRING,
        allowNull: true
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      responsavel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      observacoes: {
        type: Sequelize.TEXT,
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

    console.log('Tabela "orgaos" criada com sucesso!');

    try {
      await queryInterface.addIndex('orgaos', ['cnpj'], {
        name: 'idx_orgaos_cnpj',
        unique: true
      });
      await queryInterface.addIndex('orgaos', ['nome'], {
        name: 'idx_orgaos_nome',
        unique: true
      });
      await queryInterface.addIndex('orgaos', ['ativo'], {
        name: 'idx_orgaos_ativo'
      });
      console.log('Índices criados com sucesso!');
    } catch (error) {
      console.log('Alguns índices já podem existir:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('orgaos');
    });

    if (tableExists) {
      try {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orgaos_tipo" CASCADE;');
      } catch (error) {
        console.log('Erro ao remover enum:', error.message);
      }
      
      await queryInterface.dropTable('orgaos');
      console.log('Tabela "orgaos" removida com sucesso!');
    } else {
      console.log('Tabela "orgaos" não existe, nada para remover.');
    }
  }
};
