import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import authRoutes from './server/routes/authRoutes';
import groupRoutes from './server/routes/groupRoutes';
import expenseRoutes from './server/routes/expenseRoutes';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '8080', 10);

  const allowedOrigins = [
    'https://fairsharre.netlify.app',
    'http://localhost:5173',
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }));
  app.use(express.json());


  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FairShare API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/expenses', expenseRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
