import express from 'express';
import { getLiveTransportGps } from '../controllers/transportGpsController.js';

const router = express.Router();

router.get('/tracking/:identifier', getLiveTransportGps);

export default router;
