require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const processosRoutes = require('./routes/processo.routes');

const app = express();

app.use(cors());

app.use(express.json());
app.use('/processos', processosRoutes);

app.get("/", (req, res) => {
  res.send("Ola, mundo")
})

sequelize.sync().then(() => {
  console.log('Banco sincronizado');
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
});
