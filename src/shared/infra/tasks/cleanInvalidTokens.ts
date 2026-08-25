import { CleanInvalidTokensUseCase } from "@modules/notifications/useCases/cleanInvalidTokens/cleanInvalidTokensUseCase";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CleanInvalidTokensTask {
  constructor(
    private readonly cleanInvalidTokensUseCase: CleanInvalidTokensUseCase
  ) {}

  @Cron("0 3 * * *")
  async handle() {
    console.log("[CRON] Iniciando limpeza de tokens inválidos...");

    try {
      const result = await this.cleanInvalidTokensUseCase.execute(90);

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
  }
}
