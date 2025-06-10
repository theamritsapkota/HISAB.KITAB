const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./backend/routes/userRoutes'); // ✅ Adjust path if needed
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/users', userRoutes); // ✅ Mount your user routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
