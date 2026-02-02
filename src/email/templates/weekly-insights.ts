/**
 * Weekly Insights Email Template
 * Notification for weekly performance and new plan updates
 * Matches CalmHive theme and brand identity
 */

export function generateWeeklyInsightsEmailHTML(
  userName: string,
  userId: string,
): string {
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
          background: linear-gradient(135deg, #f0fdf9 0%, #e0f7f4 100%);
          padding: 30px 24px;
          text-align: center;
          border-bottom: 3px solid #19c496;
        }
        .header h1 {
          color: #19c496;
          font-size: 28px;
          margin: 0 0 8px 0;
          font-weight: 700;
        }
        .header p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
        .content {
          padding: 32px 24px;
        }
        .greeting {
          color: #333;
          font-size: 16px;
          margin: 0 0 20px 0;
          line-height: 1.6;
        }
        .section {
          margin-bottom: 24px;
        }
        .section h2 {
          color: #19c496;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-icon {
          font-size: 20px;
        }
        .section p {
          color: #555;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }
        .highlight {
          background-color: #f0fdf9;
          border-left: 4px solid #19c496;
          padding: 12px 16px;
          border-radius: 4px;
          margin: 12px 0;
        }
        .highlight-text {
          color: #19c496;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #19c496 0%, #15a876 100%);
          color: #ffffff !important;
          padding: 12px 28px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin-top: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 196, 150, 0.3);
        }
        .footer {
          background-color: #fafafa;
          border-top: 1px solid #eee;
          padding: 20px 24px;
          text-align: center;
        }
        .footer p {
          color: #888;
          font-size: 13px;
          margin: 8px 0;
          line-height: 1.5;
        }
        .footer-brand {
          color: #19c496;
          font-weight: 600;
        }
        .divider {
          height: 1px;
          background-color: #eee;
          margin: 16px 0;
        }
        .emoji {
          font-size: 24px;
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="${appUrl}/calmhive.png" alt="CalmHive Logo" style="height: 48px; width: auto; margin-bottom: 12px;">
          <h1>Your Weekly Updates Are Ready!</h1>
          <p>See your progress and new plan updates</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Greeting -->
          <p class="greeting">
            Hi <span style="color: #19c496; font-weight: 600;">${userName}</span>,
          </p>

          <!-- Weekly Insights Section -->
          <div class="section">
            <h2>
              Your Weekly Performance
            </h2>
            <p>
              Your weekly insights are now available! Check out how you performed in your previous week and see how much you've improved yourself. Every step counts, and we're celebrating your progress! 🎉
            </p>
            <div class="highlight">
              <p>
                <span class="highlight-text">✨ Track your achievements:</span> Task completion rates, consistency scores, and performance trends are all waiting for you on your dashboard.
              </p>
            </div>
          </div>

          <!-- New Plan Section -->
          <div class="section">
            <p>
              Based on your performance and feedback, your new plan updates are ready on the app. You have the choice to:
            </p>
            <div class="highlight">
              <p style="margin: 0;">
                ✓ <span class="highlight-text">Proceed with the new plan</span> tailored to your growth<br>
                ✓ <span class="highlight-text">Enhance your previous plan</span> with improvements<br>
                ✓ <span class="highlight-text">Mix and match</span> what works best for you
              </p>
            </div>
            <p style="margin-top: 12px;">
              It's completely your choice, and we're here with you in all your decisions! 
            </p>
          </div>

          <!-- Closing Section -->
          <div class="section">
            <h2>
              <span class="section-icon">🚀</span>
              Ready to Get Started?
            </h2>
            <p>
              Log in to your CalmHive account to view your detailed insights and plan updates.
            </p>
            <center>
              <a href="${appUrl}/user/insights" class="cta-button">
                View My Insights →
              </a>
            </center>
          </div>

          <!-- Motivational Closing -->
          <div class="divider"></div>
          <p style="color: #555; font-size: 15px; line-height: 1.8; text-align: center; margin-top: 24px;">
            <strong>Have a happy and growth-filled week ahead! 🌟</strong><br>
            <span style="color: #19c496; font-weight: 600;">Cheers!</span><br>
            <span style="color: #888; font-size: 14px;">— The CalmHive Team</span>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>
            You're receiving this email because you have a CalmHive account.
          </p>
          <p>
            <span class="footer-brand">CalmHive</span> · Your Weekly Wellness Companion
          </p>
          <p style="font-size: 12px; color: #aaa;">
            © 2026 CalmHive. All rights reserved.
          </p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px 0;">
              Don't want to receive these weekly updates?
            </p>
            <a href="${appUrl}/api/unsubscribe?userId=${userId}" style="color: #666; text-decoration: underline; font-size: 12px;">
              Unsubscribe from weekly emails
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
