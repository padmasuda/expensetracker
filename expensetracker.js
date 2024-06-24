// Sets up the Express server, connects to MongoDB, configures middleware (including session management), and defines routes for authentication and todo management.
const express = require('express'); // Import the express library
const mongoose = require('mongoose'); // Import the mongoose library for MongoDB interaction
const session = require('express-session'); // Import the express-session middleware
const MongoStore = require('connect-mongo'); // Import the connect-mongo library for session storage in MongoDB
const path = require('path'); // Import the path module for handling file and directory paths
require('dotenv').config(); // Load environment variables from .env file
const authRoutes = require('./routes/auth'); // Import the authentication routes
const expenseRoutes = require('./routes/expenses'); // Import the expense routes
const Expense = require('./models/expense'); // Import the Expense model

const app = express(); // Create an instance of the express application
const PORT = process.env.PORT || 3000; // Set the port from the environment variable or default to 3000

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected")) // Log a message if the connection is successful
    .catch(err => console.error("MongoDB connection error:", err)); // Log an error message if the connection fails

// Set EJS as the view engine and specify the directory for views
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// Middlewares for parsing JSON and urlencoded data and serving static files
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Setup session with MongoDB storage
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie
    resave: false, // Do not save the session if unmodified
    saveUninitialized: false, // Do not create a session until something is stored
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // Store session data in MongoDB
}));

// Use authentication and expense routes
app.use(authRoutes);
app.use('/expenses', expenseRoutes);

// Root route to render the main page using EJS template
app.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login page if user is not logged in
    }
    try {
        const expenses = await Expense.find({ owner: req.session.userId }); // Fetch expenses for the logged-in user
        res.render('index', { expenses }); // Render the index template with the expenses data
    } catch (err) {
        console.error('Error fetching expenses:', err); // Log the error if fetching expenses fails
        res.status(500).send('Error fetching expenses'); // Send a 500 status on server error
    }
});

// Route to render the login page
app.get('/login', (req, res) => {
    res.render('login'); // Render the login template
});

// Route to render the registration page
app.get('/register', (req, res) => {
    res.render('register'); // Render the registration template
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); // Log a message when the server starts
});