import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import db from "./db";

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
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [nextCookies()], // Add nextCookies plugin for server actions cookie handling
  callbacks: {
    /**
     * Inject custom user fields into session
     * This allows direct access to onboarded status without DB queries
     */
    session: async ({
      session,
      user,
    }: {
      session: typeof auth.$Infer.Session;
      user: typeof auth.$Infer.Session["user"];
    }) => {
      // Fetch user with onboarded field from DB
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { onboarded: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          onboarded: dbUser?.onboarded ?? false,
        },
      };
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
