// Handles CRUD operations for expense items, including creating, reading, updating (toggling completion), and deleting expenses, with middleware to check user authentication.

const express = require('express'); // Import the express library
const Expense = require('../models/expense'); // Import the Expense model

const router = express.Router(); // Create a new router object

// Middleware to check if user is logged in
function loggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).send('Login required'); // If user is not logged in, send a 401 status
    }
    next(); // Proceed to the next middleware or route handler
}

// Route to get all expenses for the logged-in user
router.get('/', loggedIn, async (req, res) => {
    try {
        const expenses = await Expense.find({ owner: req.session.userId }); // Find expenses belonging to the logged-in user
        res.json(expenses); // Send the expenses as a JSON response
    } catch (error) {
        res.status(500).send('Server error'); // Send a 500 status on server error
    }
});

// Route to create a new expense
router.post('/', loggedIn, async (req, res) => {
    const { description } = req.body; // Destructure description from the request body
    const expense = new Expense({
        description,
        owner: req.session.userId // Set the owner to the logged-in user's ID
    });
    await expense.save(); // Save the new expense to the database
    res.status(201).json(expense); // Send the created expense as a JSON response with a 201 status
});

// Route to toggle the completion status of a expense
router.post('/toggle/:id', loggedIn, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id); // Find the expense by its ID
        if (!expense) {
            return res.status(404).send('Expense not found.'); // Send a 404 status if the expense is not found
        }
        expense.completed = !expense.completed; // Toggle the completion status
        await expense.save(); // Save the updated expense to the database
        res.json(expense); // Send the updated expense as a JSON response
    } catch (error) {
        res.status(500).send('Error toggling expense'); // Send a 500 status on error
    }
});

// Route to delete a expense
router.delete('/:id', loggedIn, async (req, res) => {
    try {
        const result = await Expense.findByIdAndDelete(req.params.id); // Find and delete the expense by its ID
        if (!result) {
            return res.status(404).send('Expense not found.'); // Send a 404 status if the expense is not found
        }
        res.status(200).send({ message: 'Deleted successfully' }); // Send a success message with a 200 status
    } catch (error) {
        res.status(500).send('Error deleting expense'); // Send a 500 status on error
    }
});

module.exports = router; // Export the router for use in other parts of the application
