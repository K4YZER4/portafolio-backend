import "dotenv/config";
import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { AppExceptionFilter } from "./common/http/app-exception.filter";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const port = Number(process.env.PORT ?? process.env.NEST_PORT ?? 3000);
  const isDemo = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      xFrameOptions: false,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  app.enableCors({
    origin: isDemo
      ? true
      : [
          process.env.FRONTEND_URL ?? "http://localhost:5173",
          "http://localhost:5173",
          "http://localhost:4173",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:4173",
          "http://localhost:5180",
          "http://127.0.0.1:5180",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Gemini-Api-Key", "X-Request-Id"],
    exposedHeaders: [
      "Content-Disposition",
      "X-Contract-Folio",
      "X-Contract-Token",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-Request-Id",
    ],
  });

  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance();
  expressInstance.get("/", (_req: express.Request, res: express.Response) => {
    res.json({ status: "ok", service: "PDF Filler API", health: "/health" });
  });

  app.setGlobalPrefix("api", { exclude: ["health"] });
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(port, "0.0.0.0");
  process.stdout.write(`Servidor escuchando en http://0.0.0.0:${port}\n`);
}

void bootstrap();
