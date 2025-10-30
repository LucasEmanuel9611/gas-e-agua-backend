import { CleanInvalidTokensUseCase } from "@modules/notifications/useCases/cleanInvalidTokens/cleanInvalidTokensUseCase";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleCleanInvalidTokens() {
  cron.schedule("0 3 * * *", async () => {
    console.log("[CRON] Iniciando limpeza de tokens inválidos...");

    const cleanInvalidTokensUseCase = container.resolve(
      CleanInvalidTokensUseCase
    );

    try {
      const result = await cleanInvalidTokensUseCase.execute(90);

      if (result.tokensRemoved > 0) {
        console.log(
          `[CRON - Limpeza de Tokens] - ${result.tokensRemoved} tokens removidos de ${result.usersAffected} usuários`
        );
      } else {
        console.log(
          "[CRON - Limpeza de Tokens] - Nenhum token inválido encontrado"
        );
      }

      if (result.errors.length > 0) {
        console.warn(
          `[CRON - Limpeza de Tokens] - ${result.errors.length} erros encontrados:`,
          result.errors
        );
      }
    } catch (error) {
      console.error("[CRON - Limpeza de Tokens] - Erro geral:", error);
    }
  });
}
