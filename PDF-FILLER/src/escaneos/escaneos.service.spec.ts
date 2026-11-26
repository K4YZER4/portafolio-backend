import { Test } from "@nestjs/testing";
import { GeminiService } from "../gemini/gemini.service";
import { EscaneosService } from "./escaneos.service";

describe("EscaneosService", () => {
  it("normaliza los datos incompletos de nómina", async () => {
    const gemini = {
      extraerDatosNomina: jest.fn().mockResolvedValue({
        noEmpleado: "123",
        ingresoMensual: 15000,
      }),
    };
    const module = await Test.createTestingModule({
      providers: [
        EscaneosService,
        { provide: GeminiService, useValue: gemini },
      ],
    }).compile();
    const service = module.get(EscaneosService);

    await expect(service.escanearNomina(Buffer.from("1"), Buffer.from("2"))).resolves.toEqual({
      datos: {
        noEmpleado: "123",
        rfc: "",
        puesto: "",
        departamento: "",
        dependencia: "",
        percepcionNomina1: 0,
        percepcionNomina2: 0,
        ingresoMensual: 15000,
        telefonoEmpresarial: "",
        emailLaboral: "",
      },
    });
  });
});
