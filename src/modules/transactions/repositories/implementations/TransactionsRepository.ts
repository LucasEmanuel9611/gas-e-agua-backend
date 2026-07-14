import {
  ICreateTransactionDTO,
  ITransaction,
  TransactionSortOption,
  UserAccountTransaction,
} from "@modules/transactions/types/types";
import { Prisma } from "@prisma/client";

import { prisma } from "@shared/infra/database/prisma";

import { ITransactionsRepository } from "../ITransactionsRepository";

function getTransactionOrderBy(
  sort: TransactionSortOption
): Prisma.TransactionOrderByWithRelationInput {
  if (sort === "date_asc") {
    return { created_at: "asc" };
  }

  if (sort === "amount_desc") {
    return { amount: "desc" };
  }

  if (sort === "amount_asc") {
    return { amount: "asc" };
  }

  return { created_at: "desc" };
}

export class TransactionsRepository implements ITransactionsRepository {
  async create(data: ICreateTransactionDTO): Promise<ITransaction> {
    const transaction = await prisma.transaction.create({
      data: data as Prisma.TransactionUncheckedCreateInput,
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

  async findByUserIdPaginated({
    userId,
    page,
    limit,
    sort,
    orderId,
  }: {
    userId: number;
    page: number;
    limit: number;
    sort: TransactionSortOption;
    orderId?: number;
  }): Promise<{ items: UserAccountTransaction[]; total: number }> {
    const where: Prisma.TransactionWhereInput = {
      order: {
        user_id: userId,
        ...(orderId ? { id: orderId } : {}),
      },
    };

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          order: {
            select: {
              payment_state: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: getTransactionOrderBy(sort),
      }),
      prisma.transaction.count({ where }),
    ]);

    const items: UserAccountTransaction[] = transactions.map(
      ({ order, ...transaction }) => ({
        ...(transaction as ITransaction),
        accountPaymentState: order.payment_state,
      })
    );

    return { items, total };
  }
}
