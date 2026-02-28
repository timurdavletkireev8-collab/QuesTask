const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const response = await axios.post('https://rucaptcha.com/in.php', null, {
            params: {
                key: '25de2db49849c857ad65610fa1e7e0d2',
                method: 'base64',
                textinstructions: 'Введите текст с картинки'
            }
        });

        if (response.data && response.data.includes('OK|')) {
            const captchaId = response.data.split('|')[1];
            res.json({ success: true, captchaId: captchaId });
        } else {
            res.json({ success: false, error: 'RuCaptcha ошибка' });
        }
    } catch (error) {
        res.json({ success: false, error: 'Серверная ошибка' });
    }
};
