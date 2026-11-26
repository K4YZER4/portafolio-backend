import pino, { type StreamEntry } from "pino";
import fs from "fs";
import path from "path";
import { config } from "../config";
import { Request, Response, NextFunction } from "express";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(
  path.join(logsDir, `error-${new Date().toISOString().split("T")[0]}.log`),
  { flags: "a" }
);

const streams: StreamEntry[] = [];

if (config.NODE_ENV === "production") {
  streams.push({ level: "error", stream: logStream });
} else if (config.NODE_ENV === "development") {
  const prettyStream = pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  });
  streams.push({ level: "info", stream: prettyStream });
  streams.push({ level: "error", stream: logStream });
}

const logLevel = process.env.LOG_LEVEL || "info";
export const logger = pino({ level: logLevel }, pino.multistream(streams));

export const loggerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.logger = logger;
  next();
};
