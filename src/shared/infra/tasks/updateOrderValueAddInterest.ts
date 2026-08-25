import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { container } from "tsyringe";

import { UpdateTotalWithInterestJob } from "../../../modules/orders/jobs/UpdateTotalWithInterestJob";

@Injectable()
export class UpdateOrderValueAddInterestTask {
  @Cron("0 1 * * *")
  async handle() {
    const updateTotalWithInterestJob = container.resolve(
      UpdateTotalWithInterestJob
    );

    await updateTotalWithInterestJob.execute();

    console.log("Running job: Update totals with interest...");
  }
}
