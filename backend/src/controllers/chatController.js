const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// GET /api/chats - Lấy danh sách phòng chat
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find()
      .populate('customer', 'fullName email avatar')
      .populate('owner', 'fullName email avatar')
      .sort({ updatedAt: -1 });

    // Lấy tin nhắn cuối cùng cho mỗi phòng chat
    const roomsWithLastMessage = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await Message.findOne({ chatRoom: room._id })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          chatRoom: room._id,
          senderId: room.customer?._id,
        });

        return {
          ...room.toObject(),
          lastMessage: lastMessage?.content || 'Chưa có tin nhắn',
          lastMessageTime: lastMessage?.createdAt || room.createdAt,
          unreadCount,
        };
      })
    );

    res.json(roomsWithLastMessage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/chats/:roomId/messages - Lấy tin nhắn trong phòng chat
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const total = await Message.countDocuments({ chatRoom: req.params.roomId });
    const messages = await Message.find({ chatRoom: req.params.roomId })
      .populate('senderId', 'fullName avatar')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      messages,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/chats/:roomId/messages - Gửi tin nhắn (admin reply)
exports.sendMessage = async (req, res) => {
  try {
    const { content, senderId } = req.body;

    const message = new Message({
      chatRoom: req.params.roomId,
      senderId,
      content,
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'fullName avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
  }
};
