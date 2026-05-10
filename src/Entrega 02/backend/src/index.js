require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importação das rotas e controllers
const authRoutes = require('./routes/authRoutes');
const adminController = require('./controllers/adminController');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// --- Configuração das rotas na aplicação ---

// Rotas de Autenticação
app.use('/api', authRoutes);

// Rotas de Administração
app.get('/api/users', adminController.getUsers);
app.get('/api/groups', adminController.getGroups);
app.post('/api/groups', adminController.createGroup);
app.delete('/api/groups/:name', adminController.deleteGroup);
app.put('/api/users/:id/group', adminController.updateUserGroup);

// Rotas de Histórico e Arrecadação
app.get('/api/historico', adminController.getHistorico);
app.post('/api/arrecadacao', adminController.createArrecadacao);

// Rota de teste para verificar o status da API
app.get('/', (req, res) => {
    res.json({ message: 'API do LiderAI Food Tracker rodando com sucesso!' });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});