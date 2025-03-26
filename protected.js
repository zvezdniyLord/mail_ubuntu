const jwt = require('jsonwebtoken');

function verifyAccessToken(req, res, next) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Access Token не предоставлен' });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Добавляем данные пользователя в объект запроса
        next(); // Продолжаем выполнение запроса
    } catch (err) {
        return res.status(403).json({ error: 'Недействительный или просроченный Access Token' });
    }
}

module.exports = verifyAccessToken;
