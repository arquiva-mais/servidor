const service = require('../services/processo.service');

exports.listar = async (req, res) => {
  try {
    const processos = await service.listarProcessos(req.query);
    res.json(processos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
};

exports.listarPorId = async (req, res) => {
   try {
      const processo = await service.listarProcessoPorId(req.body.id)
      res.json(processo)
   } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar processo' })
   }
}

exports.criar = async (req, res) => {
  try {
    const processo = await service.criarProcesso(req.body);
    res.status(201).json({ id: processo.id, message: 'Criado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message});
  }
};

exports.atualizar = async (req, res) => {
  try {
    await service.atualizarProcesso(req.params.id, req.body);
    res.json({ message: 'Atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    await service.deletarProcesso(req.params.id);
    res.json({ message: 'Excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
