const Processo = require('../models/processo.model');
const { Op } = require('sequelize');

async function listarProcessos(filtros, paginacao = {}) {
  const { busca, concluido, setor, objeto, data_inicio, data_fim } = filtros;
  const { page = 1, limit = 10 } = paginacao;

  const where = {};

  if (busca) {
    where[Op.or] = [
      { numero_processo: { [Op.iLike]: `%${busca}%` } },
      { interessado: { [Op.iLike]: `%${busca}%` } },
      { objeto: { [Op.iLike]: `%${busca}%` } },
      { setor_atual: { [Op.iLike]: `%${busca}%` } },
    ];
  }

  if (concluido !== undefined) where.concluido = concluido === 'true';
  if (setor) where.setor_atual = setor;
  if (objeto) where.objeto = objeto;
  if (data_inicio || data_fim) {
    where.data_entrada = {};
    if (data_inicio) where.data_entrada[Op.gte] = data_inicio;
    if (data_fim) where.data_entrada[Op.lte] = data_fim;
  }

  // Calcular offset
  const offset = (page - 1) * limit;

  const resultado = await Processo.findAndCountAll({
    where,
    order: [['data_entrada', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Calcular informações de paginação
  const totalPaginas = Math.ceil(resultado.count / limit);

  return {
    processos: resultado.rows, // Os dados estão em 'rows' no Sequelize
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(resultado.count / limit),
      totalItems: resultado.count, // Total está em 'count' no Sequelize
      itemsPerPage: parseInt(limit)
    }
  };
}

async function listarProcessoPorId(processo_id) {
  return await Processo.findOne({ where: { id: processo_id } })
}

async function criarProcesso(dados) {
  const existe = await Processo.findOne({ where: { numero_processo: dados.numero_processo } });
  if (existe) throw new Error('Já existe um processo com esse número');

  const valores = ['valor_convenio', 'valor_recurso_proprio', 'valor_royalties'].reduce((acc, key) => {
    acc[key] = parseFloat(dados[key]) || 0;
    return acc;
  }, {});

  const total = valores.valor_convenio + valores.valor_recurso_proprio + valores.valor_royalties;

  return Processo.create({
    ...dados,
    ...valores,
    concluido: false,
    total,
    data_atualizacao: new Date(),
    data_entrada: dados.data_entrada || new Date().toISOString().split('T')[0],
  });
}

async function atualizarProcesso(id, dados) {
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
  });
}

async function deletarProcesso(id) {
  const processo = await Processo.findByPk(id);
  if (!processo) throw new Error('Processo não encontrado');
  return processo.destroy();
}

module.exports = { listarProcessos, listarProcessoPorId, criarProcesso, atualizarProcesso, deletarProcesso };
