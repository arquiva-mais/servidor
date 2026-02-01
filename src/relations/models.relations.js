const Usuario = require('../models/usuario.model');
const Processo = require('../models/processo.model');
const Orgao = require('../models/orgao.model');
const Objeto = require('../models/objeto.model');
const Credor = require('../models/credor.model');
const OrgaoGerador = require('../models/orgaoGerador.model');
const Setor = require('../models/setor.model');
const Notificacao = require('../models/notificacao.model');

// Definir associações
Orgao.hasMany(Usuario, { foreignKey: 'orgao_id', as: 'usuarios' });
Usuario.belongsTo(Orgao, { foreignKey: 'orgao_id', as: 'orgao' });

Orgao.hasMany(Processo, { foreignKey: 'orgao_id', as: 'processos' });
Processo.belongsTo(Orgao, { foreignKey: 'orgao_id', as: 'orgao' });

// Relações com tabelas de domínio (lookup tables)
Objeto.hasMany(Processo, { foreignKey: 'objeto_id', as: 'processos' });
Processo.belongsTo(Objeto, { foreignKey: 'objeto_id', as: 'objetoLookup' });

Credor.hasMany(Processo, { foreignKey: 'credor_id', as: 'processos' });
Processo.belongsTo(Credor, { foreignKey: 'credor_id', as: 'credorLookup' });

OrgaoGerador.hasMany(Processo, { foreignKey: 'orgao_gerador_id', as: 'processos' });
Processo.belongsTo(OrgaoGerador, { foreignKey: 'orgao_gerador_id', as: 'orgaoGeradorLookup' });

Setor.hasMany(Processo, { foreignKey: 'setor_id', as: 'processos' });
Processo.belongsTo(Setor, { foreignKey: 'setor_id', as: 'setorLookup' });

// Relação de atribuição de responsável
Usuario.hasMany(Processo, { foreignKey: 'atribuido_para_usuario_id', as: 'processosAtribuidos' });
Processo.belongsTo(Usuario, { foreignKey: 'atribuido_para_usuario_id', as: 'atribuidoPara' });

// Relação de quem fez a atribuição (atribuidor)
Usuario.hasMany(Processo, { foreignKey: 'atribuido_por_usuario_id', as: 'processosQueAtribuiu' });
Processo.belongsTo(Usuario, { foreignKey: 'atribuido_por_usuario_id', as: 'atribuidoPor' });

// Relação de notificações
Usuario.hasMany(Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
Notificacao.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = { Usuario, Processo, Orgao, Objeto, Credor, OrgaoGerador, Setor, Notificacao };