const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// ТВОЙ КЛЮЧ УЖЕ ВСТАВЛЕН!
const RUCAPTCHA_KEY = '25de2db49849c857ad65610fa1e7e0d2';

// ФРОНТЕНД (HTML + JS)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Captcha Solver</title>
            <style>
                body { font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff; }
                .container { max-width: 400px; margin: 0 auto; text-align: center; }
                input, button { padding: 10px; margin: 5px; width: 90%; border-radius: 5px; }
                button { background: #0088cc; color: white; border: none; cursor: pointer; }
                #message { margin-top: 20px; padding: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 Captcha Bot</h1>
                <div id="balance">💰 Баланс: 0 монет</div>
                <div id="task" style="margin: 20px; padding: 20px; background: #333; border-radius: 10px;">
                    Нажми "Получить задание"
                </div>
                <input type="text" id="answer" placeholder="Введи ответ">
                <button onclick="submitAnswer()">✅ Отправить</button>
                <button onclick="getTask()">🔄 Новое задание</button>
                <div id="message"></div>
            </div>

            <script>
                let currentId = null;
                let balance = 0;

                async function getTask() {
                    document.getElementById('message').innerHTML = '⏳ Загружаю...';
                    const res = await fetch('/api/get-captcha');
                    const data = await res.json();
                    
                    if (data.success) {
                        currentId = data.captchaId;
                        document.getElementById('task').innerHTML = '🔢 Введи текст с картинки';
                        document.getElementById('message').innerHTML = '✅ Задание получено!';
                    } else {
                        document.getElementById('message').innerHTML = '❌ Ошибка: ' + data.error;
                    }
                }

                async function submitAnswer() {
                    const answer = document.getElementById('answer').value;
                    if (!answer || !currentId) return alert('Сначала получи задание!');
                    
                    document.getElementById('message').innerHTML = '⏳ Проверяю...';
                    const res = await fetch('/api/submit-answer', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({captchaId: currentId, answer: answer})
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                        balance++;
                        document.getElementById('balance').innerHTML = '💰 Баланс: ' + balance + ' монет';
                        document.getElementById('message').innerHTML = '✅ Верно! +1 монета';
                        document.getElementById('task').innerHTML = '🎉 Молодец! Жми новое задание';
                        currentId = null;
                        document.getElementById('answer').value = '';
                    } else {
                        document.getElementById('message').innerHTML = '❌ ' + data.error;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// API ПОЛУЧИТЬ КАПЧУ
app.post('/api/get-captcha', async (req, res) => {
    try {
        const response = await axios.post('https://rucaptcha.com/in.php', null, {
            params: {
                key: RUCAPTCHA_KEY,
                method: 'base64',
                textinstructions: 'Введите текст с картинки'
            }
        });

        if (response.data && response.data.includes('OK|')) {
            const captchaId = response.data.split('|')[1];
            res.json({ success: true, captchaId: captchaId });
        } else {
            res.json({ success: false, error: 'RuCaptcha ошибка: ' + response.data });
        }
    } catch (error) {
        res.json({ success: false, error: 'Серверная ошибка' });
    }
});

// API ОТПРАВИТЬ ОТВЕТ
app.post('/api/submit-answer', async (req, res) => {
    const { captchaId, answer } = req.body;

    try {
        // Ждем 5 секунд (RuCaptcha нужно время)
        await new Promise(r => setTimeout(r, 5000));

        const result = await axios.get('https://rucaptcha.com/res.php', {
            params: {
                key: RUCAPTCHA_KEY,
                action: 'get',
                id: captchaId
            }
        });

        if (result.data.includes('OK|')) {
            const correctAnswer = result.data.split('|')[1];
            
            if (answer === correctAnswer) {
                res.json({ success: true });
            } else {
                res.json({ success: false, error: 'Неверный ответ' });
            }
        } else {
            res.json({ success: false, error: 'Капча еще решается, попробуй через 5 сек' });
        }
    } catch (error) {
        res.json({ success: false, error: 'Ошибка проверки' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Сервер запущен на порту', port));
