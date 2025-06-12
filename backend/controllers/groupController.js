const Group = require('../models/Group');
const Expense = require('../models/Expense');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'At least one member is required' });
    }

    // Filter out empty members
    const validMembers = members.filter(member => member && member.trim() !== '');
    
    if (validMembers.length === 0) {
      return res.status(400).json({ message: 'At least one valid member is required' });
    }

    // Create group
    const group = new Group({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      members: validMembers.map(member => member.trim()),
    });

    const savedGroup = await group.save();

    res.status(201).json({
      success: true,
      data: {
        id: savedGroup._id,
        name: savedGroup.name,
        description: savedGroup.description,
        members: savedGroup.members,
        totalExpenses: 0,
        balances: {},
        createdAt: savedGroup.createdAt,
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error while creating group' });
  }
};

// Get all groups for the authenticated user
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // Calculate expenses and balances for each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        try {
          // Get expenses for this group
          const expenses = await Expense.find({ groupId: group._id });
          
          // Calculate total expenses
          const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
          
          // Calculate balances
          const balances = {};
          group.members.forEach(member => {
            balances[member] = 0;
          });

          expenses.forEach(expense => {
            const splitAmount = expense.amount / expense.participants.length;
            
            // Add to payer's balance
            if (balances.hasOwnProperty(expense.paidBy)) {
              balances[expense.paidBy] += expense.amount;
            }
            
            // Subtract split amount from each participant
            expense.participants.forEach(participant => {
              if (balances.hasOwnProperty(participant)) {
                balances[participant] -= splitAmount;
              }
            });
          });

          return {
            id: group._id,
            name: group.name,
            description: group.description,
            members: group.members,
            totalExpenses,
            balances,
            createdAt: group.createdAt,
          };
        } catch (error) {
          console.error(`Error calculating stats for group ${group._id}:`, error);
          return {
            id: group._id,
            name: group.name,
            description: group.description,
            members: group.members,
            totalExpenses: 0,
            balances: {},
            createdAt: group.createdAt,
          };
        }
      })
    );

    res.json({
      success: true,
      data: groupsWithStats
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error while fetching groups' });
  }
};

// Get a specific group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user has access to this group
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    // Get expenses for this group
    const expenses = await Expense.find({ groupId: group._id });
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate balances
    const balances = {};
    group.members.forEach(member => {
      balances[member] = 0;
    });

    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.participants.length;
      
      // Add to payer's balance
      if (balances.hasOwnProperty(expense.paidBy)) {
        balances[expense.paidBy] += expense.amount;
      }
      
      // Subtract split amount from each participant
      expense.participants.forEach(participant => {
        if (balances.hasOwnProperty(participant)) {
          balances[participant] -= splitAmount;
        }
      });
    });

    // Transform group to match frontend interface
    const transformedGroup = {
      id: group._id,
      name: group.name,
      description: group.description,
      members: group.members,
      totalExpenses,
      balances,
      createdAt: group.createdAt,
    };

    res.json({
      success: true,
      data: transformedGroup
    });
  } catch (error) {
    console.error('Get group by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    res.status(500).json({ message: 'Server error while fetching group' });
  }
};