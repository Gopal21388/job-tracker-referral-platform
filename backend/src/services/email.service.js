import nodemailer from "nodemailer"

const sendEmail=async({to, subject, html})=>{
    const transporter=nodemailer.createTransport({
        host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
          

    }})
    const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;

