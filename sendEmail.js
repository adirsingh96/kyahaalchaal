
const nodemailer = require("nodemailer");
require('dotenv').config();




const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP,
  port:  465,
  secure: true,
  auth: {
    user:  process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



async function sendEmail(to, subject, text, html) {
    console.log("Configuring email");
  
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
      });
  
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }



//sendEmail("adirsingh96@gmail.com", "Hello ✔", "function check?", "<b>function check?</b>").catch(console.error);

module.exports = { sendEmail };
 