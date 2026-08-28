import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_CONTACT_PHONE_DISPLAY,
  PRIVACY_POLICY_CONTACT_WHATSAPP_URL,
} from "@modules/legal/privacyPolicyHtml";
import request from "supertest";

import { app } from "@shared/infra/http/app";

describe("GetAccountDeletionController", () => {
  it("should return the account deletion request html without authentication", async () => {
    const response = await request(app).get("/exclusao-de-conta");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.text).toContain("Solicitar exclusão da conta e dos dados");
    expect(response.text).toContain(PRIVACY_POLICY_CONTACT_EMAIL);
    expect(response.text).toContain(PRIVACY_POLICY_CONTACT_PHONE_DISPLAY);
    expect(response.text).toContain(PRIVACY_POLICY_CONTACT_WHATSAPP_URL);
  });
});
