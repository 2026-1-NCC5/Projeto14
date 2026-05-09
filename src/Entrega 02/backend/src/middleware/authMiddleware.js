const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Nenhum token fornecido. Acesso negado.' });
    }

    try {
        // Geralmente o token vem no formato "Bearer [token]"
        const tokenLimpo = token.split(' ')[1]; 
        
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded; // Salva os dados do usuário na requisição
        
        next(); // Permite que a requisição continue para o Controller
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = verifyToken;