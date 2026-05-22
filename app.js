require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
const { verificarToken } = require('./src/middleware/authMiddleware');

const clientesRoutes = require('./src/routes/clientesRoutes');
app.use('/clientes', verificarToken, clientesRoutes);
app.use('/auth', authRoutes);

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API de Clientes com PostgreSQL',
    versao: '3.0',
    ambiente: process.env.NODE_ENV || 'development',
    banco: 'PostgreSQL'
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Servidor rodando!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💾 Banco: PostgreSQL (${process.env.DB_NAME})`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});
