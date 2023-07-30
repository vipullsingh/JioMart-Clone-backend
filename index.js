require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Set up the Express app
const app = express();
const httpServer = require('http').createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Home Router
app.get('/',(req,res)=>{
    res.send("<h1> Hi, Welcome to BuddyCart backend")
})

// Import and use user routes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
