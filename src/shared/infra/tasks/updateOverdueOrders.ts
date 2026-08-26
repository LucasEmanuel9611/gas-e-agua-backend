import { UpdateOverdueOrdersJob } from "@modules/orders/jobs/UpdateOverdueOrdersJob";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class UpdateOverdueOrdersTask {
  constructor(
    private readonly updateOverdueOrdersJob: UpdateOverdueOrdersJob
  ) {}

  @Cron("0 0 * * *")
  async handle() {
    const updatedCount = await this.updateOverdueOrdersJob.execute();

    console.log(
      `[CRON - Atualizacao de status para produtos vencidos (mais de 30 dias)] - ${updatedCount} pedidos vencidos atualizados.`
    );
  }
}
