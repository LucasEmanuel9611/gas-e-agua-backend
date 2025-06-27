import { prisma } from "@shared/infra/database/prisma";

import { ICreateTransactionDTO, ITransaction } from "../../types";
import { ITransactionsRepository } from "../ITransactionsRepository";

export class TransactionsRepository implements ITransactionsRepository {
  async create(data: ICreateTransactionDTO): Promise<ITransaction> {
    const transaction = await prisma.transaction.create({
      data,
    });
    return transaction as ITransaction;
  }

  async findByOrderId(order_id: number): Promise<ITransaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { order_id },
      orderBy: { created_at: "asc" },
    });
    return transactions as ITransaction[];
  }

  async findById(id: number): Promise<ITransaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    return transaction as ITransaction;
  }
}
