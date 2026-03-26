const nodemailer = require('nodemailer');

// Cấu hình kết nối với email server
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true cho port 465, false cho port 587
  auth: {
    user: process.env.EMAIL_USER, // Địa chỉ email gửi
    pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng (App Password)
  },
});

// Hàm gửi email
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'UTE_Shop'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email đã gửi thành công: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Lỗi gửi email: ${error.message}`);
    throw error;
  }
};

// Xác minh kết nối email server
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Kết nối email server thành công');
  } catch (error) {
    console.error(`Lỗi kết nối email server: ${error.message}`);
  }
};

module.exports = { transporter, sendEmail, verifyEmailConnection };
