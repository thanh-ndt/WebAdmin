const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER) {
        console.log("-----------------------------------------------------");
        console.log("Mock Email Sending:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content:\n${html}`);
        console.log("-----------------------------------------------------");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'UTE_Shop'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
