// Web stub: in-memory store for UI preview. expo-sqlite runs on Android/iOS.
import { schema } from "./schema";

const store = new Map<string, any[]>();
(Object.keys(schema) as Array<keyof typeof schema>).forEach((k) => store.set(k, []));

// Reverse-lookup: drizzle table object → JS variable name (the schema key)
const tableKeyMap = new Map<any, string>();
for (const [key, table] of Object.entries(schema)) {
  tableKeyMap.set(table, key);
}

function getTableKey(table: any): string {
  return tableKeyMap.get(table) ?? "";
}

/** Normalize Drizzle eq() objects → plain {key: value}, or pass through plain objects. */
function normalizeWhere(raw: any): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  // If it's already a plain object with scalar values (no queryChunks), use it directly
  if (!raw.queryChunks && !Array.isArray(raw.queryChunks)) {
    const entries = Object.entries(raw).filter(([, v]) => typeof v !== "object" || v === null);
    if (entries.length > 0) return Object.fromEntries(entries) as Record<string, unknown>;
  }
  // Try Drizzle eq() parsing
  const parsed = parseEqCondition(raw);
  if (parsed) return { [parsed.column]: parsed.value };
  return undefined;
}

function findMany(tableKey: string, where?: any) {
  let rows = store.get(tableKey) ?? [];
  const filter = normalizeWhere(where);
  if (filter) {
    rows = rows.filter((r: any) =>
      Object.entries(filter).every(([k, v]) => r[k] === v)
    );
  }
  return Promise.resolve([...rows]);
}

function findFirst(tableKey: string, where?: any) {
  const rows = store.get(tableKey) ?? [];
  const filter = normalizeWhere(where);
  const result = filter
    ? rows.find((r: any) =>
        Object.entries(filter).every(([k, v]) => r[k] === v)
      ) ?? null
    : rows[0] ?? null;
  return Promise.resolve(result);
}

function insertValues(tableKey: string, data: any) {
  const arr = (Array.isArray(data) ? data : [data]).map((row: any) => ({
    id: row.id ?? crypto.randomUUID(),
    ...row,
  }));
  store.set(tableKey, [...(store.get(tableKey) ?? []), ...arr]);
  return Promise.resolve(arr);
}

/** Parse a drizzle eq() result to extract column name and filter value. */
function parseEqCondition(condition: any): { column: string; value: unknown } | null {
  try {
    const chunks = condition?.queryChunks;
    if (!Array.isArray(chunks) || chunks.length < 3) return null;
    const col = chunks[0];
    const val = chunks[2];
    if (!col || typeof col.name !== "string") return null;
    // Right side may be a Param (has .value) or a raw value
    const value =
      val && typeof val === "object" && "value" in val && !Array.isArray((val as any).value)
        ? (val as any).value
        : val;
    return { column: col.name, value };
  } catch {
    return null;
  }
}

export const db = {
  query: {
    exercises: {
      findMany: () => findMany("exercises"),
      findFirst: (opts?: { where?: Record<string, unknown> }) =>
        findFirst("exercises", opts?.where),
    },
    users: {
      findFirst: (opts?: { where?: any }) => findFirst("users", opts?.where),
      findMany: (opts?: { where?: any }) => findMany("users", opts?.where),
    },
    trainingPlans: {
      findMany: () => findMany("trainingPlans"),
      findFirst: () => findFirst("trainingPlans"),
    },
    workoutSessions: {
      findMany: () => findMany("workoutSessions"),
    },
    workoutSets: {
      findMany: (opts?: { where?: Record<string, unknown> }) =>
        findMany("workoutSets", opts?.where),
    },
  },
  select: () => ({
    from: (table: any) => {
      const tableKey = getTableKey(table);
      return {
        where: (condition: any) => {
          let rows = (store.get(tableKey) ?? []) as any[];
          const parsed = parseEqCondition(condition);
          if (parsed) {
            rows = rows.filter((r: any) => r[parsed.column] === parsed.value);
          }
          return Promise.resolve(rows);
        },
        // Allow awaiting from() directly (count query fallback)
        then(resolve: any) {
          return resolve([{ count: (store.get(tableKey) ?? []).length }]);
        },
      };
    },
  }),
  insert: (table: any) => ({
    values: (data: any) => {
      const promise = insertValues(getTableKey(table), data);
      return {
        returning: () => promise,
        then: (resolve: any) => promise.then(resolve),
      };
    },
  }),
} as any;

export { schema };
export * from "./schema";
