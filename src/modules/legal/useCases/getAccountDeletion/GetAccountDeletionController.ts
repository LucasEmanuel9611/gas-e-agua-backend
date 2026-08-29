import { Request, Response } from "express";

import { buildAccountDeletionHtml } from "../../accountDeletionHtml";

export class GetAccountDeletionController {
  async handle(_: Request, response: Response): Promise<Response> {
    const accountDeletionHtml = buildAccountDeletionHtml();

    response.set("Content-Type", "text/html; charset=utf-8");

    return response.status(200).send(accountDeletionHtml);
  }
}
