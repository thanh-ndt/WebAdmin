const express = require('express');
const router  = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
} = require('../controllers/userController');

// Tất cả routes yêu cầu đăng nhập và quyền owner
router.use(protect, ownerOnly);

// GET  /api/users/stats   — thống kê tổng quan (phải đặt trước /:id)
router.get('/stats', getUserStats);

// GET  /api/users         — danh sách có phân trang, tìm kiếm, lọc role
router.get('/', getAllUsers);

// GET  /api/users/:id     — chi tiết 1 user
router.get('/:id', getUserById);

// PUT  /api/users/:id     — cập nhật user
router.put('/:id', updateUser);

// DELETE /api/users/:id   — xóa user
router.delete('/:id', deleteUser);

module.exports = router;
