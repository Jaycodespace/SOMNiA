import express from 'express';
import userAuth from '../middleware/userAuth.js';

import {
  addSpO2Data,
  getLatestSpO2,
  updateSpO2Data,
  deleteSpO2Data
} from '../controllers/spo2Controller.js';

const spo2Router = express.Router();

spo2Router.post('/addspo2', userAuth, addSpO2Data);
spo2Router.get('/get/:userId', userAuth, getLatestSpO2);
spo2Router.put('/update/:id', userAuth, updateSpO2Data);
spo2Router.delete('/delete/:id', userAuth, deleteSpO2Data);

export default spo2Router;