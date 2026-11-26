import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().default("http://localhost:3000").transform((v) => (v.startsWith("http") ? v : `http://${v}`)).pipe(z.string().url()),
  DEMO_MODE: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  GEMINI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@127.0.0.1:5432/rellenador?schema=organizacion"),
  CLOUDINARY_CLOUD_NAME: z.string().default("demo"),
  CLOUDINARY_API_KEY: z.string().default("demo"),
  CLOUDINARY_API_SECRET: z.string().default("demo"),
  EMAIL_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email("FROM_EMAIL must be a valid email").optional(),
  JWT_SECRET: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().min(32).default("development-only-secret-change-me-123456"),
  ),
  JWT_EXPIRES_IN: z.string().default("8h"),
}).superRefine((env, context) => {
  if (!env.DEMO_MODE && !env.GEMINI_API_KEY?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GEMINI_API_KEY"],
      message: "GEMINI_API_KEY is required when DEMO_MODE=false",
    });
  }
});

export const config = envSchema.parse(process.env);
