const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');

// ========================
// ADMIN: TẠO KHUYẾN MÃI MỚI
// ========================
const createPromotion = async (req, res) => {
    try {
        const { code, discountValue, type, validFrom, validTo, description, applicableModels } = req.body;

        if (!code || !discountValue || !type || !validFrom || !validTo) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const existingPromo = await Promotion.findOne({ code: code.toUpperCase() });
        if (existingPromo) {
            return res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã tồn tại' });
        }

        const newPromotion = new Promotion({
            code: code.toUpperCase(),
            discountValue,
            type,
            validFrom,
            validTo,
            description,
            applicableModels: applicableModels || [],
        });

        await newPromotion.save();
        res.status(201).json({ success: true, message: 'Tạo khuyến mãi thành công', data: newPromotion });
    } catch (error) {
        console.error('Lỗi createPromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo khuyến mãi' });
    }
};

// ========================
// LẤY TẤT CẢ KHUYẾN MÃI (ADMIN)
// ========================
const getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().populate('applicableModels', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: promotions });
    } catch (error) {
        console.error('Lỗi getAllPromotions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// CẬP NHẬT KHUYẾN MÃI
// ========================
const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.code) updateData.code = updateData.code.toUpperCase();

        const updatedPromotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPromotion) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
        }

        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedPromotion });
    } catch (error) {
        console.error('Lỗi updatePromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// XÓA KHUYẾN MÃI
// ========================
const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Promotion.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
        }
        res.status(200).json({ success: true, message: 'Xóa khuyến mãi thành công' });
    } catch (error) {
        console.error('Lỗi deletePromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    createPromotion,
    getAllPromotions,
    updatePromotion,
    deletePromotion
};
