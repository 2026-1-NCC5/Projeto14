const pool = require('../db');

// Busca todos os usuários do tipo "aluno"
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, full_name AS name, email, team_group AS `group` FROM users WHERE role = ?',
            ['aluno']
        );

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
};

// Busca todos os grupos
exports.getGroups = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT name FROM team_groups');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar grupos.' });
    }
};

// Cria um novo grupo
exports.createGroup = async (req, res) => {
    const { name } = req.body;
    try {
        await pool.execute('INSERT INTO team_groups (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Grupo criado.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Grupo já existe.' });
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar grupo.' });
    }
};

// Deleta um grupo (e remove ele dos alunos)
exports.deleteGroup = async (req, res) => {
    const { name } = req.params;
    try {
        await pool.execute('UPDATE users SET team_group = NULL WHERE team_group = ?', [name]);
        await pool.execute('DELETE FROM team_groups WHERE name = ?', [name]);
        res.json({ message: 'Grupo deletado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar grupo.' });
    }
};

// Atualiza o grupo de um usuário
exports.updateUserGroup = async (req, res) => {
    const { id } = req.params;
    const { group } = req.body; // pode ser o nome do grupo ou null
    try {
        await pool.execute('UPDATE users SET team_group = ? WHERE id = ?', [group, id]);
        res.json({ message: 'Grupo do usuário atualizado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
};
exports.getHistorico = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                CONCAT('SES-', DATE_FORMAT(MAX(data_registro), '%Y%m%d'), '-', SUBSTRING(MD5(team_group), 1, 4)) AS id,
                DATE_FORMAT(MAX(data_registro), '%d/%m/%Y') AS date,
                DATE_FORMAT(MAX(data_registro), '%H:%i') AS time,
                team_group AS team,
                SUM(quantidade) AS items,
                SUM(peso_kg) AS totalWeight
            FROM arrecadacao
            GROUP BY team_group, DATE(data_registro)
            ORDER BY MAX(data_registro) DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
};