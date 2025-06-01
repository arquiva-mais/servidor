require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const processosRoutes = require('./routes/processo.routes');
const authRoutes = require('./routes/auth.routes')
const orgaoRoutes = require('./routes/orgao.routes')

require('./relations/models.relations');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/processos', processosRoutes);
app.use('/auth', authRoutes)
app.use('/orgao', orgaoRoutes)

app.get("/", (req, res) => {
  res.send("Ola, mundo")
})

sequelize.authenticate().then(() => {
  console.log('Banco sincronizado');
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
});
