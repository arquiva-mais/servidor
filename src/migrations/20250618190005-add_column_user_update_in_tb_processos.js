'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('processos');

      if (tableDescription.update_for) {
        console.log('Coluna "update_for" já existe na tabela "processos", pulando criação...');
        return;
      }

      await queryInterface.addColumn('processos', 'update_for', {
        type: Sequelize.STRING,
        allowNull: true,
      });

      console.log('Coluna "update_for" adicionada com sucesso na tabela "processos"!');

      try {
        await queryInterface.addIndex('processos', ['update_for'], {
          name: 'idx_processos_update_for'
        });
        console.log('Índice para "update_for" criado com sucesso!');
      } catch (indexError) {
        console.log('Índice já existe ou erro:', indexError.message);
      }

    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Tabela "processos" não existe ainda. Esta migration será executada após a criação da tabela.');
        return;
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('processos');

      if (tableDescription.update_for) {
        try {
          await queryInterface.removeIndex('processos', 'idx_processos_update_for');
          console.log('Índice "idx_processos_update_for" removido!');
        } catch (error) {
          console.log('Índice não existe ou erro:', error.message);
        }

        // Remover a coluna
        await queryInterface.removeColumn('processos', 'update_for');
        console.log('Coluna "update_for" removida da tabela "processos"!');
      } else {
        console.log('Coluna "update_for" não existe na tabela "processos".');
      }
    } catch (error) {
      console.log('Erro ao remover coluna ou tabela não existe:', error.message);
    }
  }
};
