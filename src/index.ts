import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/database';
import './models/User';
import './models/Task';
import './models/PasswordReset'
import { User, Task, PasswordReset } from './models';
import routes from './routes';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:3001', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.status(200).send("Server is running!");
});

app.use('/api', routes);

sequelize.authenticate()
  .then(() => {
    console.log('Connected to database!');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });