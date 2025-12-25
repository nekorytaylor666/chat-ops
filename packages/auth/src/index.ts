import { expo } from "@better-auth/expo";
import { db } from "@chat-ops/db";
import * as schema from "@chat-ops/db/schema/auth";
import * as organizationSchema from "@chat-ops/db/schema/organization";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      ...organizationSchema,
    },
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || "", "mybettertapp://", "exp://"],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    expo(),
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});
