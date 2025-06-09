const Group = require('../models/Group');

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

    // Create group
    const group = new Group({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      members: members.filter(member => member.trim() !== ''), // Filter out empty members
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

    // Transform groups to match frontend interface
    const transformedGroups = groups.map(group => ({
      id: group._id,
      name: group.name,
      description: group.description,
      members: group.members,
      totalExpenses: 0, // Will be calculated from expenses
      balances: {}, // Will be calculated from expenses
      createdAt: group.createdAt,
    }));

    res.json({
      success: true,
      data: transformedGroups
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

    // Transform group to match frontend interface
    const transformedGroup = {
      id: group._id,
      name: group.name,
      description: group.description,
      members: group.members,
      totalExpenses: 0, // Will be calculated from expenses
      balances: {}, // Will be calculated from expenses
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