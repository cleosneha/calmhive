/**
 * OTP Email Template
 * Professional and modern design for email verification
 * Matches CalmHive theme and brand identity
 */

export function generateOTPEmailHTML(otp: string): string {
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
          padding: 32px 32px;
        }
        .greeting {
          font-size: 16px;
          color: #2f2f2f;
          line-height: 1.6;
          text-align: center;
          margin: 0 0 32px 0;
        }
        .greeting strong {
          color: #19c496;
          font-weight: 600;
        }
        .otp-section {
          text-align: center;
          margin: 40px 0;
        }
        .otp-label {
          font-size: 13px;
          color: #666666;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .otp-code {
          font-size: 40px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #19c496;
          border: 2px solid #19c496;
          border-radius: 10px;
          padding: 20px;
          font-family: 'Courier New', monospace;
          background: #f0fdf9;
          margin: 0;
        }
        .expiry {
          background: #f0fdf9;
          border-left: 4px solid #19c496;
          padding: 14px;
          margin: 24px 0;
          border-radius: 6px;
          text-align: center;
          color: #19c496;
          font-size: 14px;
        }
        .security {
          background: #fff8f8;
          border-left: 4px solid #ff6b6b;
          padding: 14px;
          border-radius: 6px;
          font-size: 13px;
          color: #666666;
          margin: 24px 0;
        }
        .support-text {
          font-size: 14px;
          margin-top: 24px;
          margin-bottom: 0;
          color: #666666;
          text-align: center;
        }
        .link {
          color: #19c496;
          text-decoration: none;
          font-weight: 600;
        }
        .link:hover {
          text-decoration: underline;
        }
        .footer {
          background: #fafafa;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #666666;
          border-top: 1px solid #e6e1da;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="${appUrl}/calmhive.png" alt="CalmHive Logo" style="height: 48px; width: auto; margin-bottom: 12px;">
          <h1>CalmHive</h1>
          <p>Verify Your Email Address</p>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">
            Welcome to <strong>CalmHive</strong>! Please verify your email using the OTP below.
          </p>

          <div class="otp-section">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
          </div>

          <div class="expiry">
            This OTP will expire in <strong>60 seconds</strong>
          </div>

          <div class="security">
            <strong> Security Notice:</strong> Never share this OTP with anyone. CalmHive will never ask for it.
          </div>

          <p class="support-text">
            Didn't request this? <a href="${appUrl}" class="link">Contact support</a>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          © 2025 CalmHive · <a href="${appUrl}" class="link">Visit CalmHive</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOTPEmailText(otp: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `CALMHIVE - EMAIL VERIFICATION

Welcome to CalmHive!

To complete your registration, please use this One-Time Password (OTP):

${otp}

This OTP will expire in 10 minutes.

SECURITY NOTICE:
- Never share this code with anyone
- CalmHive team will never ask for your OTP
- If you didn't request this, contact support immediately

If you didn't create this account, please ignore this email.

---
© 2025 CalmHive. All rights reserved.
Visit us: ${appUrl}
Support: ${appUrl}/support`;
}
