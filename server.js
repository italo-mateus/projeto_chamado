const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());                          // Permite requisições cross-origin
app.use(express.json());                  // Parse de JSON no body
app.use(express.urlencoded({ extended: true })); // Parse de formulários

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/template.jpg', express.static(path.join(__dirname, 'template.jpg')));

// Rotas da API (arquitetura MVC)
app.use('/api', apiRoutes);

// Fallback para SPA - serve index.html para rotas não-API
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 ResolveOS (Arquitetura MVC) rodando na porta ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`👤 Super Admin User: admin`);
    console.log(`🔑 Super Admin Password: 123`);
    console.log(`===================================================`);
  });
}

module.exports = app;