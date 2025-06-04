'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela existe
      const tableDescription = await queryInterface.describeTable('processos');

      if (!tableDescription.concluido) {
        console.log('Coluna "concluido" não existe, criando diretamente a coluna "status"...');

        // Criar o tipo ENUM
        await queryInterface.sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE "enum_processos_status" AS ENUM('em_andamento', 'concluido', 'cancelado');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);

        // Adicionar coluna status
        await queryInterface.addColumn('processos', 'status', {
          type: Sequelize.ENUM('em_andamento', 'concluido', 'cancelado'),
          allowNull: false,
          defaultValue: 'em_andamento'
        });

        console.log('Coluna "status" criada com sucesso!');
        return;
      }

      // Se a coluna concluido existe, fazer a migração
      console.log('Migrando coluna "concluido" para "status"...');

      // 1. Criar o tipo ENUM
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_processos_status" AS ENUM('em_andamento', 'concluido', 'cancelado');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // 2. Adicionar nova coluna status
      await queryInterface.addColumn('processos', 'status', {
        type: Sequelize.ENUM('em_andamento', 'concluido', 'cancelado'),
        allowNull: false,
        defaultValue: 'em_andamento'
      });

      // 3. Migrar dados: true -> 'concluido', false -> 'em_andamento'
      await queryInterface.sequelize.query(`
        UPDATE processos
        SET status = CASE
          WHEN concluido = true THEN 'concluido'::enum_processos_status
          ELSE 'em_andamento'::enum_processos_status
        END
      `);

      // 4. Remover coluna antiga
      await queryInterface.removeColumn('processos', 'concluido');

      console.log('Migração de "concluido" para "status" concluída com sucesso!');

    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Tabela "processos" não existe ainda.');
        return;
      }
      console.error('Erro na migração:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Verificar se a coluna status existe
      const tableDescription = await queryInterface.describeTable('processos');

      if (!tableDescription.status) {
        console.log('Coluna "status" não existe para reverter.');
        return;
      }

      // 1. Adicionar coluna concluido de volta
      await queryInterface.addColumn('processos', 'concluido', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });

      // 2. Migrar dados de volta: 'concluido' -> true, outros -> false
      await queryInterface.sequelize.query(`
        UPDATE processos
        SET concluido = CASE
          WHEN status = 'concluido' THEN true
          ELSE false
        END
      `);

      // 3. Remover coluna status
      await queryInterface.removeColumn('processos', 'status');

      // 4. Remover tipo ENUM
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_processos_status" CASCADE;');

      console.log('Reversão da migração concluída!');

    } catch (error) {
      console.error('Erro ao reverter migração:', error.message);
      throw error;
    }
  }
};