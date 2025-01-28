const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const bcrypt = require("bcrypt");
const session = require('express-session');

app.use(bodyParser.json());
app.use(cors());

const PORT = 3001;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cabinet',
    password: '',
    port: 5432,
});

app.use(session({
    secret: 'gfgffgfg', // Секретный ключ для подписи сессии
    resave: false, // Не сохранять сессию, если она не изменилась
    saveUninitialized: false, // Не сохранять неинициализированные сессии
    cookie: { secure: false } // Для HTTPS установите true
}));

/*const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
});*/

const transporter = nodemailer.createTransport({
    host: 'smtp.elesy.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'noreplyscadaint',
        pass: 'jfPIvUteG7$L~*BE'
    },
    tls: {
        rejectUnauthorized: false
    }
});

const TO_EMAIL = 'davaa@elesy.ru';

app.post('/send-email', async (req, res) => {
    const { subject, body, from_email, thread_id } = req.body;

    try {
        if (thread_id) {
            const checkQuery = 'SELECT is_closed FROM emails_test WHERE thread_id = $1 LIMIT 1';
            const checkResult = await pool.query(checkQuery, [thread_id]);

            if (checkResult.rows.length > 0 && checkResult.rows[0].is_closed) {
                return res.status(400).json({ status: 'error', message: 'Заявка закрыта' });
            }
        }

        const email_thread_id = thread_id || generateThreadId();

        const email_subject = thread_id ? `Re: ${subject} [${email_thread_id}]` : `${subject} [${email_thread_id}]`;

        const query = `
            INSERT INTO emails_test (thread_id, subject, body, from_email, is_outgoing)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [email_thread_id, email_subject, body, from_email, true];
        const result = await pool.query(query, values);

        await transporter.sendMail({
            from: from_email,
            to: TO_EMAIL,
            subject: email_subject,
            text: body,
        });

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to send email' });
    }
});

app.get('/thread/:thread_id', async (req, res) => {
    const { thread_id } = req.params;

    try {
        const query = `
            SELECT * FROM emails_test
            WHERE thread_id = $1
            ORDER BY created_at ASC;
        `;
        const result = await pool.query(query, [thread_id]);

        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch thread' });
    }
});

app.post('/receive-email', async (req, res) => {
    const { subject, body, from_email } = req.body;

    try {
        // Извлечение thread_id из темы письма
        const thread_id = extractThreadId(subject);
        console.log(thread_id);
        if (!thread_id) {
            return res.status(400).json({ status: 'error', message: 'Thread ID not found in subject' });
        }

        // Сохранение письма в базу данных
        const query = `
            INSERT INTO emails_test (thread_id, subject, body, from_email, is_outgoing)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [thread_id, subject, body, from_email, false];
        const result = await pool.query(query, values);

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to receive email' });
    }
});

function generateEmailSubject(subject, thread_id) {
    return `${subject} [${thread_id}]`;
}

function generateThreadId() {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractThreadId(subject) {
    const match = subject.match(/\[(.*)\]/);
    console.log(match);
    if (match) {
        return match[1];
    }
    return null;
}

app.post('/close-thread', async (req, res) => {
    const { thread_id } = req.body;

    try {
        const query = `
            UPDATE emails_test
            SET is_closed = TRUE
            WHERE thread_id = $1;
        `;
        await pool.query(query, [thread_id]);

        res.status(200).json({ status: 'success', message: 'Заявка закрыта' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to close thread' });
    }
});

app.get('/posts', async (req, res) => {
    const query = 'SELECT * FROM emails_test';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
})

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users_test (email, password_hash)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [email, passwordHash];
        const result = await pool.query(query, values);

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to register user' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users_test WHERE email = $1';
        const result = await pool.query(query, [email]);
        console.log(result.rows);
        if (result.rows.length === 0) {
            return res.status(400).json({ status: 'error', message: 'User not found' });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ status: 'error', message: 'Invalid password' });
        }

        req.session.userId = user.id;

        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to login' });
    }
});

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    next();
}

app.get("/alldata", async (req, res) => {
    const {body} = req.body;
    const query = `SELECT * FROM emails_test WHERE id = $1`;
    const result = await pool.query(query, [result]);
    res.status(200).json({status: "success", data: result});
});

app.get('/protected', requireAuth, (req, res) => {
    res.json({ status: 'success', message: 'You are authenticated' });
});

app.delete('/delete/:id', async (req, res) =>  {
    const {id} = req.params;
    const deleteQuery = 'DELETE  FROM emails_test WHERE id = $1';
    const result = await pool.query(deleteQuery, [id]);
    res.status(200).json({status: "delete success"});
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
