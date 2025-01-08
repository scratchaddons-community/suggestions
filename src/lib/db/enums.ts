import { pgEnum } from "drizzle-orm/pg-core";

export const tag = pgEnum("tag", ["website", "editor", "other", "everywhere"]);
export const status = pgEnum("status", [
	"pending",
	"good",
	"implemented",
	"in-dev",
	"incompatible",
	"impractical",
	"rejected",
	"impossible",
]);
export const role = pgEnum("role", ["user", "trusted", "mod", "dev", "admin", "jazza"]);

export const tags = tag.enumValues;
export const statuses = status.enumValues;
export const roles = role.enumValues;
