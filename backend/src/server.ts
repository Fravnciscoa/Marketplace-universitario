import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import creditoRoutes from './routes/credito.routes';

let productosRoutes: any;

try {
  // load the routes at runtime so a missing file doesn't break compilation
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  productosRoutes = require('./routes/producto.routes').default;
} catch (e) {
  // fallback to an empty router if the module is not present
  productosRoutes = express.Router();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:4200'],
  credentials: true
}));

app.use(express.json());

// Rutas
app.use(authRoutes);
app.use(productosRoutes);
app.use(creditoRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
