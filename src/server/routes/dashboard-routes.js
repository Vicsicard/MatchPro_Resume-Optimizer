import { Router } from 'express';
import OptimizationHistory from '../models/OptimizationHistory.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Get user's optimization history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const history = await OptimizationHistory.find({
      userId: req.user.id,
      status: { $ne: 'deleted' }
    })
    .sort({ date: -1 })
    .select('-originalResume -optimizedResume -jobPostingText'); // Exclude large text fields

    res.json(history);
  } catch (error) {
    console.error('Error fetching optimization history:', error);
    res.status(500).json({
      error: 'Failed to fetch optimization history',
      details: error.message
    });
  }
});

// Get specific optimization details
router.get('/optimization/:id', authenticateUser, async (req, res) => {
  try {
    const optimization = await OptimizationHistory.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: { $ne: 'deleted' }
    });

    if (!optimization) {
      return res.status(404).json({
        error: 'Optimization not found'
      });
    }

    res.json(optimization);
  } catch (error) {
    console.error('Error fetching optimization details:', error);
    res.status(500).json({
      error: 'Failed to fetch optimization details',
      details: error.message
    });
  }
});

// Mark optimization as applied
router.post('/mark-applied/:id', authenticateUser, async (req, res) => {
  try {
    const optimization = await OptimizationHistory.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        status: 'active'
      },
      { applied: true },
      { new: true }
    );

    if (!optimization) {
      return res.status(404).json({
        error: 'Optimization not found'
      });
    }

    res.json(optimization);
  } catch (error) {
    console.error('Error marking optimization as applied:', error);
    res.status(500).json({
      error: 'Failed to update application status',
      details: error.message
    });
  }
});

// Delete optimization (soft delete)
router.delete('/optimization/:id', authenticateUser, async (req, res) => {
  try {
    const optimization = await OptimizationHistory.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        status: { $ne: 'deleted' }
      },
      { status: 'deleted' },
      { new: true }
    );

    if (!optimization) {
      return res.status(404).json({
        error: 'Optimization not found'
      });
    }

    res.json({ message: 'Optimization deleted successfully' });
  } catch (error) {
    console.error('Error deleting optimization:', error);
    res.status(500).json({
      error: 'Failed to delete optimization',
      details: error.message
    });
  }
});

// Get dashboard statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const [totalOptimizations, appliedCount, averageScore] = await Promise.all([
      OptimizationHistory.countDocuments({
        userId: req.user.id,
        status: 'active'
      }),
      OptimizationHistory.countDocuments({
        userId: req.user.id,
        status: 'active',
        applied: true
      }),
      OptimizationHistory.aggregate([
        {
          $match: {
            userId: req.user.id,
            status: 'active'
          }
        },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$matchScore' }
          }
        }
      ])
    ]);

    res.json({
      totalOptimizations,
      appliedCount,
      averageScore: averageScore[0]?.averageScore || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
});

export default router;
