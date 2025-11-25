require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const processosRoutes = require('./routes/processo.routes');
const authRoutes = require('./routes/auth.routes')
const orgaoRoutes = require('./routes/orgao.routes')

require('./relations/models.relations');

const app = express();

// Configurar CORS para produção
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
