'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, verificar se já existe um órgão
    const [orgaos] = await queryInterface.sequelize.query(
      `SELECT id FROM orgaos LIMIT 1;`
    );

    let orgaoId;

    if (orgaos.length === 0) {
      // Criar órgão padrão
      const [result] = await queryInterface.sequelize.query(
        `INSERT INTO orgaos (nome, cnpj, tipo, ativo, "createdAt", "updatedAt") 
         VALUES ('Prefeitura Municipal', '00.000.000/0001-00', 'PREFEITURA', true, NOW(), NOW()) 
         RETURNING id;`
      );
      orgaoId = result[0].id;
      console.log('Órgão padrão criado com sucesso!');
    } else {
      orgaoId = orgaos[0].id;
      console.log('Usando órgão existente.');
    }

    // Verificar se já existe um usuário admin
    const [usuarios] = await queryInterface.sequelize.query(
      `SELECT id FROM usuarios WHERE email = 'admin@arquivamais.com' LIMIT 1;`
    );

    if (usuarios.length > 0) {
      console.log('Usuário admin já existe, pulando criação...');
      return;
    }

    // Criar senha hash
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Inserir usuário admin
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador',
      email: 'admin@arquivamais.com',
      senha: senhaHash,
      role: 'admin',
      orgao_id: orgaoId,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    console.log('========================================');
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@arquivamais.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('========================================');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: 'admin@arquivamais.com'
    }, {});
    
    console.log('Usuário admin removido com sucesso!');
  }
};
