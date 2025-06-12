const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, participants, date } = req.body;

    // Validation
    if (!groupId || !description || !amount || !paidBy || !participants || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Check if group exists and user has access
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add expenses to this group' });
    }

    // Validate that paidBy and participants are group members
    const validMembers = group.members;
    if (!validMembers.includes(paidBy.trim())) {
      return res.status(400).json({ message: 'Payer must be a group member' });
    }

    const invalidParticipants = participants.filter(p => !validMembers.includes(p.trim()));
    if (invalidParticipants.length > 0) {
      return res.status(400).json({ 
        message: `Invalid participants: ${invalidParticipants.join(', ')}` 
      });
    }

    // Create expense
    const expense = new Expense({
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy: paidBy.trim(),
      participants: participants.map(p => p.trim()),
      groupId,
      date,
      createdBy: req.user._id,
    });

    const savedExpense = await expense.save();

    // Transform expense to match frontend interface
    const transformedExpense = {
      id: savedExpense._id,
      groupId: savedExpense.groupId,
      description: savedExpense.description,
      amount: savedExpense.amount,
      paidBy: savedExpense.paidBy,
      participants: savedExpense.participants,
      date: savedExpense.date,
      createdAt: savedExpense.createdAt,
    };

    res.status(201).json({
      success: true,
      data: transformedExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    res.status(500).json({ message: 'Server error while creating expense' });
  }
};

// Get expenses for a specific group
exports.getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists and user has access
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    // Get expenses for the group
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });

    // Transform expenses to match frontend interface
    const transformedExpenses = expenses.map(expense => ({
      id: expense._id,
      groupId: expense.groupId,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      participants: expense.participants,
      date: expense.date,
      createdAt: expense.createdAt,
    }));

    res.json({
      success: true,
      data: transformedExpenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};

// Get all expenses for the authenticated user
exports.getAllExpenses = async (req, res) => {
  try {
    // Get all groups for the user
    const userGroups = await Group.find({ createdBy: req.user._id });
    const groupIds = userGroups.map(group => group._id);

    // Get all expenses for these groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).sort({ createdAt: -1 });

    // Transform expenses to match frontend interface
    const transformedExpenses = expenses.map(expense => ({
      id: expense._id,
      groupId: expense.groupId,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      participants: expense.participants,
      date: expense.date,
      createdAt: expense.createdAt,
    }));

    res.json({
      success: true,
      data: transformedExpenses
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};