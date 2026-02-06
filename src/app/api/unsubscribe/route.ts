import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { connection } from "next/server";

/**
 * Unsubscribe from weekly insights emails
 * Updates the user's stopEmail field to true
 */
export async function GET(request: NextRequest) {
  await connection(); // Mark route as dynamic

  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    // Update the user's stopEmail preference
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { stopEmail: true },
      select: { id: true, email: true, stopEmail: true },
    });

    console.log(
      `[UNSUBSCRIBE] User ${updatedUser.email} unsubscribed from weekly emails`,
    );

    // Return a success page
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - CalmHive</title>
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            max-width: 500px;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success-icon {
            font-size: 48px;
            color: #19c496;
            margin-bottom: 20px;
          }
          h1 {
            color: #333;
            margin-bottom: 16px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background: #19c496;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Unsubscribed Successfully</h1>
          <p>You have been unsubscribed from weekly insights emails from CalmHive. You won't receive these notifications anymore.</p>
          <p>If you change your mind, you can update your email preferences in your account settings.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="button">Return to CalmHive</a>
        </div>
      </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("[UNSUBSCRIBE] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
