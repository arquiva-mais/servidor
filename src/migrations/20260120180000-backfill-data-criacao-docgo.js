'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() !== 'postgres') {
      console.log('Migration skipped: This migration depends on PostgreSQL specific functions (make_date, substring, trim).');
      return;
    }

    try {
      // Updates data_criacao_docgo for existing records based on numero_processo pattern (AAAA.DDMM...)
      // Uses TRIM() to handle potential leading whitespace issues found in production data
      await queryInterface.sequelize.query(`
        UPDATE processos
        SET data_criacao_docgo = make_date(
          CAST(substring(TRIM(numero_processo) from 1 for 4) AS INTEGER),
          CAST(substring(TRIM(numero_processo) from 8 for 2) AS INTEGER), -- Month
          CAST(substring(TRIM(numero_processo) from 6 for 2) AS INTEGER)  -- Day
        )
        WHERE data_criacao_docgo IS NULL
        AND TRIM(numero_processo) ~ '^\\d{4}\\.\\d{4}'
        AND CAST(substring(TRIM(numero_processo) from 8 for 2) AS INTEGER) BETWEEN 1 AND 12
        AND CAST(substring(TRIM(numero_processo) from 6 for 2) AS INTEGER) BETWEEN 1 AND 31;
      `);

      console.log('Successfully backfilled data_criacao_docgo.');
    } catch (error) {
      console.error('Error backfilling data_criacao_docgo:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // No action needed for rollback as it's a data fix
  }
};
