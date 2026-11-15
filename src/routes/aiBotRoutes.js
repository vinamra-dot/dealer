import express from 'express';
import { handleBotChat } from '../controllers/aiBotController.js';

const router = express.Router();

router.post('/chat', handleBotChat);

export default router;
