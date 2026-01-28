/**
 * Contact Email Template
 * Professional template for contact form submissions
 * Matches CalmHive theme and brand identity
 */

export function generateContactEmailHTML(
  name: string,
  email: string,
  message: string,
): string {
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
          background: linear-gradient(135deg, #19c496 0%, #24c096c5 100%);
          padding: 40px 24px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 32px 24px;
        }
        .field {
          margin-bottom: 24px;
        }
        .field:last-child {
          margin-bottom: 0;
        }
        .label {
          font-weight: 600;
          color: #19c496;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .value {
          background-color: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #19c496;
          color: #2d3748;
          line-height: 1.6;
          word-wrap: break-word;
        }
        .message-value {
          white-space: pre-wrap;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p>CalmHive Contact Form</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value message-value">${message}</div>
          </div>
        </div>
        <div class="footer">
          <p>This message was sent from the CalmHive contact form</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
