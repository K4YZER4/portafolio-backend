import { Test } from "@nestjs/testing";
import request from "supertest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("responde que el servicio está disponible", async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const app = module.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect({ status: "ok", service: "pdf-filler-nest" });

    await app.close();
  });
});
