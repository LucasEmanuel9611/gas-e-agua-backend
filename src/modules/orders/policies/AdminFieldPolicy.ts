import { AppError } from "@shared/errors/AppError";

export class AdminFieldPolicy {
  private static adminOnlyFields: string[] = [
    "user_id",
    "status",
    "payment_state",
    "total",
    "interest_allowed",
    "overdue_amount",
    "overdue_description",
    "due_date",
  ];

  static validate(role: string, data: any) {
    if (role !== "ADMIN") {
      const forbidden = this.adminOnlyFields.filter(
        (field) => data[field] !== undefined
      );

      if (forbidden.length > 0) {
        throw new AppError({
          message: `Role ${role} is not allowed to set fields: ${forbidden.join(
            ", "
          )}`,
          statusCode: 403,
        });
      }
    }
  }
}
