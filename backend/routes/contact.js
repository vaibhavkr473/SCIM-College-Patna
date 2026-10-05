import express from 'express';

const router = express.Router();

router.post('/whatsapp', (req, res) => {
  const number = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (!number) {
    return res.status(503).json({ error: 'WhatsApp contact is not configured yet. Set WHATSAPP_NUMBER in the backend .env.' });
  }
  if (number.length < 8 || number.length > 15) {
    return res.status(500).json({ error: 'WHATSAPP_NUMBER must include the country code and contain 8 to 15 digits.' });
  }

  return res.json({ url: `https://wa.me/${number}` });
});

export default router;
