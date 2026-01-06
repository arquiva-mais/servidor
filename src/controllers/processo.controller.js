const service = require('../services/processo.service');

exports.listar = async (req, res) => {
  try {
    const filtros = req.query;

    filtros.orgao_id = req.usuario.orgao_id;

    const sortBy = req.query.sortBy || 'id';
    const sortOrder = req.query.sortOrder || 'desc';

    const paginacao = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy,
      sortOrder
    };

    const resultado = await service.listarProcessos(filtros, paginacao);
    
    // Transformar os dados para o formato esperado pelo frontend
    const processosTransformados = resultado.processos.map(p => {
      const processo = p.toJSON ? p.toJSON() : p;
      return {
        ...processo,
        objeto: processo.objetoLookup?.nome || processo.objeto,
        credor: processo.credorLookup?.nome || processo.credor,
        orgao_gerador: processo.orgaoGeradorLookup?.nome || processo.orgao_gerador,
        setor_atual: processo.setorLookup?.nome || processo.setor_atual
      };
    });
    
    res.json({
      ...resultado,
      processos: processosTransformados
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
};

exports.listarTodosPorOrgao = async (req, res) => {
  try {
    const orgao_id = req.usuario.orgao_id;

    const resultado = await service.listarTodosProcessosPorOrgao(orgao_id);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
};

exports.listarPorId = async (req, res) => {
  try {
    const processo = await service.listarProcessoPorId(req.body.id);

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    if (processo.orgao_id !== req.usuario.orgao_id) {
      return res.status(403).json({ error: 'Acesso negado a este processo' });
    }

    // Transformar os dados para o formato esperado pelo frontend
    const processoData = processo.toJSON ? processo.toJSON() : processo;
    const processoTransformado = {
      ...processoData,
      objeto: processoData.objetoLookup?.nome || processoData.objeto,
      credor: processoData.credorLookup?.nome || processoData.credor,
      orgao_gerador: processoData.orgaoGeradorLookup?.nome || processoData.orgao_gerador,
      setor_atual: processoData.setorLookup?.nome || processoData.setor_atual
    };

    res.json(processoTransformado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar processo' });
  }
};

exports.criar = async (req, res) => {
  try {
    const processo = await service.criarProcesso(req.body, req.usuario);
    res.status(201).json({ id: processo.id, message: 'Criado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const processo = await service.listarProcessoPorId(req.params.id);


    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    if (processo.orgao_id !== req.usuario.orgao_id) {
      return res.status(403).json({ error: 'Acesso negado a este processo' });
    }

    const processoAtualizado = await service.atualizarProcesso(req.params.id, req.body, req.usuario);
    res.json(processoAtualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.atualizarSetor = async (req, res) => {
  try {
    const { setor_atual } = req.body;
    
    if (!setor_atual) {
      return res.status(400).json({ error: 'Setor atual é obrigatório' });
    }

    const processo = await service.listarProcessoPorId(req.params.id);

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    if (processo.orgao_id !== req.usuario.orgao_id) {
      return res.status(403).json({ error: 'Acesso negado a este processo' });
    }

    const processoAtualizado = await service.atualizarSetor(req.params.id, setor_atual, req.usuario);
    res.json(processoAtualizado);
  } catch (err) {
    console.error('Erro ao atualizar setor:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    //const processo = await service.listarProcessoPorId(req.params.id);
    /*
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    if (processo.orgao_id !== req.usuario.orgao_id) {
      return res.status(403).json({ error: 'Acesso negado a este processo' });
    }
    */
    await service.deletarProcesso(req.params.id);
    res.json({ message: 'Processo deletado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
