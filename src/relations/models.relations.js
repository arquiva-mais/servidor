const Usuario = require('../models/usuario.model');
const Processo = require('../models/processo.model');
const Orgao = require('../models/orgao.model');

// Definir associações
Orgao.hasMany(Usuario, { foreignKey: 'orgao_id', as: 'usuarios' });
Usuario.belongsTo(Orgao, { foreignKey: 'orgao_id', as: 'orgao' });

Orgao.hasMany(Processo, { foreignKey: 'orgao_id', as: 'processos' });
Processo.belongsTo(Orgao, { foreignKey: 'orgao_id', as: 'orgao' });

module.exports = { Usuario, Processo, Orgao };