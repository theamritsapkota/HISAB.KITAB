const User = require('./models/User'); // Make sure this path is correct
const bcrypt = require('bcryptjs');

app.post('/api/test-register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});
