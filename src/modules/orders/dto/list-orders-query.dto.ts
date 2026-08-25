import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from "class-validator";

export class ListOrdersQueryDto {
  @IsOptional()
  @IsIn(["all", "me"])
  scope?: "all" | "me";

  @Transform(({ value }) => {
    if (value === undefined) {
      return 0;
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      return Number(value);
    }

    return value;
  })
  @IsNumber({}, { message: "O número da página deve ser um número válido" })
  page: number;

  @Transform(({ value }) => {
    if (value === undefined) {
      return 20;
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      return Number(value);
    }

    return value;
  })
  @IsNumber({}, { message: "O tamanho da página deve ser um número válido" })
  @Max(100, { message: "O limite máximo é 100 itens por página" })
  limit: number;

  @IsOptional()
  @IsString()
  date?: string;

  @Transform(({ value }) => {
    if (value === "true" || value === true) {
      return true;
    }

    return false;
  })
  @IsOptional()
  @IsBoolean()
  openAccounts?: boolean;
}
