const User = require('../models/User');
const Order = require('../models/Order');

// ========================
// LẤY DANH SÁCH NGƯỜI DÙNG
// GET /api/users?page=1&limit=10&search=&role=
// ========================
const getAllUsers = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const { search = '', role = '' } = req.query;

        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (search.trim()) {
            filter.$or = [
                { fullName:    { $regex: search, $options: 'i' } },
                { email:       { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -resetPasswordToken -resetPasswordExpires -emailVerifyToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách users:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// ========================
// LẤY CHI TIẾT 1 NGƯỜI DÙNG
// GET /api/users/:id
// ========================
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires -emailVerifyToken');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        // Lấy thêm số đơn hàng của user
        const orderCount = await Order.countDocuments({ customer: user._id });

        res.json({
            success: true,
            data: { ...user.toObject(), orderCount },
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết user:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// ========================
// CẬP NHẬT NGƯỜI DÙNG
// PUT /api/users/:id
// ========================
const updateUser = async (req, res) => {
    try {
        const { fullName, phoneNumber, role, isEmailVerified } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        // Không cho phép tự xóa quyền owner của chính mình
        if (req.user._id.toString() === user._id.toString() && role && role !== 'owner') {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi quyền của chính bạn.' });
        }

        if (fullName        !== undefined) user.fullName        = fullName;
        if (phoneNumber     !== undefined) user.phoneNumber     = phoneNumber;
        if (role            !== undefined) user.role            = role;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

        await user.save();

        const updated = await User.findById(user._id)
            .select('-password -resetPasswordToken -resetPasswordExpires -emailVerifyToken');

        res.json({ success: true, message: 'Cập nhật người dùng thành công!', data: updated });
    } catch (error) {
        console.error('Lỗi cập nhật user:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// ========================
// XÓA NGƯỜI DÙNG
// DELETE /api/users/:id
// ========================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        // Không cho phép xóa chính mình
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính bạn.' });
        }

        // Không cho phép xóa owner khác
        if (user.role === 'owner') {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản quản trị viên.' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Xóa người dùng thành công!' });
    } catch (error) {
        console.error('Lỗi xóa user:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// ========================
// THỐNG KÊ NGƯỜI DÙNG
// GET /api/users/stats
// ========================
const getUserStats = async (req, res) => {
    try {
        const now       = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [total, customers, owners, verified, newThisMonth] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'owner' }),
            User.countDocuments({ isEmailVerified: true }),
            User.countDocuments({ createdAt: { $gte: monthStart } }),
        ]);

        res.json({
            success: true,
            data: { total, customers, owners, verified, newThisMonth },
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê users:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getUserStats };
