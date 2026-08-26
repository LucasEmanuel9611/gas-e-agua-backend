import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { UpdateTotalWithInterestJob } from "../../../modules/orders/jobs/UpdateTotalWithInterestJob";

@Injectable()
export class UpdateOrderValueAddInterestTask {
  constructor(
    private readonly updateTotalWithInterestJob: UpdateTotalWithInterestJob
  ) {}

  @Cron("0 1 * * *")
  async handle() {
    await this.updateTotalWithInterestJob.execute();

    console.log("Running job: Update totals with interest...");
  }
}
