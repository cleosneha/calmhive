import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import db from "./db";
import { sendWelcomeEmail } from "@/email/service";
import { SessionCallbackParams } from "@/types";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret:
    process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // We handle email verification manually with OTP
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: false, // Disable cache to always fetch fresh session
    },
  },
  plugins: [nextCookies()], // Add nextCookies plugin for server actions cookie handling
  hooks: {
    session: {
      created: async ({ session, user }: SessionCallbackParams) => {
        // Fetch user with onboarded field from DB
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { onboarded: true },
        });

        return {
          session,
          user: {
            ...user,
            onboarded: dbUser?.onboarded ?? false,
          },
        };
      },
    },
  },
  databaseHooks: {}, // Removed welcome email hook - moved to OTP verification
  user: {
    additionalFields: {
      onboarded: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      welcomeEmailSent: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
