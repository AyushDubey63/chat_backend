import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
console.log(process.env.EMAIL, process.env.PASSWORD, 13);

// IIFE for checking the connection
(async () => {
  try {
    // Test the connection
    await transporter.verify();
    console.log("Connection to the email server is successful.");
  } catch (error) {
    console.error("Failed to connect to the email server:", error);
  }
})();
async function sendMail({ to, subject, text, html, cc }) {
  console.log(to, subject, text, html, cc, 13);

  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      cc,
      subject,
      text,
      html,
    };
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("email sent", emailResponse, 24);
    return emailResponse;
  } catch (error) {
    console.log(error);
    throw new Error("Error sending email");
  }
}
export default sendMail;
