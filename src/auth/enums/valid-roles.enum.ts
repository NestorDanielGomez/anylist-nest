import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {
    admin = "admin",
    user = "user",
    superUser = "superUser"
}

//enum en graphql
registerEnumType(ValidRoles, { name: "ValidRoles", description: "roles permitidos del enum" })