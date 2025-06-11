const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// Add a new group
router.post('/add', async (req, res) => {
  const { name, members } = req.body;

  try {
    const newGroup = new Group({ name, members });
    await newGroup.save();
    res.status(201).json({ message: 'Group created', group: newGroup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('members');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
