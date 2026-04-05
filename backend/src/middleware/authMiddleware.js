const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route: kiểm tra JWT
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

// Middleware kiểm tra quyền admin/owner
const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền thực hiện thao tác này.' });
};

// Middleware kiểm tra quyền owner
const ownerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        return next();
    }
    return res.status(403).json({ message: 'Chỉ chủ cửa hàng mới có quyền thực hiện thao tác này.' });
};

module.exports = { protect, adminOnly, ownerOnly };
