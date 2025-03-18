const jwt = require('jsonwebtoken');
require('dotenv').config();

// Секретный ключ для подписи токена
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Генерация JWT
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Токен действителен 1 час
}

// Проверка JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Извлекаем токен из заголовка Authorization

    if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Проверяем токен
        req.user = decoded; // Добавляем данные пользователя в запрос
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Неверный или просроченный токен' });
    }
}

module.exports = { generateToken, verifyToken };
