/**
 * Seed script: Khởi tạo dữ liệu mẫu cho database CNPMHDT (WebAdmin)
 * Chạy: npm run seed
 *
 * Thứ tự insert:
 *  1. Brands
 *  2. VehicleModels
 *  3. Users  (1 owner + 4 customers)
 *  4. Vehicles
 *  5. Promotions
 *  6. Orders + OrderDetails
 *  7. Reviews
 *  8. TestDriveAppointments
 *  9. ChatRooms + Messages
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Brand                 = require('../models/Brand');
const VehicleModel          = require('../models/VehicleModel');
const User                  = require('../models/User');
const Vehicle               = require('../models/Vehicle');
const Promotion             = require('../models/Promotion');
const Order                 = require('../models/Order');
const OrderDetail           = require('../models/OrderDetail');
const Review                = require('../models/Review');
const TestDriveAppointment  = require('../models/TestDriveAppointment');
const ChatRoom              = require('../models/ChatRoom');
const Message               = require('../models/Message');

// ─── Helper ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const past  = (days) => new Date(Date.now() - days * 86400000);
const future = (days) => new Date(Date.now() + days * 86400000);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công:', process.env.MONGO_URI);

  // Xóa toàn bộ dữ liệu cũ
  await Promise.all([
    Brand.deleteMany({}),
    VehicleModel.deleteMany({}),
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Promotion.deleteMany({}),
    Order.deleteMany({}),
    OrderDetail.deleteMany({}),
    Review.deleteMany({}),
    TestDriveAppointment.deleteMany({}),
    ChatRoom.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🗑️  Đã xóa dữ liệu cũ');

  // ── 1. BRANDS ──────────────────────────────────────────────────────────────
  const brands = await Brand.insertMany([
    { name: 'Honda',   country: 'Nhật Bản',  description: 'Thương hiệu xe máy số 1 thế giới, nổi tiếng với độ bền và tiết kiệm nhiên liệu.' },
    { name: 'Yamaha',  country: 'Nhật Bản',  description: 'Thương hiệu Nhật Bản nổi tiếng với thiết kế thể thao và công nghệ tiên tiến.' },
    { name: 'Suzuki',  country: 'Nhật Bản',  description: 'Thương hiệu Nhật uy tín với các dòng xe số và tay ga chất lượng cao.' },
    { name: 'Piaggio', country: 'Ý',         description: 'Thương hiệu Châu Âu biểu tượng của phong cách Ý với dòng xe Vespa và Liberty.' },
    { name: 'VinFast', country: 'Việt Nam',  description: 'Thương hiệu xe điện Việt Nam đầu tiên với cam kết phát triển xanh bền vững.' },
  ]);
  const [honda, yamaha, suzuki, piaggio, vinfast] = brands;
  console.log(`✅ Đã tạo ${brands.length} thương hiệu`);

  // ── 2. VEHICLE MODELS ──────────────────────────────────────────────────────
  const vehicleModels = await VehicleModel.insertMany([
    { name: 'Wave Series',     engineType: 'Động cơ 4 thì, 1 xy lanh',       fuelType: 'Xăng',  description: 'Dòng xe số phổ thông, kinh tế, bền bỉ' },
    { name: 'Vision Series',   engineType: 'Động cơ 4 thì SOHC, 1 xy lanh',  fuelType: 'Xăng',  description: 'Dòng xe tay ga đô thị tiết kiệm nhiên liệu' },
    { name: 'Air Blade Series',engineType: 'Động cơ 4 thì SOHC eSP',         fuelType: 'Xăng',  description: 'Tay ga thể thao, mạnh mẽ và tiết kiệm' },
    { name: 'Exciter Series',  engineType: 'Động cơ 4 thì DOHC, VVA',        fuelType: 'Xăng',  description: 'Dòng xe thể thao underbone phong cách' },
    { name: 'Grande Series',   engineType: 'Động cơ Blue Core 125cc',        fuelType: 'Xăng',  description: 'Tay ga cao cấp dành cho phụ nữ hiện đại' },
    { name: 'Klara Series',    engineType: 'Động cơ điện không chổi than',    fuelType: 'Điện',  description: 'Xe máy điện thân thiện môi trường' },
    { name: 'Vespa Series',    engineType: 'Động cơ 4 thì, làm mát bằng không khí', fuelType: 'Xăng', description: 'Biểu tượng phong cách châu Âu' },
  ]);
  const [waveModel, visionModel, airBladeModel, exciterModel, grandeModel, klaraModel, vespaModel] = vehicleModels;
  console.log(`✅ Đã tạo ${vehicleModels.length} dòng xe`);

  // ── 3. USERS ───────────────────────────────────────────────────────────────
  const hashPw = (pw) => bcrypt.hash(pw, 10);

  const [ownerPw, c1Pw, c2Pw, c3Pw, c4Pw] = await Promise.all([
    hashPw('Admin@123'),
    hashPw('123456'),
    hashPw('123456'),
    hashPw('123456'),
    hashPw('123456'),
  ]);

  const users = await User.insertMany([
    {
      email: 'admin@uteshop.com',
      password: ownerPw,
      role: 'owner',
      fullName: 'Quản Trị Viên',
      phoneNumber: '0901111111',
      isEmailVerified: true,
      dob: new Date('1990-01-15'),
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    },
    {
      email: 'nguyenvana@gmail.com',
      password: c1Pw,
      role: 'customer',
      fullName: 'Nguyễn Văn An',
      phoneNumber: '0912345678',
      isEmailVerified: true,
      dob: new Date('1998-05-20'),
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=E74C3C&color=fff',
    },
    {
      email: 'tranthib@gmail.com',
      password: c2Pw,
      role: 'customer',
      fullName: 'Trần Thị Bình',
      phoneNumber: '0987654321',
      isEmailVerified: true,
      dob: new Date('2000-08-12'),
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=27AE60&color=fff',
    },
    {
      email: 'levanc@gmail.com',
      password: c3Pw,
      role: 'customer',
      fullName: 'Lê Văn Cường',
      phoneNumber: '0934567890',
      isEmailVerified: true,
      dob: new Date('1995-03-30'),
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=8E44AD&color=fff',
    },
    {
      email: 'phamthid@gmail.com',
      password: c4Pw,
      role: 'customer',
      fullName: 'Phạm Thị Dung',
      phoneNumber: '0967890123',
      isEmailVerified: false,
      dob: new Date('2001-11-05'),
      avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=F39C12&color=fff',
    },
  ]);
  const [owner, cust1, cust2, cust3, cust4] = users;
  console.log(`✅ Đã tạo ${users.length} người dùng (1 owner + 4 customers)`);
  console.log(`   👤 Owner: admin@uteshop.com / Admin@123`);
  console.log(`   👥 Customers: nguyenvana | tranthib | levanc | phamthid @gmail.com / 123456`);

  // ── 4. VEHICLES ────────────────────────────────────────────────────────────
  const vehicles = await Vehicle.insertMany([
    {
      name: 'Honda Wave Alpha 110cc',
      brand: honda._id,
      vehicleModel: waveModel._id,
      category: 'Xe số',
      engineCapacity: 110,
      manufacture: 2024,
      description: 'Xe số phổ thông bền bỉ, tiết kiệm nhiên liệu, phù hợp đi lại hàng ngày.',
      price: 18500000,
      stockQuantity: 25,
      status: 'available',
      rating: 4.5,
      soldCount: 120,
      numReviews: 45,
      favoritesCount: 30,
      specifications: { 'Dung tích xy lanh': '109.1 cc', 'Công suất tối đa': '8.08 mã lực', 'Mô-men xoắn': '8.43 Nm', 'Mức tiêu thụ nhiên liệu': '1.6 lít/100km', 'Trọng lượng': '99 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/honda_wave_alpha_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/honda_wave_alpha_2.jpg',
      ],
    },
    {
      name: 'Honda Vision 110cc',
      brand: honda._id,
      vehicleModel: visionModel._id,
      category: 'Xe ga',
      engineCapacity: 110,
      manufacture: 2024,
      description: 'Tay ga đô thị thông minh, tiết kiệm nhiên liệu, thiết kế hiện đại.',
      price: 30900000,
      stockQuantity: 18,
      status: 'available',
      rating: 4.7,
      soldCount: 200,
      numReviews: 80,
      favoritesCount: 95,
      specifications: { 'Dung tích xy lanh': '109.1 cc', 'Công suất tối đa': '8.26 mã lực', 'Mô-men xoắn': '9.0 Nm', 'Mức tiêu thụ nhiên liệu': '1.8 lít/100km', 'Trọng lượng': '106 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/honda_vision_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/honda_vision_2.jpg',
      ],
    },
    {
      name: 'Honda Air Blade 125cc',
      brand: honda._id,
      vehicleModel: airBladeModel._id,
      category: 'Xe ga',
      engineCapacity: 125,
      manufacture: 2024,
      description: 'Tay ga thể thao mạnh mẽ với công nghệ eSP tiên tiến, thiết kế hầm hố.',
      price: 47900000,
      stockQuantity: 12,
      status: 'available',
      rating: 4.8,
      soldCount: 150,
      numReviews: 60,
      favoritesCount: 70,
      specifications: { 'Dung tích xy lanh': '124.8 cc', 'Công suất tối đa': '11.2 mã lực', 'Mô-men xoắn': '11.0 Nm', 'Mức tiêu thụ nhiên liệu': '2.0 lít/100km', 'Trọng lượng': '116 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/honda_air_blade_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/honda_air_blade_2.jpg',
      ],
    },
    {
      name: 'Yamaha Exciter 155 VVA',
      brand: yamaha._id,
      vehicleModel: exciterModel._id,
      category: 'Xe thể thao',
      engineCapacity: 155,
      manufacture: 2024,
      description: 'Underbone thể thao đỉnh cao với công nghệ VVA, thiết kế đậm chất đua xe.',
      price: 52900000,
      stockQuantity: 8,
      status: 'available',
      rating: 4.9,
      soldCount: 90,
      numReviews: 40,
      favoritesCount: 110,
      specifications: { 'Dung tích xy lanh': '155 cc', 'Công suất tối đa': '19.3 mã lực', 'Mô-men xoắn': '14.7 Nm', 'Mức tiêu thụ nhiên liệu': '2.5 lít/100km', 'Trọng lượng': '118 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/yamaha_exciter_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/yamaha_exciter_2.jpg',
      ],
    },
    {
      name: 'Yamaha Grande 125cc',
      brand: yamaha._id,
      vehicleModel: grandeModel._id,
      category: 'Xe ga',
      engineCapacity: 125,
      manufacture: 2024,
      description: 'Tay ga nữ cao cấp với Smart Key, thiết kế thanh lịch, đầy nữ tính.',
      price: 49900000,
      stockQuantity: 15,
      status: 'available',
      rating: 4.6,
      soldCount: 75,
      numReviews: 35,
      favoritesCount: 88,
      specifications: { 'Dung tích xy lanh': '124.7 cc', 'Công suất tối đa': '9.0 mã lực', 'Mô-men xoắn': '10.1 Nm', 'Mức tiêu thụ nhiên liệu': '1.9 lít/100km', 'Trọng lượng': '110 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/yamaha_grande_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/yamaha_grande_2.jpg',
      ],
    },
    {
      name: 'Suzuki Raider R150',
      brand: suzuki._id,
      vehicleModel: exciterModel._id,
      category: 'Xe thể thao',
      engineCapacity: 150,
      manufacture: 2023,
      description: 'Xe số thể thao 150cc mạnh mẽ, phong cách racing, phù hợp bạn trẻ năng động.',
      price: 44900000,
      stockQuantity: 5,
      status: 'available',
      rating: 4.4,
      soldCount: 40,
      numReviews: 20,
      favoritesCount: 50,
      specifications: { 'Dung tích xy lanh': '147.3 cc', 'Công suất tối đa': '16.5 mã lực', 'Mô-men xoắn': '13.8 Nm', 'Mức tiêu thụ nhiên liệu': '2.3 lít/100km', 'Trọng lượng': '120 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/suzuki_raider_1.jpg',
      ],
    },
    {
      name: 'Piaggio Vespa Sprint 125',
      brand: piaggio._id,
      vehicleModel: vespaModel._id,
      category: 'Xe ga',
      engineCapacity: 125,
      manufacture: 2024,
      description: 'Biểu tượng thời trang Ý, sang trọng và phong cách, cốt thép chắc chắn.',
      price: 82900000,
      stockQuantity: 6,
      status: 'available',
      rating: 4.7,
      soldCount: 30,
      numReviews: 18,
      favoritesCount: 65,
      specifications: { 'Dung tích xy lanh': '124.4 cc', 'Công suất tối đa': '9.8 mã lực', 'Mô-men xoắn': '10.9 Nm', 'Mức tiêu thụ nhiên liệu': '2.5 lít/100km', 'Trọng lượng': '126 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/vespa_sprint_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/vespa_sprint_2.jpg',
      ],
    },
    {
      name: 'VinFast Klara S',
      brand: vinfast._id,
      vehicleModel: klaraModel._id,
      category: 'Xe điện',
      engineCapacity: 0,
      manufacture: 2024,
      description: 'Xe máy điện thông minh Made in Vietnam, pin lithium-ion, sạc nhanh.',
      price: 21990000,
      stockQuantity: 20,
      status: 'available',
      rating: 4.3,
      soldCount: 55,
      numReviews: 25,
      favoritesCount: 40,
      specifications: { 'Công suất động cơ': '2000W', 'Tốc độ tối đa': '60 km/h', 'Phạm vi hoạt động': '85 km/lần sạc', 'Thời gian sạc đầy': '4-5 giờ', 'Trọng lượng': '98 kg' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/vinfast_klara_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/vinfast_klara_2.jpg',
      ],
    },
    {
      name: 'Honda SH 160i',
      brand: honda._id,
      vehicleModel: airBladeModel._id,
      category: 'Xe ga',
      engineCapacity: 157,
      manufacture: 2024,
      description: 'Tay ga cao cấp hàng đầu với Smart Key, phanh ABS và thiết kế đẳng cấp.',
      price: 95000000,
      stockQuantity: 4,
      status: 'available',
      rating: 4.9,
      soldCount: 20,
      numReviews: 15,
      favoritesCount: 120,
      specifications: { 'Dung tích xy lanh': '156.9 cc', 'Công suất tối đa': '14.6 mã lực', 'Mô-men xoắn': '15.1 Nm', 'Mức tiêu thụ nhiên liệu': '2.3 lít/100km', 'Phanh': 'ABS cả 2 bánh' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/honda_sh160_1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/honda_sh160_2.jpg',
      ],
    },
    {
      name: 'Yamaha NVX 155 VVA',
      brand: yamaha._id,
      vehicleModel: visionModel._id,
      category: 'Xe ga',
      engineCapacity: 155,
      manufacture: 2023,
      description: 'Maxi-scooter thể thao với khung gầm chắc chắn, cốp xe rộng rãi.',
      price: 55400000,
      stockQuantity: 0,
      status: 'out_of_stock',
      rating: 4.5,
      soldCount: 65,
      numReviews: 28,
      favoritesCount: 55,
      specifications: { 'Dung tích xy lanh': '155 cc', 'Công suất tối đa': '14.7 mã lực', 'Mô-men xoắn': '13.5 Nm', 'Dung tích cốp xe': '30 lít', 'Mức tiêu thụ nhiên liệu': '2.2 lít/100km' },
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/yamaha_nvx_1.jpg',
      ],
    },
  ]);
  console.log(`✅ Đã tạo ${vehicles.length} xe`);

  // ── 5. PROMOTIONS ──────────────────────────────────────────────────────────
  const promotions = await Promotion.insertMany([
    {
      code: 'SUMMER2026',
      discountValue: 10,
      type: 'percentage',
      validFrom: past(30),
      validTo: future(60),
    },
    {
      code: 'NEWUSER',
      discountValue: 5,
      type: 'percentage',
      validFrom: past(60),
      validTo: future(30),
    },
    {
      code: 'GIAM2TRIEU',
      discountValue: 2000000,
      type: 'fixed',
      validFrom: past(10),
      validTo: future(20),
    },
    {
      code: 'XEMAS2025',
      discountValue: 5000000,
      type: 'fixed',
      validFrom: past(120),
      validTo: past(5),
    },
  ]);
  console.log(`✅ Đã tạo ${promotions.length} khuyến mãi`);

  // ── 6. ORDERS + ORDER DETAILS ──────────────────────────────────────────────
  const [vehWave, vehVision, vehAirBlade, vehExciter, vehGrande, , , vehKlara, vehSH] = vehicles;

  const ordersData = [
    {
      customer: cust1._id,
      orderDate: past(20),
      totalAmount: vehVision.price,
      shippingAddress: '123 Lý Thường Kiệt, Q.10, TP.HCM',
      status: 'delivered',
      promotion: promotions[1]._id,
      items: [{ vehicle: vehVision._id, quantity: 1, unitPrice: vehVision.price }],
    },
    {
      customer: cust2._id,
      orderDate: past(15),
      totalAmount: vehExciter.price + vehGrande.price,
      shippingAddress: '456 Nguyễn Trãi, Q.5, TP.HCM',
      status: 'delivered',
      items: [
        { vehicle: vehExciter._id, quantity: 1, unitPrice: vehExciter.price },
        { vehicle: vehGrande._id,  quantity: 1, unitPrice: vehGrande.price  },
      ],
    },
    {
      customer: cust3._id,
      orderDate: past(7),
      totalAmount: vehSH.price,
      shippingAddress: '789 Trần Hưng Đạo, Q.1, TP.HCM',
      status: 'shipping',
      promotion: promotions[0]._id,
      items: [{ vehicle: vehSH._id, quantity: 1, unitPrice: vehSH.price }],
    },
    {
      customer: cust1._id,
      orderDate: past(3),
      totalAmount: vehKlara.price,
      shippingAddress: '321 Điện Biên Phủ, Bình Thạnh, TP.HCM',
      status: 'confirmed',
      promotion: promotions[2]._id,
      items: [{ vehicle: vehKlara._id, quantity: 1, unitPrice: vehKlara.price }],
    },
    {
      customer: cust4._id,
      orderDate: past(1),
      totalAmount: vehWave.price * 2,
      shippingAddress: '55 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
      status: 'pending',
      items: [{ vehicle: vehWave._id, quantity: 2, unitPrice: vehWave.price }],
    },
    {
      customer: cust2._id,
      orderDate: past(60),
      totalAmount: vehAirBlade.price,
      shippingAddress: '18 Cộng Hòa, Tân Bình, TP.HCM',
      status: 'cancelled',
      items: [{ vehicle: vehAirBlade._id, quantity: 1, unitPrice: vehAirBlade.price }],
    },
  ];

  const orderDetails = [];
  for (const od of ordersData) {
    const { items, ...orderFields } = od;
    const order = await Order.create(orderFields);
    for (const item of items) {
      orderDetails.push({ order: order._id, ...item });
    }
  }
  await OrderDetail.insertMany(orderDetails);
  console.log(`✅ Đã tạo ${ordersData.length} đơn hàng và ${orderDetails.length} chi tiết đơn hàng`);

  // ── 7. REVIEWS ─────────────────────────────────────────────────────────────
  await Review.insertMany([
    { customer: cust1._id, vehicle: vehVision._id,   rating: 5, comment: 'Xe đẹp, chạy êm, tiết kiệm xăng. Rất hài lòng với sản phẩm!',        postedDate: past(18) },
    { customer: cust2._id, vehicle: vehExciter._id,  rating: 5, comment: 'Exciter quá ngầu, vào cua ổn định, tăng tốc mạnh. Cực kỳ thích!',     postedDate: past(13) },
    { customer: cust2._id, vehicle: vehGrande._id,   rating: 4, comment: 'Xe nữ nhẹ, khởi động êm. Tuy nhiên giá hơi cao một chút.',             postedDate: past(12) },
    { customer: cust3._id, vehicle: vehSH._id,       rating: 5, comment: 'SH đẳng cấp thật sự, Smart Key rất tiện. Xứng đáng với giá tiền.',     postedDate: past(5)  },
    { customer: cust1._id, vehicle: vehKlara._id,    rating: 4, comment: 'Xe điện chạy êm, không tốn xăng. Pin cần sạc thường xuyên hơn dự kiến.', postedDate: past(2) },
    { customer: cust4._id, vehicle: vehWave._id,     rating: 4, comment: 'Xe số kinh điển, bền bỉ. Phù hợp đi chợ, đi làm hàng ngày.',           postedDate: past(1)  },
    { customer: cust3._id, vehicle: vehAirBlade._id, rating: 5, comment: 'Air Blade mạnh, khoá từ xa tiện. Thiết kế thể thao, ai cũng khen.',     postedDate: past(55) },
  ]);
  console.log(`✅ Đã tạo 7 đánh giá`);

  // ── 8. TEST DRIVE APPOINTMENTS ─────────────────────────────────────────────
  await TestDriveAppointment.insertMany([
    {
      customer: cust1._id,
      guestName: 'Nguyễn Văn An',
      guestPhone: '0912345678',
      vehicle: vehSH._id,
      appointmentDate: future(2),
      timeSlot: '09:00 - 10:00',
      status: 'pending',
      note: 'Muốn lái thử màu trắng ngọc trai',
    },
    {
      customer: cust2._id,
      guestName: 'Trần Thị Bình',
      guestPhone: '0987654321',
      vehicle: vehExciter._id,
      appointmentDate: future(3),
      timeSlot: '14:00 - 15:00',
      status: 'confirmed',
      note: 'Nhờ shop chuẩn bị xe màu đỏ',
    },
    {
      guestName: 'Lê Văn Cường',
      guestPhone: '0934567890',
      vehicle: vehVision._id,
      appointmentDate: past(1),
      timeSlot: '10:00 - 11:00',
      status: 'completed',
      note: 'Đã lái thử, quyết định mua luôn',
    },
    {
      customer: cust4._id,
      guestName: 'Phạm Thị Dung',
      guestPhone: '0967890123',
      vehicle: vehGrande._id,
      appointmentDate: future(5),
      timeSlot: '15:00 - 16:00',
      status: 'pending',
      note: '',
    },
    {
      guestName: 'Hoàng Minh Tuấn',
      guestPhone: '0905551234',
      vehicle: vehKlara._id,
      appointmentDate: past(3),
      timeSlot: '08:00 - 09:00',
      status: 'cancelled',
      note: 'Bận đột xuất không đến được',
    },
  ]);
  console.log(`✅ Đã tạo 5 lịch hẹn lái thử`);

  // ── 9. CHAT ROOMS + MESSAGES ───────────────────────────────────────────────
  const room1 = await ChatRoom.create({
    customer: cust1._id,
    owner: owner._id,
    createdDate: past(5),
  });
  const room2 = await ChatRoom.create({
    customer: cust2._id,
    owner: owner._id,
    createdDate: past(3),
  });
  const room3 = await ChatRoom.create({
    customer: cust3._id,
    owner: owner._id,
    createdDate: past(1),
  });

  await Message.insertMany([
    // Room 1
    { chatRoom: room1._id, senderId: cust1._id,  content: 'Chào shop, cho mình hỏi xe Honda SH 160i còn hàng không ạ?',               sendTime: past(5) },
    { chatRoom: room1._id, senderId: owner._id,  content: 'Chào bạn! Xe SH 160i hiện vẫn còn 4 chiếc ạ. Bạn muốn xem màu nào?',       sendTime: past(5) },
    { chatRoom: room1._id, senderId: cust1._id,  content: 'Mình muốn xem màu trắng ngọc trai, có không shop?',                          sendTime: past(4) },
    { chatRoom: room1._id, senderId: owner._id,  content: 'Có ạ! Bạn có muốn đặt lịch lái thử không? Shop hỗ trợ lái thử miễn phí.', sendTime: past(4) },
    { chatRoom: room1._id, senderId: cust1._id,  content: 'Vậy mình đặt lịch cho thứ Bảy tuần này được không ạ?',                      sendTime: past(3) },
    { chatRoom: room1._id, senderId: owner._id,  content: 'Được ạ! Shop đã ghi nhận lịch hẹn cho bạn vào sáng thứ Bảy 09:00 nhé.',    sendTime: past(3) },
    // Room 2
    { chatRoom: room2._id, senderId: cust2._id,  content: 'Shop ơi, Exciter 155 có màu đen nhám không?',                                sendTime: past(3) },
    { chatRoom: room2._id, senderId: owner._id,  content: 'Chào bạn! Exciter 155 có đầy đủ màu: đen nhám, đỏ bóng, trắng bạc ạ.',     sendTime: past(3) },
    { chatRoom: room2._id, senderId: cust2._id,  content: 'Giá xe Exciter bây giờ là bao nhiêu vậy shop?',                              sendTime: past(2) },
    { chatRoom: room2._id, senderId: owner._id,  content: 'Exciter 155 VVA giá 52.900.000 VNĐ. Đang có khuyến mãi giảm 2 triệu nếu thanh toán trước ạ.', sendTime: past(2) },
    // Room 3
    { chatRoom: room3._id, senderId: cust3._id,  content: 'Mình muốn hỏi về chính sách bảo hành xe SH ạ.',                             sendTime: past(1) },
    { chatRoom: room3._id, senderId: owner._id,  content: 'Xe SH 160i được bảo hành 3 năm hoặc 30.000 km, bảo dưỡng miễn phí lần đầu ạ.', sendTime: past(1) },
    { chatRoom: room3._id, senderId: cust3._id,  content: 'Shop có hỗ trợ trả góp không?',                                               sendTime: past(1) },
    { chatRoom: room3._id, senderId: owner._id,  content: 'Có ạ! Shop hỗ trợ trả góp 0% lãi suất qua FE Credit và HD Saison. Bạn cần tư vấn thêm không?', sendTime: past(1) },
  ]);
  console.log(`✅ Đã tạo 3 phòng chat và 14 tin nhắn`);

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n🎉 ======= SEED HOÀN THÀNH =======');
  console.log(`   Database  : ${process.env.MONGO_URI}`);
  console.log(`   Brands    : ${brands.length}`);
  console.log(`   Models    : ${vehicleModels.length}`);
  console.log(`   Users     : ${users.length}  (owner: 1, customers: 4)`);
  console.log(`   Vehicles  : ${vehicles.length}`);
  console.log(`   Promotions: ${promotions.length}`);
  console.log(`   Orders    : ${ordersData.length}`);
  console.log(`   Reviews   : 7`);
  console.log(`   Appointments: 5`);
  console.log(`   Chatrooms : 3  | Messages: 14`);
  console.log('=================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
