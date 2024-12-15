import dayjs from "../../../config/dayjs.config";
import { IDateProvider } from "./IDateProvider";

export class DayjsDateProvider implements IDateProvider {
  isSameHour(start_date: Date, end_date: Date): boolean {
    const end_date_utc = this.convertToUTC(end_date);
    const start_date_utc = this.convertToUTC(start_date);

    return dayjs(end_date_utc).diff(start_date_utc, "hours") === 0;
  }

  convertToUTC(date: Date): string {
    return dayjs(date).utc().local().format();
  }

  compareIfEqualDay(first_order_date: Date, second_order_date: Date): boolean {
    const first_order_date_utc = this.convertToUTC(first_order_date);
    const second_order_date_utc = this.convertToUTC(second_order_date);

    return dayjs(first_order_date_utc).isSame(second_order_date_utc, "day");
  }

  dateNow(): Date {
    return dayjs().toDate();
  }

  compareIfBefore(start_date: Date, end_date: Date): boolean {
    const start_date_date_utc = this.convertToUTC(start_date);

    return dayjs(end_date).isAfter(start_date_date_utc, "milliseconds");
  }

  dateIfDateIsThirtyMinutesAfter(start_date: Date, end_date: Date): boolean {
    const start_date_date_utc = this.convertToUTC(start_date);

    const minutesDiff = dayjs(end_date).diff(start_date_date_utc, "minutes");
    return minutesDiff >= 30;
  }

  isSameDay(first_day: Date, second_day: Date): boolean {
    const first_date_date_utc = this.convertToUTC(first_day);

    return dayjs(first_date_date_utc).isSame(second_day, "day");
  }
}
