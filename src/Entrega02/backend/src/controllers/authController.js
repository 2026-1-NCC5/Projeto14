const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.register = async (req, res) => {
    const { fullName, email, role, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (!email.endsWith('@fecap.br')) {
        return res.status(400).json({ error: 'Apenas e-mails @fecap.br são permitidos.' });
    }

    try {
        const [existingUser] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // O team_group será inserido como NULL por padrão
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, role, password_hash) VALUES (?, ?, ?, ?)',
            [fullName, email, role || 'aluno', hashedPassword]
        );

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};