import cron from "node-cron";
import { container } from "tsyringe";

import { UpdateTotalWithInterestJob } from "../../../modules/orders/jobs/UpdateTotalWithInterestJob";

export function scheduleUpdateOrderValueAddInterest() {
  cron.schedule("0 1 * * *", async () => {
    const updateTotalWithInterestJob = container.resolve(
      UpdateTotalWithInterestJob
    );

    await updateTotalWithInterestJob.execute();

    console.log("Running job: Update totals with interest...");
  });
}
