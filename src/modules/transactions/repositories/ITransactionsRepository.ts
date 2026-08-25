import {
  ICreateTransactionDTO,
  ITransaction,
  TransactionSortOption,
  UserAccountTransaction,
} from "@modules/transactions/types/types";

export interface ITransactionsRepository {
  create(data: ICreateTransactionDTO): Promise<ITransaction>;
  findByOrderId(order_id: number): Promise<ITransaction[]>;
  findById(id: number): Promise<ITransaction | null>;
  deleteById(id: number): Promise<void>;
  findByUserIdPaginated(params: {
    userId: number;
    page: number;
    limit: number;
    sort: TransactionSortOption;
    orderId?: number;
  }): Promise<{ items: UserAccountTransaction[]; total: number }>;
  sumPaymentsByDateRange(startDate: Date, endDate: Date): Promise<number>;
}
