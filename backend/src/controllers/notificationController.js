const AdminNotification = require('../models/AdminNotification');

// Lấy danh sách thông báo admin
const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await AdminNotification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AdminNotification.countDocuments();
        const unreadCount = await AdminNotification.countDocuments({ isRead: false });

        res.json({
            notifications,
            total,
            unreadCount,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đánh dấu 1 thông báo là đã đọc
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await AdminNotification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }
        
        res.json(notification);
    } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đánh dấu tất cả là đã đọc
const markAllAsRead = async (req, res) => {
    try {
        await AdminNotification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
        console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
