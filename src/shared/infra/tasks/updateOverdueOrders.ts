import { UpdateOverdueOrdersUseCase } from "@modules/orders/useCases/updateOverdueOrders/updateOverdueOrdersUseCase";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleUpdateOverdueOrders() {
  cron.schedule("0 0 * * *", async () => {
    const listOrdersByDayUseCase = container.resolve(
      UpdateOverdueOrdersUseCase
    );

    const updatedCount = await listOrdersByDayUseCase.execute();

    console.log(
      `[CRON - Atualizacao de status para produtos vencidos (mais de 30 dias)] - ${updatedCount} pedidos vencidos atualizados.`
    );
  });
}
