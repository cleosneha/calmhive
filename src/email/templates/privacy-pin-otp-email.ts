/**
 * Privacy PIN OTP Email Template
 * Professional and modern design for privacy PIN change verification
 * Matches CalmHive theme and brand identity
 */

export function generatePrivacyPinOTPEmailHTML(otp: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          box-sizing: border-box;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        body {
          margin: 0;
          padding: 40px 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header {
          background: #f0fdf9;
          padding: 20px 24px;
          text-align: center;
        }
        .header img {
          height: 48px;
          width: auto;
          margin-bottom: 12px;
        }
        .header h1 {
          color: #19c496;
          font-weight: 600;
          margin: 0;
          font-size: 32px;
        }
        .header p {
          color: #666666;
          font-size: 14px;
          margin: 8px 0 0 0;
        }
        .content {
          padding: 32px 24px;
          text-align: center;
        }
        .otp-code {
          background: #f8fafc;
          border: 2px dashed #19c496;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          display: inline-block;
        }
        .otp-code .code {
          font-size: 36px;
          font-weight: 700;
          color: #19c496;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 16px;
          margin: 20px 0;
          text-align: left;
        }
        .warning h3 {
          color: #92400e;
          font-size: 16px;
          margin: 0 0 8px 0;
        }
        .warning p {
          color: #78350f;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background: #f8fafc;
          padding: 20px 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          color: #64748b;
          font-size: 12px;
          margin: 0;
        }
        .footer a {
          color: #19c496;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${appUrl}/calmhive.png" alt="CalmHive Logo" style="height: 48px; width: auto; margin-bottom: 12px;">
          <h1>🔐 CalmHive</h1>
          <p>Privacy PIN Change Verification</p>
        </div>

        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Verify Your Identity</h2>
          <p style="color: #64748b; margin-bottom: 24px; line-height: 1.6;">
            We received a request to change your privacy PIN. To proceed, please use the verification code below:
          </p>

          <div class="otp-code">
            <div class="code">${otp}</div>
          </div>

          <div class="warning">
            <h3>⚠️ Security Notice</h3>
            <p>
              This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
              If you didn't request this change, please ignore this email and contact our support team.
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>

        <div class="footer">
          <p>
            Need help? Contact us at <a href="mailto:support@calmhive.com">support@calmhive.com</a>
          </p>
          <p style="margin-top: 8px;">
            © 2025 CalmHive. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePrivacyPinOTPEmailText(otp: string): string {
  return `
CalmHive - Privacy PIN Change Verification

Verify Your Identity

We received a request to change your privacy PIN. To proceed, please use the verification code below:

Your verification code: ${otp}

⚠️ Security Notice
This code will expire in 10 minutes. Do not share this code with anyone.
If you didn't request this change, please ignore this email and contact our support team.

If you have any questions, feel free to reach out to our support team.

Need help? Contact us at support@calmhive.com

© 2025 CalmHive. All rights reserved.
  `.trim();
}
