// utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    service: process.env.SMPT_SERVICE,
    port: Number(process.env.SMPT_PORT),
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};
