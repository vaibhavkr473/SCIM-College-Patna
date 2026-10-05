import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

import authRoutes from './routes/auth.js';
import noticeRoutes from './routes/notices.js';
import materialRoutes from './routes/materials.js';
import testRoutes from './routes/tests.js';
import submissionRoutes from './routes/submissions.js';
import doubtRoutes from './routes/doubts.js';
import calendarRoutes from './routes/calendar.js';
import feedbackRoutes from './routes/feedback.js';
import bookmarkRoutes from './routes/bookmarks.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import aiTutorRoutes from './routes/aiTutor.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ROUTES
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    gemini: serviceStatus.gemini,
    openai: serviceStatus.openai,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/contact', contactRoutes);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(500).json({
    error: 'Server error',
  });
});

// CONFIG
const PORT = process.env.PORT || 5000;

// Store service status
const serviceStatus = {
  mongodb: 'checking',
  gemini: 'checking',
  openai: 'checking',
};

// GEMINI CHECK
async function checkGemini() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API;

  if (!apiKey) {
    serviceStatus.gemini = 'missing_api_key';

    console.log('❌ Gemini: API key missing');

    return false;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with only the word OK.',
    });

    if (response?.text) {
      serviceStatus.gemini = 'working';

      console.log('✅ Gemini: Working');

      return true;
    }

    serviceStatus.gemini = 'no_response';

    console.log('⚠️ Gemini: API responded but no text was returned');

    return false;

  } catch (error) {
    serviceStatus.gemini = 'error';

    console.error(
      '❌ Gemini: API check failed:',
      error?.message || error
    );

    return false;
  }
}

// OPENAI / CHATGPT CHECK
async function checkOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.CHATGPT_API_KEY;

  if (!apiKey) {
    serviceStatus.openai = 'missing_api_key';

    console.log('❌ OpenAI/ChatGPT: API key missing');

    return false;
  }

  try {
    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: 'Reply with only the word OK.',
      max_output_tokens: 10,
    });

    if (response?.output_text) {
      serviceStatus.openai = 'working';

      console.log('✅ OpenAI/ChatGPT: Working');

      return true;
    }

    serviceStatus.openai = 'no_response';

    console.log(
      '⚠️ OpenAI/ChatGPT: API responded but no text was returned'
    );

    return false;

  } catch (error) {
    serviceStatus.openai = 'error';

    console.error(
      '❌ OpenAI/ChatGPT: API check failed:',
      error?.message || error
    );

    return false;
  }
}

// MONGODB CHECK
async function connectMongoDB() {
  if (!process.env.MONGODB_URI) {
    serviceStatus.mongodb = 'missing_uri';

    throw new Error('MONGODB_URI is missing from .env');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    serviceStatus.mongodb = 'connected';

    console.log('✅ MongoDB: Connected');

    return true;

  } catch (error) {
    serviceStatus.mongodb = 'error';

    console.error(
      '❌ MongoDB connection error:',
      error?.message || error
    );

    throw error;
  }
}

// START SERVER
async function startServer() {
  console.log('');
  console.log('========================================');
  console.log('🔄 Starting backend service checks...');
  console.log('========================================');
  console.log('');

  // MongoDB
  try {
    await connectMongoDB();
  } catch (error) {
    console.error('');
    console.error('❌ Backend cannot start without MongoDB.');
    console.error('');

    process.exit(1);
  }

  // Gemini
  await checkGemini();

  // OpenAI
  await checkOpenAI();

  console.log('');
  console.log('========================================');
  console.log('📊 SERVICE STATUS');
  console.log('========================================');

  console.log(
    `MongoDB       : ${serviceStatus.mongodb}`
  );

  console.log(
    `Gemini        : ${serviceStatus.gemini}`
  );

  console.log(
    `OpenAI/ChatGPT: ${serviceStatus.openai}`
  );

  console.log('========================================');
  console.log('');

  // Start Express

  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log('========================================');
    console.log('');
  });
}

// START APPLICATION

startServer();
