'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela de objetos
    await queryInterface.createTable('objects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
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

    // Criar tabela de credores
    await queryInterface.createTable('creditors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
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

    // Criar tabela de órgãos geradores (bodies)
    await queryInterface.createTable('bodies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
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

    // Migrar dados existentes para as novas tabelas
    // Objects
    await queryInterface.sequelize.query(`
      INSERT INTO objects (nome, "createdAt", "updatedAt")
      SELECT DISTINCT objeto, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM processos
      WHERE objeto IS NOT NULL AND objeto != ''
      ON CONFLICT (nome) DO NOTHING
    `);

    // Creditors
    await queryInterface.sequelize.query(`
      INSERT INTO creditors (nome, "createdAt", "updatedAt")
      SELECT DISTINCT credor, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM processos
      WHERE credor IS NOT NULL AND credor != ''
      ON CONFLICT (nome) DO NOTHING
    `);

    // Bodies
    await queryInterface.sequelize.query(`
      INSERT INTO bodies (nome, "createdAt", "updatedAt")
      SELECT DISTINCT orgao_gerador, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM processos
      WHERE orgao_gerador IS NOT NULL AND orgao_gerador != ''
      ON CONFLICT (nome) DO NOTHING
    `);

    // Adicionar novas colunas de referência na tabela processos
    await queryInterface.addColumn('processos', 'object_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'objects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('processos', 'creditor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'creditors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('processos', 'body_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'bodies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Atualizar os IDs baseado nos valores existentes
    await queryInterface.sequelize.query(`
      UPDATE processos p
      SET object_id = o.id
      FROM objects o
      WHERE p.objeto = o.nome
    `);

    await queryInterface.sequelize.query(`
      UPDATE processos p
      SET creditor_id = c.id
      FROM creditors c
      WHERE p.credor = c.nome
    `);

    await queryInterface.sequelize.query(`
      UPDATE processos p
      SET body_id = b.id
      FROM bodies b
      WHERE p.orgao_gerador = b.nome
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover colunas de referência
    await queryInterface.removeColumn('processos', 'object_id');
    await queryInterface.removeColumn('processos', 'creditor_id');
    await queryInterface.removeColumn('processos', 'body_id');

    // Remover tabelas
    await queryInterface.dropTable('bodies');
    await queryInterface.dropTable('creditors');
    await queryInterface.dropTable('objects');
  }
};
