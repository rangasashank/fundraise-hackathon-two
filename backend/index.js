require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

const app = express();

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});