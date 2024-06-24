// Import the express library to create a web server
const express = require("express");

// Instantiate an Express application
const app = express();

// Define a port number for the server to listen on
const PORT = 3000;

// Use middleware to automatically parse JSON formatted request bodies
app.use(express.json());

// Create an in-memory array to simulate a database for expenses
let expenses = [
  { id: 1, description: "Spent for Bus", amount: 100 },
  { id: 2, description: "Spent for Shopping", amount: 1000 },
];

// Define a route to handle GET requests to "/", which returns a welcome message
app.get("/", (req, res) => {
  res.send("Welcome to the Expense Tracker API!");
});

// Define a route to handle GET requests to "/expenses", which returns all expenses
app.get("/expenses", (req, res) => {
  res.status(200).json(expenses); // Send a 200 OK status and the list of expenses in JSON format
});

// Define a route to handle POST requests to "/expenses", which adds a new expense
app.post("/expenses", (req, res) => {
  console.log("Received body:", req.body); // Log the body of the incoming request to the console
  // Create a new expense object using the data provided in the request body or default values
  const newExpense = {
    id: expenses.length + 1, // Assign an ID that is one greater than the number of expenses
    description: req.body.description || "No description provided", // Use the description from the request or a default
    amount: req.body.amount !== undefined ? req.body.amount : 0, // Use the amount from the request or default to 0
  };
  console.log("Adding new expense:", newExpense); // Log the new expense object to the console
  expenses.push(newExpense); // Add the new expense to the array of expenses
  res.status(201).json(newExpense); // Respond with a 201 Created status and the new expense
});

// Define a route to handle PUT requests to "/expenses/:id", which updates an existing expense
app.put("/expenses/:id", (req, res) => {
  // Find the expense in the array that matches the id provided in the URL
  const expense = expenses.find((t) => t.id === parseInt(req.params.id));
  // If no expense is found, send a 404 Not Found status
  if (!expense) return res.status(404).send("Expense not found.");

  // Update the expense's description, amount, and completed status with the data from the request or retain the existing values
  expense.description = req.body.description || expense.description;
  expense.amount = req.body.amount !== undefined ? req.body.amount : expense.amount;
  expense.completed =
    req.body.completed !== undefined ? req.body.completed : expense.completed;
  // Respond with a 200 OK status and the updated expense
  res.status(200).json(expense);
});

// Define a route to handle DELETE requests to "/expenses/:id", which removes an existing expense
app.delete("/expenses/:id", (req, res) => {
  // Remove the expense that matches the id provided in the URL from the array
  expenses = expenses.filter((t) => t.id !== parseInt(req.params.id));
  // Respond with a 204 No Content status as there is no content to return
  res.status(204).send();
});

// Start the server and listen on the defined PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log a message to the console when the server starts
});