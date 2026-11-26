declare module "pino-roll" {
  interface PinoRollOptions {
    file: string;
    frequency?: "daily" | "hourly" | "custom";
    limit?: { count?: number; interval?: string };
  }

  function transport(options: PinoRollOptions): NodeJS.WritableStream;
  export default transport;
}
