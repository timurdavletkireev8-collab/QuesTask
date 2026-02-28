const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { captchaId, answer } = req.body;

    try {
        await new Promise(r => setTimeout(r, 5000));

        const result = await axios.get('https://rucaptcha.com/res.php', {
            params: {
                key: '25de2db49849c857ad65610fa1e7e0d2',
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
            res.json({ success: false, error: 'Капча еще решается' });
        }
    } catch (error) {
        res.json({ success: false, error: 'Ошибка проверки' });
    }
};
