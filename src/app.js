require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const processosRoutes = require('./routes/processo.routes');
const authRoutes = require('./routes/auth.routes')
const orgaoRoutes = require('./routes/orgao.routes')
const domainRoutes = require('./routes/domain.routes')

// Importar controllers de lookup tables
const domainController = require('./controllers/domain.controller')
const { verificarToken } = require('./middleware/auth.middleware')
const { apiLimiter } = require('./middleware/rateLimiters');

require('./relations/models.relations');

const app = express();

// Configurar trust proxy para Nginx/reverse proxy
app.set('trust proxy', 1);

// Aplicar Rate Limiting global
app.use(apiLimiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://arquivamaispenedo.online', 
  'http://arquivamaispenedo.online',
  'https://www.arquivamaispenedo.online',
  'http://www.arquivamaispenedo.online'
];

// Configurar CORS para produção
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Rotas
app.use('/processos', processosRoutes);
app.use('/auth', authRoutes)
app.use('/orgao', orgaoRoutes)
app.use('/domain', domainRoutes)

// Rotas de lookup tables em português
app.get('/objetos', verificarToken, domainController.listObjects);
app.post('/objetos', verificarToken, domainController.createObject);
app.put('/objetos/:id', verificarToken, domainController.updateObject);
app.delete('/objetos/:id', verificarToken, domainController.deleteObject);
app.get('/objetos/:id/uso', verificarToken, async (req, res) => {
  // Mock count usage - implementar depois
  res.json({ count: 0 })
});

app.get('/credores', verificarToken, domainController.listCreditors);
app.post('/credores', verificarToken, domainController.createCreditor);
app.put('/credores/:id', verificarToken, domainController.updateCreditor);
app.delete('/credores/:id', verificarToken, domainController.deleteCreditor);
app.get('/credores/:id/uso', verificarToken, async (req, res) => {
  res.json({ count: 0 })
});

app.get('/orgaos-geradores', verificarToken, domainController.listBodies);
app.post('/orgaos-geradores', verificarToken, domainController.createBody);
app.put('/orgaos-geradores/:id', verificarToken, domainController.updateBody);
app.delete('/orgaos-geradores/:id', verificarToken, domainController.deleteBody);
app.get('/orgaos-geradores/:id/uso', verificarToken, async (req, res) => {
  res.json({ count: 0 })
});

app.get('/setores', verificarToken, domainController.listSectors);
app.post('/setores', verificarToken, domainController.createSector);
app.put('/setores/:id', verificarToken, domainController.updateSector);
app.delete('/setores/:id', verificarToken, domainController.deleteSector);
app.get('/setores/:id/uso', verificarToken, async (req, res) => {
  res.json({ count: 0 })
});

app.get("/", (req, res) => {
  res.send("Ola, mundo")
})

const PORT = process.env.PORT || 3001;

sequelize.authenticate().then(() => {
  console.log('Banco sincronizado');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});
