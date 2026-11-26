import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FolioService {
  constructor(private readonly prisma: PrismaService) {}

  async siguiente(): Promise<string> {
    const result = await this.prisma.$queryRaw<Array<{ numero: bigint }>>`
      SELECT nextval('credito.contrato_folio_seq') AS numero
    `;
    const numero = result[0]?.numero;
    if (numero === undefined) {
      throw new Error("No se pudo generar el folio del contrato");
    }
    return `C-${numero.toString().padStart(6, "0")}`;
  }
}
