import cron from "node-cron";
import { container } from "tsyringe";

import { UpdateTotalWithInterestUseCase } from "../../../modules/orders/useCases/updateTotalWithInterest/UpdateTotalWithInterestUseCase";

export function configureCronJob() {
  cron.schedule("0 1 * * *", async () => {
    const updateTotalWithInterestUseCase = container.resolve(
      UpdateTotalWithInterestUseCase
    );

    await updateTotalWithInterestUseCase.execute();

    console.log("Running job: Update totals with interest...");
  });
}
