const Processo = require('../models/processo.model');
const { Op } = require('sequelize');
const domainService = require('./domain.service');
const Objeto = require('../models/objeto.model');
const Credor = require('../models/credor.model');
const OrgaoGerador = require('../models/orgaoGerador.model');
const Setor = require('../models/setor.model');
const StatusProcesso = require('../enums/processo.enum.js'); // Assuming usage might be needed, but strictly for the filter logic below

async function listarProcessos(filtros, paginacao = {}) {
  const { busca, setor, objeto, data_inicio, data_fim, orgao_id, status } = filtros;
  const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc' } = paginacao;
  const where = {
    is_deleted: false
  };

  if (busca) {
    where[Op.or] = [
      { numero_processo: { [Op.iLike]: `%${busca}%` } },
      { credor: { [Op.iLike]: `%${busca}%` } },
      { objeto: { [Op.iLike]: `%${busca}%` } },
      { setor_atual: { [Op.iLike]: `%${busca}%` } },
    ];
  }

  //if (concluido !== undefined) where.concluido = concluido === 'true';
  if (setor) where.setor_atual = setor;
  if (objeto) where.objeto = objeto;
  if (orgao_id) where.orgao_id = orgao_id;

  // Lógica de status atualizada:
  // Se status explicitamente informado, usa ele.
  // Se não, busca apenas os permitidos (removendo implicitamente 'cancelado' se ainda existir no DB)
  if (status) {
    where.status = status;
  } else {
    // Se nenhum status for passado, listar 'em_andamento' e 'concluido'
    // Evita trazer 'cancelado' se houver lixo no banco
    where.status = { [Op.in]: ['em_andamento', 'concluido'] };
  }

  if (data_inicio || data_fim) {
    where.data_entrada = {};
    if (data_inicio) where.data_entrada[Op.gte] = data_inicio;
    if (data_fim) where.data_entrada[Op.lte] = data_fim;
  }

  const offset = (page - 1) * limit;

  const fieldMapping = {
    'numero_processo': 'numero_processo',
    'objeto': 'objeto',
    'credor': 'credor',
    'interessado': 'credor', // Mapeamento para compatibilidade com frontend antigo
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
    include: [
      {
        model: require('../models/orgao.model'),
        as: 'orgao',
        attributes: ['id', 'nome', 'tipo']
      },
      {
        model: Objeto,
        as: 'objetoLookup',
        attributes: ['id', 'nome']
      },
      {
        model: Credor,
        as: 'credorLookup',
        attributes: ['id', 'nome']
      },
      {
        model: OrgaoGerador,
        as: 'orgaoGeradorLookup',
        attributes: ['id', 'nome']
      },
      {
        model: Setor,
        as: 'setorLookup',
        attributes: ['id', 'nome']
      }
    ],
    order: [[orderField, orderDirection]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const totalPaginas = Math.ceil(resultado.count / limit);

  const processosComDias = resultado.rows.map(p => {
    const processo = p.toJSON();
    
    // Se o processo estiver concluído, não calcula dias no setor
    if (processo.status === 'concluido') {
      processo.dias_no_setor = null;
      return processo;
    }

    let dataRef = processo.data_ultima_movimentacao;
    if (!dataRef) {
       dataRef = processo.createdAt || processo.data_entrada;
    }

    if (dataRef) {
      const now = new Date();
      const moveDate = new Date(dataRef);
      
      // Resetar horas para comparar apenas as datas (dias corridos)
      // Isso garante que "ontem" seja sempre 1 dia, independente da hora
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateRef = new Date(moveDate.getFullYear(), moveDate.getMonth(), moveDate.getDate());
      
      const diffTime = Math.abs(today - dateRef);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      processo.dias_no_setor = diffDays;
    } else {
      processo.dias_no_setor = 0;
    }
    
    return processo;
  });

  return {
    processos: processosComDias,
    pagination: {
      currentPage: parseInt(page),
      totalPages: totalPaginas,
      totalItems: resultado.count,
      itemsPerPage: parseInt(limit)
    }
  };
}

async function listarTodosProcessosPorOrgao(orgao_id) {
  try {
    if (!orgao_id) {
      throw new Error('ID do orgão não fornecido.')
    }

    const processos = await Processo.findAll({
      attributes: ['status', 'valor_convenio', 'valor_recurso_proprio', 'valor_royalties', 'total'],
      where: {
        orgao_id: orgao_id,
        is_deleted: false
      },
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      processos: processos
    }
  } catch {
    throw new Error('Erro ao buscar processos')
  }
}


async function listarProcessoPorId(processo_id) {
  return await Processo.findOne({
    where: { id: processo_id },
    include: [
      {
        model: require('../models/orgao.model'),
        as: 'orgao',
        attributes: ['id', 'nome', 'tipo']
      },
      {
        model: Objeto,
        as: 'objetoLookup',
        attributes: ['id', 'nome']
      },
      {
        model: Credor,
        as: 'credorLookup',
        attributes: ['id', 'nome']
      },
      {
        model: OrgaoGerador,
        as: 'orgaoGeradorLookup',
        attributes: ['id', 'nome']
      },
      {
        model: Setor,
        as: 'setorLookup',
        attributes: ['id', 'nome']
      }
    ]
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

    // Processar campos de domínio usando connectOrCreate
    const objeto_id = await domainService.connectOrCreate(Objeto, dados.objeto);
    const credor_id = await domainService.connectOrCreate(Credor, dados.credor);
    const orgao_gerador_id = await domainService.connectOrCreate(OrgaoGerador, dados.orgao_gerador);
    const setor_id = await domainService.connectOrCreate(Setor, dados.setor_atual);

    const dadosProcesso = {
      ...dados,
      ...valores,
      orgao_id: usuarioLogado.orgao_id,
      responsavel: usuarioLogado.nome,
      concluido: false,
      total,
      data_entrada: dados.data_entrada || new Date().toISOString().split('T')[0],
      objeto_id,
      credor_id,
      orgao_gerador_id,
      setor_id
    };

    return await Processo.create(dadosProcesso);
  } catch (error) {
    console.error('Erro detalhado ao criar processo:', error);
    throw error;
  }
}

async function atualizarProcesso(id, dados, user_logado) {
  try {
    const processo = await Processo.findByPk(id);
    if (!processo) throw new Error('Processo não encontrado');

    // Cria objeto de atualização apenas com campos definidos
    const dadosAtualizacao = {};

    // Processar campos de domínio se fornecidos
    if (dados.objeto !== undefined) {
      const objeto_id = await domainService.connectOrCreate(Objeto, dados.objeto);
      if (objeto_id) dadosAtualizacao.objeto_id = objeto_id;
      dadosAtualizacao.objeto = dados.objeto;
    }
    if (dados.credor !== undefined) {
      const credor_id = await domainService.connectOrCreate(Credor, dados.credor);
      if (credor_id) dadosAtualizacao.credor_id = credor_id;
      dadosAtualizacao.credor = dados.credor;
    }
    if (dados.orgao_gerador !== undefined) {
      const orgao_gerador_id = await domainService.connectOrCreate(OrgaoGerador, dados.orgao_gerador);
      if (orgao_gerador_id) dadosAtualizacao.orgao_gerador_id = orgao_gerador_id;
      dadosAtualizacao.orgao_gerador = dados.orgao_gerador;
    }
    if (dados.setor_atual !== undefined) {
      const setor_id = await domainService.connectOrCreate(Setor, dados.setor_atual);
      if (setor_id) dadosAtualizacao.setor_id = setor_id;
      dadosAtualizacao.setor_atual = dados.setor_atual;
      
      // Se o setor mudou, atualiza a data de última movimentação
      if (dados.setor_atual !== processo.setor_atual) {
        dadosAtualizacao.data_ultima_movimentacao = new Date();
      }
    }

    // Copia todos os campos de dados, exceto os valores financeiros e campos de domínio
    Object.keys(dados).forEach(key => {
      if (!['valor_convenio', 'valor_recurso_proprio', 'valor_royalties', 'objeto', 'credor', 'orgao_gerador', 'setor_atual'].includes(key)) {
        dadosAtualizacao[key] = dados[key];
      }
    });

    // Processa valores financeiros apenas se foram enviados
    let hasValueUpdate = false;

    const hasValorConvenio = dados.valor_convenio !== undefined && dados.valor_convenio !== null && dados.valor_convenio !== '';
    const hasValorRecursoProprio = dados.valor_recurso_proprio !== undefined && dados.valor_recurso_proprio !== null && dados.valor_recurso_proprio !== '';
    const hasValorRoyalties = dados.valor_royalties !== undefined && dados.valor_royalties !== null && dados.valor_royalties !== '';

    if (hasValorConvenio) {
      dadosAtualizacao.valor_convenio = parseFloat(dados.valor_convenio) || 0;
      hasValueUpdate = true;
    }
    if (hasValorRecursoProprio) {
      dadosAtualizacao.valor_recurso_proprio = parseFloat(dados.valor_recurso_proprio) || 0;
      hasValueUpdate = true;
    }
    if (hasValorRoyalties) {
      dadosAtualizacao.valor_royalties = parseFloat(dados.valor_royalties) || 0;
      hasValueUpdate = true;
    }

    // Recalcula o total apenas se houver atualização de valores
    if (hasValueUpdate) {
      const vConvenio = dadosAtualizacao.valor_convenio !== undefined ? dadosAtualizacao.valor_convenio : processo.valor_convenio;
      const vRecurso = dadosAtualizacao.valor_recurso_proprio !== undefined ? dadosAtualizacao.valor_recurso_proprio : processo.valor_recurso_proprio;
      const vRoyalties = dadosAtualizacao.valor_royalties !== undefined ? dadosAtualizacao.valor_royalties : processo.valor_royalties;
      dadosAtualizacao.total = vConvenio + vRecurso + vRoyalties;
    }

    // Adiciona metadados de atualização
    dadosAtualizacao.data_atualizacao = new Date();
    dadosAtualizacao.update_for = user_logado.nome;

    return await processo.update(dadosAtualizacao);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    throw error;
  }
}

async function atualizarSetor(id, setor_atual, user_logado, data_tramitacao) {
  try {
    const processo = await Processo.findByPk(id);
    if (!processo) throw new Error('Processo não encontrado');

    const updateData = {
      setor_atual,
      data_atualizacao: new Date(),
      update_for: user_logado.nome
    };

    // Atualizar setor_id usando o domainService
    const setor_id = await domainService.connectOrCreate(Setor, setor_atual);
    if (setor_id) {
      updateData.setor_id = setor_id;
    }

    if (setor_atual !== processo.setor_atual) {
      // Se data_tramitacao for fornecida, usa ela. Senão, usa agora.
      updateData.data_ultima_movimentacao = data_tramitacao ? new Date(data_tramitacao) : new Date();
    }

    return await processo.update(updateData);
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    throw error;
  }
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

module.exports = { listarProcessos, listarProcessoPorId, criarProcesso, atualizarProcesso, atualizarSetor, deletarProcesso, listarTodosProcessosPorOrgao };
