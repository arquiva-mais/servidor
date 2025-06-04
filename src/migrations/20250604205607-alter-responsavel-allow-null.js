'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('processos');

      if (!tableDescription.responsavel) {
        console.log('Coluna "responsavel" não existe na tabela "processos".');
        return;
      }

      if (tableDescription.responsavel.allowNull === true) {
        console.log('Coluna "responsavel" já permite NULL, pulando alteração...');
        return;
      }

      await queryInterface.changeColumn('processos', 'responsavel', {
        type: Sequelize.STRING,
        allowNull: true
      });

      console.log('Coluna "responsavel" alterada para permitir NULL com sucesso!');

    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Tabela "processos" não existe ainda. Esta migration será executada após a criação da tabela.');
        return;
      }
      console.error('Erro ao alterar coluna "responsavel":', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('processos');

      if (!tableDescription.responsavel) {
        console.log('Coluna "responsavel" não existe na tabela "processos".');
        return;
      }

      if (tableDescription.responsavel.allowNull === false) {
        console.log('Coluna "responsavel" já é NOT NULL, pulando alteração...');
        return;
      }

      await queryInterface.sequelize.query(
        "UPDATE processos SET responsavel = 'Não definido' WHERE responsavel IS NULL"
      );

      await queryInterface.changeColumn('processos', 'responsavel', {
        type: Sequelize.STRING,
        allowNull: false
      });

      console.log('Coluna "responsavel" alterada para NOT NULL com sucesso!');

    } catch (error) {
      console.error('Erro ao reverter alteração da coluna "responsavel":', error.message);
      throw error;
    }
  }
};