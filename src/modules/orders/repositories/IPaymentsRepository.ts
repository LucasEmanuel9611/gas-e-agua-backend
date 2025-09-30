import {
  ICreateTransactionDTO,
  ITransaction,
} from "@modules/transactions/types/types";

export interface ITransactionsRepository {
  create(data: ICreateTransactionDTO): Promise<ITransaction>;
  findByOrderId(order_id: number): Promise<ITransaction[]>;
  findById(id: number): Promise<ITransaction | null>;
}
