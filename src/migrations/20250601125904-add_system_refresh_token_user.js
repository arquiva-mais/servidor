'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela existe
      const tableDescription = await queryInterface.describeTable('usuarios');

      // Adicionar refresh_token se não existir
      if (!tableDescription.refresh_token) {
        await queryInterface.addColumn('usuarios', 'refresh_token', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('Coluna "refresh_token" adicionada com sucesso!');
      } else {
        console.log('Coluna "refresh_token" já existe, pulando criação...');
      }

      // Adicionar refresh_token_expires se não existir
      if (!tableDescription.refresh_token_expires) {
        await queryInterface.addColumn('usuarios', 'refresh_token_expires', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('Coluna "refresh_token_expires" adicionada com sucesso!');
      } else {
        console.log('Coluna "refresh_token_expires" já existe, pulando criação...');
      }

    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Tabela "usuarios" não existe ainda. Esta migration será executada após a criação da tabela.');
        return;
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela existe
      const tableDescription = await queryInterface.describeTable('usuarios');

      // Remover refresh_token se existir
      if (tableDescription.refresh_token) {
        await queryInterface.removeColumn('usuarios', 'refresh_token');
        console.log('Coluna "refresh_token" removida!');
      } else {
        console.log('Coluna "refresh_token" não existe.');
      }

      // Remover refresh_token_expires se existir
      if (tableDescription.refresh_token_expires) {
        await queryInterface.removeColumn('usuarios', 'refresh_token_expires');
        console.log('Coluna "refresh_token_expires" removida!');
      } else {
        console.log('Coluna "refresh_token_expires" não existe.');
      }

    } catch (error) {
      console.log('Erro ao remover colunas ou tabela não existe:', error.message);
    }
  }
};
