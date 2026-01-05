const Objeto = require('../models/objeto.model');
const Credor = require('../models/credor.model');
const OrgaoGerador = require('../models/orgaoGerador.model');
const Setor = require('../models/setor.model');
const Processo = require('../models/processo.model');
const { Op } = require('sequelize');

/**
 * Função genérica para conectar ou criar um registro em uma tabela de domínio
 * @param {Model} Model - O model do Sequelize
 * @param {string|number} value - O valor (pode ser ID ou nome)
 * @returns {Promise<number>} - Retorna o ID do registro
 */
async function connectOrCreate(Model, value) {
  if (!value) return null;

  // Se for um número, assume que é um ID e tenta encontrar
  if (typeof value === 'number' || !isNaN(value)) {
    const existing = await Model.findByPk(value);
    if (existing) return existing.id;
  }

  // Se for string, procura pelo nome ou cria
  if (typeof value === 'string') {
    const [record] = await Model.findOrCreate({
      where: { nome: value.trim() },
      defaults: { nome: value.trim() }
    });
    return record.id;
  }

  return null;
}

// Objects (Objetos)
async function listObjects(search = '') {
  const where = search ? { nome: { [Op.iLike]: `%${search}%` } } : {};
  return await Objeto.findAll({
    where,
    order: [['nome', 'ASC']]
  });
}

async function createObject(nome) {
  const [record, created] = await Objeto.findOrCreate({
    where: { nome: nome.trim() },
    defaults: { nome: nome.trim() }
  });
  return { record, created };
}

async function updateObject(id, newNome) {
  const objeto = await Objeto.findByPk(id);
  if (!objeto) throw new Error('Objeto não encontrado');

  // Verifica se já existe outro com esse nome
  const existing = await Objeto.findOne({
    where: {
      nome: newNome.trim(),
      id: { [Op.ne]: id }
    }
  });
  if (existing) throw new Error('Já existe um objeto com este nome');

  await objeto.update({ nome: newNome.trim() });
  return objeto;
}

async function deleteObject(id) {
  const objeto = await Objeto.findByPk(id);
  if (!objeto) throw new Error('Objeto não encontrado');

  // Verifica se está em uso
  const inUse = await Processo.count({ where: { objeto_id: id } });
  if (inUse > 0) {
    throw new Error(`Este objeto está sendo usado em ${inUse} processo(s) e não pode ser excluído`);
  }

  await objeto.destroy();
}

// Creditors (Credores)
async function listCreditors(search = '') {
  const where = search ? { nome: { [Op.iLike]: `%${search}%` } } : {};
  return await Credor.findAll({
    where,
    order: [['nome', 'ASC']]
  });
}

async function createCreditor(nome) {
  const [record, created] = await Credor.findOrCreate({
    where: { nome: nome.trim() },
    defaults: { nome: nome.trim() }
  });
  return { record, created };
}

async function updateCreditor(id, newNome) {
  const credor = await Credor.findByPk(id);
  if (!credor) throw new Error('Credor não encontrado');

  // Verifica se já existe outro com esse nome
  const existing = await Credor.findOne({
    where: {
      nome: newNome.trim(),
      id: { [Op.ne]: id }
    }
  });
  if (existing) throw new Error('Já existe um credor com este nome');

  await credor.update({ nome: newNome.trim() });
  return credor;
}

async function deleteCreditor(id) {
  const credor = await Credor.findByPk(id);
  if (!credor) throw new Error('Credor não encontrado');

  const inUse = await Processo.count({ where: { credor_id: id } });
  if (inUse > 0) {
    throw new Error(`Este credor está sendo usado em ${inUse} processo(s) e não pode ser excluído`);
  }

  await credor.destroy();
}

// Bodies (Órgãos Geradores)
async function listBodies(search = '') {
  const where = search ? { nome: { [Op.iLike]: `%${search}%` } } : {};
  return await OrgaoGerador.findAll({
    where,
    order: [['nome', 'ASC']]
  });
}

async function createBody(nome) {
  const [record, created] = await OrgaoGerador.findOrCreate({
    where: { nome: nome.trim() },
    defaults: { nome: nome.trim() }
  });
  return { record, created };
}

async function updateBody(id, newNome) {
  const orgaoGerador = await OrgaoGerador.findByPk(id);
  if (!orgaoGerador) throw new Error('Órgão gerador não encontrado');

  const existing = await OrgaoGerador.findOne({
    where: {
      nome: newNome.trim(),
      id: { [Op.ne]: id }
    }
  });
  if (existing) throw new Error('Já existe um órgão gerador com este nome');

  await orgaoGerador.update({ nome: newNome.trim() });
  return orgaoGerador;
}

async function deleteBody(id) {
  const orgaoGerador = await OrgaoGerador.findByPk(id);
  if (!orgaoGerador) throw new Error('Órgão gerador não encontrado');

  const inUse = await Processo.count({ where: { orgao_gerador_id: id } });
  if (inUse > 0) {
    throw new Error(`Este órgão gerador está sendo usado em ${inUse} processo(s) e não pode ser excluído`);
  }

  await orgaoGerador.destroy();
}

// Sectors (Setores)
async function listSectors(search = '') {
  const where = search ? { nome: { [Op.iLike]: `%${search}%` } } : {};
  return await Setor.findAll({
    where,
    order: [['nome', 'ASC']]
  });
}

async function createSector(nome) {
  const [record, created] = await Setor.findOrCreate({
    where: { nome: nome.trim() },
    defaults: { nome: nome.trim() }
  });
  return { record, created };
}

async function updateSector(id, newNome) {
  const setor = await Setor.findByPk(id);
  if (!setor) throw new Error('Setor não encontrado');

  const existing = await Setor.findOne({
    where: {
      nome: newNome.trim(),
      id: { [Op.ne]: id }
    }
  });
  if (existing) throw new Error('Já existe um setor com este nome');

  await setor.update({ nome: newNome.trim() });
  return setor;
}

async function deleteSector(id) {
  const setor = await Setor.findByPk(id);
  if (!setor) throw new Error('Setor não encontrado');

  const inUse = await Processo.count({ where: { setor_id: id } });
  if (inUse > 0) {
    throw new Error(`Este setor está sendo usado em ${inUse} processo(s) e não pode ser excluído`);
  }

  await setor.destroy();
}

module.exports = {
  connectOrCreate,
  // Objects
  listObjects,
  createObject,
  updateObject,
  deleteObject,
  // Creditors
  listCreditors,
  createCreditor,
  updateCreditor,
  deleteCreditor,
  // Bodies
  listBodies,
  createBody,
  updateBody,
  deleteBody,
  // Sectors
  listSectors,
  createSector,
  updateSector,
  deleteSector
};
