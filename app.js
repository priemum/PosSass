// app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const morgan = require("morgan");

// Import routes
const sycn = require('./routes/sync');
const authController = require('./controllers/authController');

// Initialize Express app
const app = express();
app.use(morgan("dev"));
require('./models/table'); // Import Table model
const cookieParser = require('cookie-parser');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(require("./routes"));
 
// Routes
app.use('/api/', sycn);
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts. Please try again later.',
});

// Apply to login route
app.post('/login', loginLimiter, authController.login_post);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the server after successful DB connection
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Online server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
