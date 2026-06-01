const nodemailer = require('nodemailer');

async function sendCertificateEmail({ studentEmail, name, rollNumber, degree, branch, graduationYear, certId }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email sent to", studentEmail);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify/${encodeURIComponent(certId)}`;

  const mailOptions = {
    from: `"Alumni Verification Portal" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: `Your Blockchain Certificate is Ready - ${certId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">Certificate Generated Successfully</h2>
        </div>
        <div style="padding: 30px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Congratulations! Your academic certificate has been successfully issued and recorded on the blockchain. This ensures that your credential is secure, immutable, and verifiable by anyone.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Certificate Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Certificate ID</strong></td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 16px;"><strong>${certId}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Roll Number</strong></td>
                <td style="padding: 8px 0;">${rollNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Degree</strong></td>
                <td style="padding: 8px 0;">${degree}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Branch</strong></td>
                <td style="padding: 8px 0;">${branch}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Graduation Year</strong></td>
                <td style="padding: 8px 0;">${graduationYear}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${verificationLink}" style="background-color: #3b82f6; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Certificate on Blockchain</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            You can share your Certificate ID (<strong>${certId}</strong>) or the verification link with employers or other organizations for certification purposes.
          </p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Alumni Verification Portal. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Certificate email sent to %s (Message ID: %s)", studentEmail, info.messageId);
  } catch (error) {
    console.error("Error sending certificate email:", error);
  }
}

module.exports = {
  sendCertificateEmail,
};
