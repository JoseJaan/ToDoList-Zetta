import express from 'express';
import sequelize from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.status(200).send("Server is running!");
});

sequelize.authenticate()
  .then(() => {
    console.log('Connected to database!');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });
