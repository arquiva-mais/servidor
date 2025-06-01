'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE processos
      SET
        interessado = COALESCE(interessado, ''),
        orgao_gerador = COALESCE(orgao_gerador, ''),
        responsavel = COALESCE(responsavel, ''),
        setor_atual = COALESCE(setor_atual, '')
      WHERE
        interessado IS NULL OR
        orgao_gerador IS NULL OR
        responsavel IS NULL OR
        setor_atual IS NULL
    `);

    // Depois, alterar as colunas para NOT NULL
    await queryInterface.changeColumn('processos', 'interessado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.changeColumn('processos', 'orgao_gerador', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.changeColumn('processos', 'responsavel', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.changeColumn('processos', 'setor_atual', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('processos', 'interessado', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('processos', 'orgao_gerador', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('processos', 'responsavel', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('processos', 'setor_atual', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
