// server/controllers/userController.js
const User = require('../models/User');

// @route   GET api/users/leaderboard
// @desc    Get top users by points (for leaderboard)
// @access  Private (All authenticated users)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: { $ne: 'admin' } })
      .sort({ points: -1, username: 1 }) // Sort by points descending, then username ascending
      .select('username points role') // Select relevant fields
      .limit(10); // Get top 10 users

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Private (Admin can get any user, worker can get their own)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // A worker can only view their own profile, unless they are admin
    if (req.user.role === 'worker' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized to view this user profile' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   PUT api/users/redeem
// @desc    Simulate points redemption for logged-in worker
// @access  Private (Worker only)
exports.redeemPoints = async (req, res) => {
  const { pointsToRedeem } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.points < pointsToRedeem) {
      return res.status(400).json({ msg: 'Insufficient points for redemption' });
    }

    if (pointsToRedeem <= 0) {
        return res.status(400).json({ msg: 'Redemption amount must be positive' });
    }

    user.points -= pointsToRedeem;
    await user.save();

    // In a real system, you'd integrate with a gift card API or voucher generation here
    res.json({ msg: `${pointsToRedeem} points redeemed successfully! Your new balance is ${user.points}.` });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};