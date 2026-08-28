import { Request, Response } from "express";

import { buildPrivacyPolicyHtml } from "../../privacyPolicyHtml";

export class GetPrivacyPolicyController {
  async handle(_: Request, response: Response): Promise<Response> {
    const privacyPolicyHtml = buildPrivacyPolicyHtml();

    response.set("Content-Type", "text/html; charset=utf-8");

    return response.status(200).send(privacyPolicyHtml);
  }
}
