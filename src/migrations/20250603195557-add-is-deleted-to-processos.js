'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela existe
      const tableDescription = await queryInterface.describeTable('processos');

      // Verificar se a coluna já existe
      if (tableDescription.is_deleted) {
        console.log('Coluna "is_deleted" já existe na tabela "processos", pulando criação...');
        return;
      }

      // Adicionar a coluna is_deleted
      await queryInterface.addColumn('processos', 'is_deleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });

      console.log('Coluna "is_deleted" adicionada com sucesso na tabela "processos"!');

      // Criar índice para melhor performance em consultas de soft delete
      try {
        await queryInterface.addIndex('processos', ['is_deleted'], {
          name: 'idx_processos_is_deleted'
        });
        console.log('Índice para "is_deleted" criado com sucesso!');
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

      if (tableDescription.is_deleted) {
        try {
          await queryInterface.removeIndex('processos', 'idx_processos_is_deleted');
          console.log('Índice "idx_processos_is_deleted" removido!');
        } catch (error) {
          console.log('Índice não existe ou erro:', error.message);
        }

        // Remover a coluna
        await queryInterface.removeColumn('processos', 'is_deleted');
        console.log('Coluna "is_deleted" removida da tabela "processos"!');
      } else {
        console.log('Coluna "is_deleted" não existe na tabela "processos".');
      }
    } catch (error) {
      console.log('Erro ao remover coluna ou tabela não existe:', error.message);
    }
  }
};
