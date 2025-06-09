const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
