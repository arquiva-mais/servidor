'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('usuarios', 'refresh_token_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'refresh_token');
    await queryInterface.removeColumn('usuarios', 'refresh_token_expires');
  }
};
