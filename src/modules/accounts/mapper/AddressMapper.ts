import { AddressDates } from "../types";

export type PersistenceAddress = {
  id: number;
  street: string | null;
  reference: string;
  local: string;
  number: string | null;
  user_id: number;
  isDefault: boolean;
};

export class AddressMap {
  static toDomain(address: PersistenceAddress): AddressDates {
    return {
      id: address.id,
      street: address.street ?? undefined,
      reference: address.reference,
      local: address.local,
      number: address.number ?? undefined,
      user_id: address.user_id,
      isDefault: address.isDefault,
    };
  }
}
