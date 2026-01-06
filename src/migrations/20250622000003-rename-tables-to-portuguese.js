'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename objects -> objetos
    const objectsTableExists = await queryInterface.tableExists('objects');
    if (objectsTableExists) {
      await queryInterface.renameTable('objects', 'objetos');
    }

    // Rename creditors -> credores
    const creditorsTableExists = await queryInterface.tableExists('creditors');
    if (creditorsTableExists) {
      await queryInterface.renameTable('creditors', 'credores');
    }

    // Rename bodies -> orgaos_geradores
    const bodiesTableExists = await queryInterface.tableExists('bodies');
    if (bodiesTableExists) {
      await queryInterface.renameTable('bodies', 'orgaos_geradores');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert renaming
    const objetosTableExists = await queryInterface.tableExists('objetos');
    if (objetosTableExists) {
      await queryInterface.renameTable('objetos', 'objects');
    }

    const credoresTableExists = await queryInterface.tableExists('credores');
    if (credoresTableExists) {
      await queryInterface.renameTable('credores', 'creditors');
    }

    const orgaosGeradoresTableExists = await queryInterface.tableExists('orgaos_geradores');
    if (orgaosGeradoresTableExists) {
      await queryInterface.renameTable('orgaos_geradores', 'bodies');
    }
  }
};
