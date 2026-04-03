import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email, res) {
  try {
    const message = generateVerificationOtpEmailTemplate(verificationCode);

    // ✅ Await the async sendEmail function
    await sendEmail({
      email,
      subject: "Verification Code (Hamro Event - Local Event  Connector)",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Verification Code Sent Successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error); // ✅ helpful for debugging
    res.status(500).json({
      success: false,
      message: "Failed to send Verification Code",
    });
  }
}
