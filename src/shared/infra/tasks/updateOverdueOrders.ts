import { UpdateOverdueOrdersJob } from "@modules/orders/jobs/UpdateOverdueOrdersJob";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleUpdateOverdueOrders() {
  cron.schedule("0 0 * * *", async () => {
    const updateOverdueOrdersJob = container.resolve(UpdateOverdueOrdersJob);

    const updatedCount = await updateOverdueOrdersJob.execute();

    console.log(
      `[CRON - Atualizacao de status para produtos vencidos (mais de 30 dias)] - ${updatedCount} pedidos vencidos atualizados.`
    );
  });
}
