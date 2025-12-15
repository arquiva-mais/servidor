require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const processosRoutes = require('./routes/processo.routes');
const authRoutes = require('./routes/auth.routes')
const orgaoRoutes = require('./routes/orgao.routes')

require('./relations/models.relations');

const app = express();

// Configurar trust proxy para Nginx/reverse proxy
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
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
app.use(express.json());

// Rotas
app.use('/processos', processosRoutes);
app.use('/auth', authRoutes)
app.use('/orgao', orgaoRoutes)

app.get("/", (req, res) => {
  res.send("Ola, mundo")
})

const PORT = process.env.PORT || 3001;

sequelize.authenticate().then(() => {
  console.log('Banco sincronizado');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});
