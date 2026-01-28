'use strict';

/**
 * Migração CONSOLIDADA de Roles para Sistema Hierárquico
 * 
 * Esta migração funciona independente do estado atual do banco:
 * - Se tem (admin, user) → converte para novos valores
 * - Se já tem valores intermediários → converte para novos valores
 * 
 * Conversão aplicada:
 *   - admin    → admin       (Nível 99 - mantém)
 *   - user     → editor      (Nível 2 - upgrade padrão)
 *   - operador → tramitador  (caso exista)
 *   - tecnico  → editor      (caso exista)
 *   - gestor   → moderador   (caso exista)
 *   - diretor  → gestor      (caso exista)
 * 
 * Novos valores:
 *   - tramitador (Nível 1):  Visualiza e tramita
 *   - editor     (Nível 2):  Cadastra e edita
 *   - moderador  (Nível 3):  Exclui e atribui
 *   - gestor     (Nível 4):  Prioriza
 *   - admin      (Nível 99): Gestão total
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('========================================');
      console.log('Iniciando migração de roles para sistema hierárquico...');
      console.log('========================================');

      // 1. Alterar a coluna para STRING para poder manipular os valores
      console.log('\n[1/5] Alterando coluna role para STRING temporariamente...');
      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR(20)`,
        { transaction }
      );

      // 2. Converter TODOS os valores possíveis para os novos usando CASE
      console.log('\n[2/5] Convertendo roles para novos valores...');
      const [result] = await queryInterface.sequelize.query(
        `UPDATE usuarios SET role = CASE role
          WHEN 'user' THEN 'editor'
          WHEN 'operador' THEN 'tramitador'
          WHEN 'tecnico' THEN 'editor'
          WHEN 'gestor' THEN 'moderador'
          WHEN 'diretor' THEN 'gestor'
          ELSE role
        END
        RETURNING role`,
        { transaction }
      );
      console.log(`   → ${result.length} usuários processados`);

      // 3. Dropar o ENUM antigo (qualquer que seja)
      console.log('\n[3/5] Removendo ENUM antigo...');
      try {
        await queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS "enum_usuarios_role" CASCADE',
          { transaction }
        );
        console.log('   → ENUM removido');
      } catch (e) {
        console.log('   → ENUM não existia');
      }

      // 4. Criar novo ENUM com os valores finais
      console.log('\n[4/5] Criando novo ENUM...');
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_usuarios_role" AS ENUM ('tramitador', 'editor', 'moderador', 'gestor', 'admin')`,
        { transaction }
      );

      // 5. Converter a coluna de volta para ENUM e definir default
      console.log('\n[5/5] Convertendo coluna para novo ENUM...');
      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios 
         ALTER COLUMN role TYPE "enum_usuarios_role" 
         USING role::"enum_usuarios_role"`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios ALTER COLUMN role SET DEFAULT 'tramitador'`,
        { transaction }
      );

      // Criar índice para melhor performance
      try {
        await queryInterface.addIndex('usuarios', ['role'], {
          name: 'idx_usuarios_role_hierarchy',
          transaction
        });
        console.log('   → Índice criado');
      } catch (e) {
        console.log('   → Índice já existe');
      }

      await transaction.commit();

      console.log('\n========================================');
      console.log('✅ Migração concluída com sucesso!');
      console.log('');
      console.log('📋 Conversão aplicada:');
      console.log('   admin    → admin       (Nível 99)');
      console.log('   user     → editor      (Nível 2)');
      console.log('   operador → tramitador  (Nível 1)');
      console.log('   tecnico  → editor      (Nível 2)');
      console.log('   gestor   → moderador   (Nível 3)');
      console.log('   diretor  → gestor      (Nível 4)');
      console.log('');
      console.log('🔐 Nova hierarquia de permissões:');
      console.log('   tramitador (1):  Visualiza e tramita');
      console.log('   editor     (2):  Cadastra e edita');
      console.log('   moderador  (3):  Exclui e atribui');
      console.log('   gestor     (4):  Prioriza');
      console.log('   admin      (99): Gestão total');
      console.log('========================================');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Erro na migração:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Revertendo migração de roles...');

      // 1. Alterar coluna para STRING
      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR(20)`,
        { transaction }
      );

      // 2. Converter para valores antigos (admin/user)
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET role = CASE role
          WHEN 'tramitador' THEN 'user'
          WHEN 'editor' THEN 'user'
          WHEN 'moderador' THEN 'user'
          WHEN 'gestor' THEN 'user'
          ELSE role
        END`,
        { transaction }
      );

      // 3. Dropar ENUM novo
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_usuarios_role" CASCADE',
        { transaction }
      );

      // 4. Criar ENUM antigo
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_usuarios_role" AS ENUM ('admin', 'user')`,
        { transaction }
      );

      // 5. Converter coluna para ENUM antigo
      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios 
         ALTER COLUMN role TYPE "enum_usuarios_role" 
         USING role::"enum_usuarios_role"`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE usuarios ALTER COLUMN role SET DEFAULT 'user'`,
        { transaction }
      );

      // Remover índice
      try {
        await queryInterface.removeIndex('usuarios', 'idx_usuarios_role_hierarchy', { transaction });
      } catch (e) {
        // Índice pode não existir
      }

      await transaction.commit();
      console.log('✅ Reversão concluída!');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
