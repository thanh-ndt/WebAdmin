const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// GET /api/promotions/all - Lấy tất cả khuyến mãi (Admin)
router.get('/all', promotionController.getAllPromotions);

// POST /api/promotions - Tạo khuyến mãi mới
router.post('/', promotionController.createPromotion);

// PUT /api/promotions/:id - Cập nhật khuyến mãi
router.put('/:id', promotionController.updatePromotion);

// DELETE /api/promotions/:id - Xóa khuyến mãi
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
