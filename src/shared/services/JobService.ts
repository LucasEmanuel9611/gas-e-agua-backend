interface IJobOptions {
  maxRetries?: number;
  retryDelay?: number;
  notifyOnError?: boolean;
}

interface IJobResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retries: number;
}

export class JobService {
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private static async notifyError(
    jobName: string,
    error: unknown
  ): Promise<void> {
    console.error(`[${jobName}] Erro crítico:`, error);
  }

  static async runJob<T>(
    jobName: string,
    job: () => Promise<T>,
    options: IJobOptions = {}
  ): Promise<IJobResult<T>> {
    const { maxRetries = 3, retryDelay = 1000, notifyOnError = true } = options;
    return this.attemptJob(
      jobName,
      job,
      maxRetries,
      retryDelay,
      notifyOnError,
      0
    );
  }

  private static async attemptJob<T>(
    jobName: string,
    job: () => Promise<T>,
    maxRetries: number,
    retryDelay: number,
    notifyOnError: boolean,
    currentAttempt: number
  ): Promise<IJobResult<T>> {
    try {
      console.log(`[${jobName}] Executando...`);
      const result = await job();
      console.log(`[${jobName}] Sucesso!`);

      return {
        success: true,
        data: result,
        retries: currentAttempt,
      };
    } catch (error) {
      const nextAttempt = currentAttempt + 1;
      console.error(`[${jobName}] Erro (tentativa ${nextAttempt}):`, error);

      if (nextAttempt <= maxRetries) {
        console.log(`[${jobName}] Aguardando ${retryDelay}ms...`);
        await this.delay(retryDelay);
        return this.attemptJob(
          jobName,
          job,
          maxRetries,
          retryDelay,
          notifyOnError,
          nextAttempt
        );
      }

      if (notifyOnError) {
        await this.notifyError(jobName, "Todas as tentativas falharam");
      }

      return {
        success: false,
        error: "Todas as tentativas falharam",
        retries: currentAttempt,
      };
    }
  }
}
