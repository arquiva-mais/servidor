'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('processos');
    });

    if (tableExists) {
      console.log('Tabela "processos" já existe, pulando criação...');
      return;
    }

    await queryInterface.createTable('processos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero_processo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data_entrada: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      competencia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      objeto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      interessado: {
        type: Sequelize.STRING,
        allowNull: false
      },
      orgao_gerador: {
        type: Sequelize.STRING,
        allowNull: false
      },
      responsavel: {
        type: Sequelize.STRING,
        allowNull: false
      },
      setor_atual: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      observacao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      valor_convenio: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      valor_recurso_proprio: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      valor_royalties: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      concluido: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        allowNull: true
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

    console.log('Tabela "processos" criada com sucesso!');

    try {
      await queryInterface.addIndex('processos', ['numero_processo'], {
        name: 'idx_processos_numero_processo'
      });
      await queryInterface.addIndex('processos', ['orgao_id'], {
        name: 'idx_processos_orgao_id'
      });
      await queryInterface.addIndex('processos', ['data_entrada'], {
        name: 'idx_processos_data_entrada'
      });
      await queryInterface.addIndex('processos', ['concluido'], {
        name: 'idx_processos_concluido'
      });
      console.log('Índices criados com sucesso!');
    } catch (error) {
      console.log('Alguns índices já podem existir:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => {
      return tables.includes('processos');
    });

    if (tableExists) {
      await queryInterface.dropTable('processos');
      console.log('Tabela "processos" removida com sucesso!');
    } else {
      console.log('Tabela "processos" não existe, nada para remover.');
    }
  }
};
