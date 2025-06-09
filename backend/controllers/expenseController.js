// controllers/expenseController.js
const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  const { title, amount, paidBy, sharedWith, groupId, date } = req.body;

  try {
    const expense = new Expense({
      title,
      amount,
      paidBy,
      sharedWith,
      groupId,
      date: date || new Date(),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExpensesByGroup = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
