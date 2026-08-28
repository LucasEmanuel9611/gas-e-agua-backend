import {
  PRIVACY_POLICY_ANDROID_PACKAGE_NAME,
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_CONTACT_PHONE_DISPLAY,
} from "@modules/legal/privacyPolicyHtml";
import request from "supertest";

import { app } from "@shared/infra/http/app";

describe("GetPrivacyPolicyController", () => {
  it("should return the privacy policy html without authentication", async () => {
    const response = await request(app).get("/privacidade");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.text).toContain("Política de Privacidade — Eduardo Gás");
    expect(response.text).toContain(PRIVACY_POLICY_CONTACT_EMAIL);
    expect(response.text).toContain(PRIVACY_POLICY_CONTACT_PHONE_DISPLAY);
    expect(response.text).toContain(PRIVACY_POLICY_ANDROID_PACKAGE_NAME);
    expect(response.text).toContain("LGPD");
    expect(response.text).toContain('href="/exclusao-de-conta"');
  });
});
