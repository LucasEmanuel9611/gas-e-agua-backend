import { UpdateOverdueOrdersJob } from "@modules/orders/jobs/UpdateOverdueOrdersJob";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { container } from "tsyringe";

@Injectable()
export class UpdateOverdueOrdersTask {
  @Cron("0 0 * * *")
  async handle() {
    const updateOverdueOrdersJob = container.resolve(UpdateOverdueOrdersJob);

    const updatedCount = await updateOverdueOrdersJob.execute();

    console.log(
      `[CRON - Atualizacao de status para produtos vencidos (mais de 30 dias)] - ${updatedCount} pedidos vencidos atualizados.`
    );
  }
}
