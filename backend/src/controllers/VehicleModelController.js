const VehicleModel = require('../models/VehicleModel');

// GET /api/vehicle-models
exports.getAllModels = async (req, res) => {
    try {
        const models = await VehicleModel.find().populate('brand', 'name').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: models
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách dòng xe',
            error: error.message
        });
    }
};

// GET /api/vehicle-models/stats
exports.getModelStats = async (req, res) => {
    try {
        const total = await VehicleModel.countDocuments();
        res.status(200).json({
            success: true,
            data: { total }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê dòng xe'
        });
    }
};

// POST /api/vehicle-models
exports.createModel = async (req, res) => {
    try {
        const newModel = await VehicleModel.create(req.body);
        res.status(201).json({
            success: true,
            data: newModel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi tạo dòng xe mới'
        });
    }
};

// PUT /api/vehicle-models/:id
exports.updateModel = async (req, res) => {
    try {
        const updatedModel = await VehicleModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedModel) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dòng xe'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedModel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi cập nhật dòng xe'
        });
    }
};

// DELETE /api/vehicle-models/:id
exports.deleteModel = async (req, res) => {
    try {
        const deletedModel = await VehicleModel.findByIdAndDelete(req.params.id);

        if (!deletedModel) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dòng xe'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa dòng xe thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa dòng xe'
        });
    }
};
