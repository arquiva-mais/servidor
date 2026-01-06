const service = require('../services/domain.service');

// ===== OBJECTS =====
exports.listObjects = async (req, res) => {
  try {
    const { search } = req.query;
    const objects = await service.listObjects(search);
    res.json(objects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar objetos' });
  }
};

exports.createObject = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const { record, created } = await service.createObject(nome);
    res.status(created ? 201 : 200).json(record);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateObject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const object = await service.updateObject(id, nome);
    res.json(object);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteObject = async (req, res) => {
  try {
    const { id } = req.params;
    await service.deleteObject(id);
    res.json({ message: 'Objeto excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ===== CREDITORS =====
exports.listCreditors = async (req, res) => {
  try {
    const { search } = req.query;
    const creditors = await service.listCreditors(search);
    res.json(creditors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar credores' });
  }
};

exports.createCreditor = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const { record, created } = await service.createCreditor(nome);
    res.status(created ? 201 : 200).json(record);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateCreditor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const creditor = await service.updateCreditor(id, nome);
    res.json(creditor);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCreditor = async (req, res) => {
  try {
    const { id } = req.params;
    await service.deleteCreditor(id);
    res.json({ message: 'Credor excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ===== BODIES =====
exports.listBodies = async (req, res) => {
  try {
    const { search } = req.query;
    const bodies = await service.listBodies(search);
    res.json(bodies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar órgãos geradores' });
  }
};

exports.createBody = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const { record, created } = await service.createBody(nome);
    res.status(created ? 201 : 200).json(record);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateBody = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const body = await service.updateBody(id, nome);
    res.json(body);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBody = async (req, res) => {
  try {
    const { id } = req.params;
    await service.deleteBody(id);
    res.json({ message: 'Órgão gerador excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ===== SECTORS =====
exports.listSectors = async (req, res) => {
  try {
    const { search } = req.query;
    const sectors = await service.listSectors(search);
    res.json(sectors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar setores' });
  }
};

exports.createSector = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const { record, created } = await service.createSector(nome);
    res.status(created ? 201 : 200).json(record);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const sector = await service.updateSector(id, nome);
    res.json(sector);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSector = async (req, res) => {
  try {
    const { id } = req.params;
    await service.deleteSector(id);
    res.json({ message: 'Setor excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
