import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  getEmailBrandName,
  sendEmail,
} from "@/lib/email/email.service";

function getEmailEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    EMAIL_SUPPORT: process.env.EMAIL_SUPPORT,
    EMAIL_BRAND_NAME: process.env.EMAIL_BRAND_NAME,
    APP_BASE_URL: process.env.APP_BASE_URL,
    WEB_URL: process.env.WEB_URL,
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    organization({
      teams: { enabled: true },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const env = getEmailEnv();
        const brand = getEmailBrandName(env);
        const label =
          type === "sign-in"
            ? "sign-in verification"
            : type === "email-verification"
              ? "email verification"
              : "password reset";

        sendEmail(env, {
          to: email,
          template: {
            subject: `${label === "password reset" ? "Password Reset" : "Verification"} Code`,
            previewText: `Your ${label} code is ${otp}`,
            text: `Your ${brand} ${label} code is ${otp}. It expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
            html: `<p>Your ${brand} ${label} code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>This code expires in 5 minutes.</p><p>If you didn't request this, please ignore this email.</p>`,
          },
        });
      },
    }),
    nextCookies(),
  ],
});

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
