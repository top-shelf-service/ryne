// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { api } from './routes/api.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', api);

if (process.env.NODE_ENV !== 'ci') {
  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => console.log(`API listening on :${port}`));
}

export default app;
