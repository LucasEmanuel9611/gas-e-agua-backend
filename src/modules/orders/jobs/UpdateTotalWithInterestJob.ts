import { UpdateTotalWithInterestUseCase } from "@modules/orders/useCases/updateTotalWithInterest/UpdateTotalWithInterestUseCase";
import { Inject, Injectable } from "@nestjs/common";

import { JobService } from "@shared/services/JobService";

@Injectable()
export class UpdateTotalWithInterestJob {
  constructor(
    @Inject("UpdateTotalWithInterestUseCase")
    private updateTotalWithInterestUseCase: UpdateTotalWithInterestUseCase
  ) {}

  async execute(): Promise<void> {
    const result = await JobService.runJob(
      "UpdateTotalWithInterest",
      () => this.updateTotalWithInterestUseCase.execute(),
      {
        maxRetries: 3,
        retryDelay: 5000,
        notifyOnError: true,
      }
    );

    if (!result.success) {
      console.error("Falha ao atualizar totais com juros:", result.error);
    } else {
      console.log("Totais com juros atualizados com sucesso");
    }
  }
}
