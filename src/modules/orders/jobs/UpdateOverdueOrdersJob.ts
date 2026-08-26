import { UpdateOverdueOrdersUseCase } from "@modules/orders/useCases/updateOverdueOrders/updateOverdueOrdersUseCase";
import { Inject, Injectable } from "@nestjs/common";

import { JobService } from "@shared/services/JobService";

@Injectable()
export class UpdateOverdueOrdersJob {
  constructor(
    @Inject("UpdateOverdueOrdersUseCase")
    private updateOverdueOrdersUseCase: UpdateOverdueOrdersUseCase
  ) {}

  async execute(): Promise<number> {
    const result = await JobService.runJob(
      "UpdateOverdueOrders",
      () => this.updateOverdueOrdersUseCase.execute(),
      {
        maxRetries: 3,
        retryDelay: 5000,
        notifyOnError: true,
      }
    );

    if (!result.success) {
      console.error("Falha ao atualizar pedidos vencidos:", result.error);
      return 0;
    }
    console.log(`Pedidos vencidos atualizados: ${result.data}`);
    return result.data || 0;
  }
}
