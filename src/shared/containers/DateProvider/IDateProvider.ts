export interface IDateProvider {
  isSameHour(start_date: Date, end_date: Date): boolean;
  convertToUTC(date: Date): string;
  dateNow(): Date;
  compareIfBefore(start_date: Date, end_date: Date): boolean;
  compareIfEqualDay(before_order_date: Date, new_order_date: Date): boolean;
  dateIfDateIsThirtyMinutesAfter(
    existing_order_date: Date,
    new_order_date: Date
  ): boolean;
  isSameDay(first_day: Date, second_day: Date): boolean;
  getDaysDifference(inital_date: Date, end_date: Date): number;
}
