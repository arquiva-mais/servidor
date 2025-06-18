const Processo = require('../models/processo.model');
const { Op } = require('sequelize');

async function listarProcessos(filtros, paginacao = {}) {
  const { busca, setor, objeto, data_inicio, data_fim, orgao_id, status } = filtros;
  const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc' } = paginacao;
  const where = {
    is_deleted: false
  };

  if (busca) {
    where[Op.or] = [
      { numero_processo: { [Op.iLike]: `%${busca}%` } },
      { interessado: { [Op.iLike]: `%${busca}%` } },
      { objeto: { [Op.iLike]: `%${busca}%` } },
      { setor_atual: { [Op.iLike]: `%${busca}%` } },
    ];
  }

  //if (concluido !== undefined) where.concluido = concluido === 'true';
  if (setor) where.setor_atual = setor;
  if (objeto) where.objeto = objeto;
  if (orgao_id) where.orgao_id = orgao_id;
  if (status) where.status = status

  if (data_inicio || data_fim) {
    where.data_entrada = {};
    if (data_inicio) where.data_entrada[Op.gte] = data_inicio;
    if (data_fim) where.data_entrada[Op.lte] = data_fim;
  }

  const offset = (page - 1) * limit;

  const fieldMapping = {
    'numero_processo': 'numero_processo',
    'objeto': 'objeto',
    'interessado': 'interessado',
    'orgao_gerador': 'orgao_gerador',
    'responsavel': 'responsavel',
    'setor_atual': 'setor_atual',
    'status': 'status',
    'data_entrada': 'data_entrada',
    'competencia': 'competencia',
    'valor_convenio': 'valor_convenio',
    'valor_recurso_proprio': 'valor_recurso_proprio',
    'valor_royalties': 'valor_royalties',
    'valor_total': 'total'
  };

  const orderField = fieldMapping[sortBy] || 'data_entrada';
  const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const resultado = await Processo.findAndCountAll({
    where,
    include: {
      model: require('../models/orgao.model'),
      as: 'orgao',
      attributes: ['id', 'nome', 'tipo']
    },
    order: [[orderField, orderDirection]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const totalPaginas = Math.ceil(resultado.count / limit);

  return {
    processos: resultado.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: totalPaginas,
      totalItems: resultado.count,
      itemsPerPage: parseInt(limit)
    }
  };
}

async function listarProcessoPorId(processo_id) {
  return await Processo.findOne({
    where: { id: processo_id },
    include: {
      model: require('../models/orgao.model'),
      as: 'orgao',
      attributes: ['id', 'nome', 'tipo']
    }
  });
}

async function criarProcesso(dados, usuarioLogado) {
  try {
    const existe = await Processo.findOne({
      where: {
        numero_processo: dados.numero_processo,
        orgao_id: usuarioLogado.orgao_id
      }
    });
    if (existe) throw new Error('Já existe um processo com esse número neste órgão');

    const valores = ['valor_convenio', 'valor_recurso_proprio', 'valor_royalties'].reduce((acc, key) => {
      acc[key] = parseFloat(dados[key]) || 0;
      return acc;
    }, {});

    const total = valores.valor_convenio + valores.valor_recurso_proprio + valores.valor_royalties;

    const dadosProcesso = {
      ...dados,
      ...valores,
      orgao_id: usuarioLogado.orgao_id,
      responsavel: usuarioLogado.nome,
      concluido: false,
      total,
      data_entrada: dados.data_entrada || new Date().toISOString().split('T')[0],
    };

    return await Processo.create(dadosProcesso);
  } catch (error) {
    console.error('Erro detalhado ao criar processo:', error);
    throw error;
  }
}

async function atualizarProcesso(id, dados, user_logado) {
  const processo = await Processo.findByPk(id);
  if (!processo) throw new Error('Processo não encontrado');
  const valores = ['valor_convenio', 'valor_recurso_proprio', 'valor_royalties'].reduce((acc, key) => {
    acc[key] = parseFloat(dados[key]) || 0;
    return acc;
  }, {});

  const total = valores.valor_convenio + valores.valor_recurso_proprio + valores.valor_royalties;

  return processo.update({
    ...dados,
    ...valores,
    total,
    data_atualizacao: new Date(),
    update_for: user_logado.nome
  });
}

async function deletarProcesso(id) {
  const processo = await Processo.scope('withDeleted').findOne({
    where: {
      id: id,
      is_deleted: false
    }
  });

  if (!processo) throw new Error('Processo não encontrado');

  await processo.update({ is_deleted: true });
  return { message: 'Processo deletado com sucesso' };
}

module.exports = { listarProcessos, listarProcessoPorId, criarProcesso, atualizarProcesso, deletarProcesso };
