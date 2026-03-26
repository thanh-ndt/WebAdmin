const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/CNPMHDT')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      
      // 1. Get Owner
      const owner = await db.collection('users').findOne({ role: 'owner' });
      if (!owner) {
        console.log('No owner found. Please create one first.');
        process.exit(1);
      }

      // 2. Get/Create Customers
      let customer1 = await db.collection('users').findOne({ email: 'khachhang1@gmail.com' });
      if (!customer1) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const res = await db.collection('users').insertOne({
          email: 'khachhang1@gmail.com', password: hashedPassword, role: 'customer', fullName: 'Nguyễn Văn A', isEmailVerified: true, createdAt: new Date(), updatedAt: new Date()
        });
        customer1 = { _id: res.insertedId };
      }
      
      let customer2 = await db.collection('users').findOne({ email: 'khachhang2@gmail.com' });
      if (!customer2) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const res = await db.collection('users').insertOne({
          email: 'khachhang2@gmail.com', password: hashedPassword, role: 'customer', fullName: 'Trần Thị B', isEmailVerified: true, createdAt: new Date(), updatedAt: new Date()
        });
        customer2 = { _id: res.insertedId };
      }

      // 3. Create Chat Rooms
      await db.collection('chatrooms').deleteMany({}); // clear old dummy
      const room1Res = await db.collection('chatrooms').insertOne({
        customer: customer1._id, owner: owner._id, createdDate: new Date(), createdAt: new Date(), updatedAt: new Date()
      });
      const room2Res = await db.collection('chatrooms').insertOne({
        customer: customer2._id, owner: owner._id, createdDate: new Date(), createdAt: new Date(), updatedAt: new Date()
      });

      // 4. Create Messages
      await db.collection('messages').deleteMany({});
      const messagesToInsert = [
        { chatRoom: room1Res.insertedId, senderId: customer1._id, content: 'Chào shop, cho mình hỏi về xe Winner X', sendTime: new Date(Date.now() - 3600000), createdDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { chatRoom: room1Res.insertedId, senderId: owner._id, content: 'Chào bạn, xe Winner X hiện đang có sẵn tại cửa hàng ạ.', sendTime: new Date(Date.now() - 3500000), createdDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { chatRoom: room1Res.insertedId, senderId: customer1._id, content: 'Giá xe đang là bao nhiêu vậy ạ?', sendTime: new Date(Date.now() - 3000000), createdDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { chatRoom: room2Res.insertedId, senderId: customer2._id, content: 'Shop ơi mình muốn đăng ký bảo dưỡng xe.', sendTime: new Date(Date.now() - 7200000), createdDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
      ];
      await db.collection('messages').insertMany(messagesToInsert);

      // 5. Create Appointments
      const vehicles = await db.collection('vehicles').find().limit(2).toArray();
      await db.collection('testdriveappointments').deleteMany({});
      
      if (vehicles.length > 0) {
        const apptsContext = [
          { customer: customer1._id, guestName: 'Nguyễn Văn A', guestPhone: '0901234567', vehicle: vehicles[0]._id, appointmentDate: new Date(Date.now() + 86400000 * 2), timeSlot: '09:00 - 10:00', status: 'pending', note: 'Mình muốn xem xe màu đen', createdAt: new Date(), updatedAt: new Date() },
          { customer: customer2._id, guestName: 'Trần Thị B', guestPhone: '0987654321', vehicle: vehicles[1]?._id || vehicles[0]._id, appointmentDate: new Date(Date.now() + 86400000 * 3), timeSlot: '14:00 - 15:00', status: 'confirmed', note: 'Nhờ shop chuẩn bị sẵn xe', createdAt: new Date(), updatedAt: new Date() },
          { guestName: 'Lê Văn C', guestPhone: '0911223344', vehicle: vehicles[0]._id, appointmentDate: new Date(Date.now() - 86400000), timeSlot: '10:00 - 11:00', status: 'completed', note: 'Đã lái thử và ưng ý', createdAt: new Date(), updatedAt: new Date() }
        ];
        await db.collection('testdriveappointments').insertMany(apptsContext);
      }

      console.log('Dummy data inserted successfully!');
      process.exit(0);
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  });
