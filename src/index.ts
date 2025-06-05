import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models/User';  
import './models/Task';
import { User, Task } from './models'; 

dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.status(200).send("Server is running!");
});

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
