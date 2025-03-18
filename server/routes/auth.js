require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('../authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { email, full_name, password, position, company, industry, city, phone } = req.body;

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (email, full_name, password_hash, position, company, industry, city, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [email, full_name, passwordHash, position, company, industry, city, phone]
        );

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Пользователь с таким email не найден' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        const token = generateToken(user.rows[0]);

        res.json({ message: 'Вход выполнен успешно', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});




const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Неверный или просроченный токен' });
    }
}

module.exports = { generateToken, verifyToken };

module.exports = router;
