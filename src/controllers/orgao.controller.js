const orgaoService = require('../services/orgao.service');

exports.listar = async (req, res) => {
  try {
    const orgaos = await orgaoService.listarOrgaos(req.query);
    res.json(orgaos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar órgãos' });
  }
};

exports.criar = async (req, res) => {
  try {
    const orgao = await orgaoService.criarOrgao(req.body);
    res.status(201).json(orgao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const orgao = await orgaoService.atualizarOrgao(req.params.id, req.body);
    res.json(orgao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const orgao = await orgaoService.buscarOrgaoPorId(req.params.id);
    if (!orgao) return res.status(404).json({ error: 'Órgão não encontrado' });
    res.json(orgao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar órgão' });
  }
};

module.exports = exports;