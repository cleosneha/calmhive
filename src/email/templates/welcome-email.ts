/**
 * Welcome Email Template
 * Professional and modern design for new user welcome
 * Matches CalmHive theme and brand identity
 */

export function generateWelcomeEmailHTML(userName: string): string {
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
          background: linear-gradient(135deg, #19c496 0%, #24c096c5 100%);
          padding: 40px 24px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 24px;
          color: #2f2f2f;
          line-height: 1.6;
        }
        .content h2 {
          color: #19c496;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .content p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .features {
          background-color: #f8fdf9;
          border-left: 4px solid #19c496;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .features h3 {
          margin-top: 0;
          color: #19c496;
          font-size: 18px;
        }
        .features ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }
        .progress-section {
          background-color: #f1f5f9;
          border: 1px solid #e6e1da;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .progress-section h3 {
          color: #19c496;
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .step {
          margin-bottom: 10px;
          font-size: 16px;
        }
        .done {
          color: #6b6b6b;
          text-decoration: line-through;
        }
        .next {
          color: #19c496;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #19c496 0%, #24c096c5 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px 24px;
          text-align: center;
          color: #6b6b6b;
          font-size: 14px;
        }
        .footer a {
          color: #19c496;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .header {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
          }
          .cta-button {
            display: block;
            width: 100%;
            box-sizing: border-box;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${appUrl}/calmhive.png" alt="CalmHive Logo" style="height: 48px; width: auto; margin-bottom: 12px;">
          <h1>Welcome to CalmHive!</h1>
          <p>Your journey to better productivity starts here</p>
        </div>

        <div class="content">
          <h2>Hello ${userName}!</h2>

          <p>Thank you for joining CalmHive! We're excited to help you build better habits, manage your time effectively, and achieve your goals with our AI-powered productivity platform.</p>

          <div class="features">
            <h3>Here's what you can do:</h3>
            <ul>
              <li><strong>Smart Planning:</strong> Get personalized daily plans based on your goals and availability</li>
              <li><strong>AI Chatbot:</strong> Chat with our AI assistant to refine your plans and get insights</li>
              <li><strong>Progress Tracking:</strong> Monitor your productivity with detailed analytics and insights</li>
              <li><strong>Journaling:</strong> Reflect on your day and track your mood</li>
              <li><strong>Weekly Reports:</strong> Receive automated insights about your progress</li>
            </ul>
          </div>

          <p>To get started, complete your onboarding process to help us create the perfect plan for you.</p>

          <a href="${appUrl}/onboarding" class="cta-button">Start Your Journey →</a>

          <p>If you have any questions, feel free to reply to this email or visit our <a href="${appUrl}/help" style="color: #19c496;">help center</a>.</p>

          <p>Happy planning!<br>The CalmHive Team</p>
        </div>

        <div class="footer">
          <p>
            You're receiving this email because you registered for CalmHive.<br>
            <a href="${appUrl}/settings">Unsubscribe</a> | <a href="${appUrl}/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
