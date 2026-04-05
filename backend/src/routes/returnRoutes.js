const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getReturnStats, getReturnRequests, updateReturnStatus } = require('../controllers/returnController');

// Phân quyền cho tất cả thao tác trả hàng ở admin
router.use(protect, adminOnly);

// Lấy thống kê
router.get('/stats', getReturnStats);

// Lấy danh sách yêu cầu
router.get('/', getReturnRequests);

// Cập nhật trạng thái duyệt / từ chối
router.put('/:id/status', updateReturnStatus);

module.exports = router;
