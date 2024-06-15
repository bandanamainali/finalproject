// backend/routes/payment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const KHALTI_SECRET_KEY = 'test_secret_key_5278be0fcd0d461498f5d1603fa3804b';

router.post('/verify-payment', async (req, res) => {
    const { token, amount } = req.body;

    const data = {
        token,
        amount,
    };

    try {
        console.log("Verifying payment with data",data );
        const response = await axios.post('https://khalti.com/api/v2/payment/verify/', data, {
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`
            }
        });

        console.log("Verification response from Khalti:", response.data);

        if (response.data.state.name === 'Completed') {
            // Payment was successful
            res.json({ success: true, data: response.data });
        } else {
            // Payment failed
            res.json({ success: false, data: response.data });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;
