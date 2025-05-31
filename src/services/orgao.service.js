const Orgao = require('../models/orgao.model');
const { Op } = require('sequelize');

async function listarOrgaos(filtros = {}) {
  const { busca, tipo, ativo } = filtros;
  const where = {};

  if (busca) {
    where[Op.or] = [
      { nome: { [Op.iLike]: `%${busca}%` } },
      { cnpj: { [Op.iLike]: `%${busca}%` } },
      { responsavel: { [Op.iLike]: `%${busca}%` } }
    ];
  }

  if (tipo) where.tipo = tipo;
  if (ativo !== undefined) where.ativo = ativo === 'true';

  return Orgao.findAll({
    where,
    order: [['nome', 'ASC']],
    include: [
      {
        association: 'usuarios',
        attributes: ['id', 'nome', 'email', 'role'],
        where: { ativo: true },
        required: false
      }
    ]
  });
}

async function criarOrgao(dados) {
  const { nome, cnpj } = dados;

  // Verificar se já existe
  const existeNome = await Orgao.findOne({ where: { nome } });
  if (existeNome) throw new Error('Já existe um órgão com este nome');

  const existeCnpj = await Orgao.findOne({ where: { cnpj } });
  if (existeCnpj) throw new Error('Já existe um órgão com este CNPJ');

  return Orgao.create(dados);
}

async function atualizarOrgao(id, dados) {
  const orgao = await Orgao.findByPk(id);
  if (!orgao) throw new Error('Órgão não encontrado');

  return orgao.update(dados);
}

async function buscarOrgaoPorId(id) {
  return Orgao.findByPk(id, {
    include: [
      {
        association: 'usuarios',
        attributes: ['id', 'nome', 'email', 'role', 'ativo']
      },
      {
        association: 'processos',
        attributes: ['id', 'numero_processo', 'objeto', 'concluido'],
        limit: 10,
        order: [['data_entrada', 'DESC']]
      }
    ]
  });
}

module.exports = {
  listarOrgaos,
  criarOrgao,
  atualizarOrgao,
  buscarOrgaoPorId
};