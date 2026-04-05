const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

// GET /api/returns/stats — Lấy thống kê
const getReturnStats = async (req, res) => {
    try {
        const total = await ReturnRequest.countDocuments();
        const pending = await ReturnRequest.countDocuments({ status: 'pending' });
        const approved = await ReturnRequest.countDocuments({ status: 'approved' });
        const rejected = await ReturnRequest.countDocuments({ status: 'rejected' });

        res.json({
            success: true,
            data: { total, pending, approved, rejected }
        });
    } catch (error) {
        console.error('Lỗi getReturnStats:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy thống kê yêu cầu trả hàng' });
    }
};

// GET /api/returns — Lấy danh sách (có phân trang & lọc theo status)
const getReturnRequests = async (req, res) => {
    try {
        const { status, searchTerm, page = 1, limit = 10 } = req.query;
        let matchStage = {};

        if (status && status !== 'all') {
            matchStage.status = status;
        }

        // Tạo order match stage nếu có searchTerm (tuỳ chọn)
        
        let query = ReturnRequest.find(matchStage)
            .populate({
                path: 'order',
                populate: { path: 'customer', select: 'fullName email phoneNumber' }
            })
            .sort({ createdAt: -1 });

        // Thực hiện query
        const requests = await query;

        // Nếu có searchTerm, lọc in memory (vì reference qua Order/User)
        let filteredRequests = requests;
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            filteredRequests = requests.filter(req => {
                const order = req.order;
                if (!order) return false;
                const customer = order.customer;
                return (
                    (customer && customer.fullName && regex.test(customer.fullName)) ||
                    (customer && customer.phoneNumber && regex.test(customer.phoneNumber)) ||
                    (order._id && regex.test(order._id.toString()))
                );
            });
        }

        // Pagination
        const total = filteredRequests.length;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedRequests,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Lỗi getReturnRequests:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu trả hàng' });
    }
};

// PUT /api/returns/:id/status — Cập nhật trạng thái
const updateReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }

        const returnReq = await ReturnRequest.findById(id);
        if (!returnReq) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
        }

        if (returnReq.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Yêu cầu này đã được xử lý' });
        }

        returnReq.status = status;
        await returnReq.save();

        res.json({
            success: true,
            message: `Đã ${status === 'approved' ? 'chấp nhận' : 'từ chối'} yêu cầu trả hàng`,
            data: returnReq
        });
    } catch (error) {
        console.error('Lỗi updateReturnStatus:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái' });
    }
};

module.exports = {
    getReturnStats,
    getReturnRequests,
    updateReturnStatus,
};
