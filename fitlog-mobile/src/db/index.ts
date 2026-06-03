import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { schema } from "./schema";

const expoDb = openDatabaseSync("fitlog.db");
export const db = drizzle(expoDb, { schema });
export { expoDb };

export { schema };
export * from "./schema";
