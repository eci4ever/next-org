import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";

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
    nextCookies(),
  ],
});

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
