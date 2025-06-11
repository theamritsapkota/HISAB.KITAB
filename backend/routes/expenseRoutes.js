const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Add an expense
router.post('/add', async (req, res) => {
  const { title, amount, group, paidBy, splitAmong, date } = req.body;

  try {
    const newExpense = new Expense({ title, amount, group, paidBy, splitAmong, date });
    await newExpense.save();
    res.status(201).json({ message: 'Expense added', expense: newExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('group paidBy splitAmong');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
