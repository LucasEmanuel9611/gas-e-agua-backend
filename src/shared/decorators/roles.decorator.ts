import { SetMetadata } from "@nestjs/common";

export const ROLES_METADATA_KEY = "requiredRoles";
export const Roles = (...requiredRoles: string[]) =>
  SetMetadata(ROLES_METADATA_KEY, requiredRoles);
