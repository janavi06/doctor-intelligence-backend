
// import "dotenv/config";
// import { z } from "zod";

// const envSchema = z.object({
//   PORT: z.coerce.number().default(5000),
//   GOOGLE_SHEET_ID: z.string().optional(),
//   GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
//   GOOGLE_PRIVATE_KEY: z.string().optional(),
// });

// const result = envSchema.safeParse(process.env);

// if (!result.success) {
//   console.error("Invalid environment configuration:");
//   console.error(result.error.flatten().fieldErrors);
//   process.exit(1);
// }

// export const env = result.data;


import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(5000),
  GOOGLE_SHEET_ID: z.string().min(1),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
  CACHE_TTL_MS: z.coerce.number().default(60000),
  FRONTEND_URL: z.string().optional().default(""),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
