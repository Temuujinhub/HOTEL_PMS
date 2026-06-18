import { Prisma } from '@prisma/client';

/**
 * Model names (Prisma PascalCase) that carry a `tenantId` column and must be
 * isolated per tenant. `Tenant` itself is intentionally excluded — it is the
 * root of the hierarchy and is looked up by primary key during auth.
 */
export const TENANT_SCOPED_MODELS = new Set<string>([
  'Subscription',
  'User',
  'Property',
  'RoomType',
  'Room',
  'RatePlan',
  'Guest',
  'Reservation',
  'Folio',
  'FolioItem',
  'Payment',
  'HousekeepingTask',
  'LockCredential',
  'AuditLog',
]);

// Operations whose `where` clause accepts arbitrary filters — safe to inject
// the tenant predicate into.
const WHERE_OPERATIONS = new Set<string>([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
]);

/**
 * Prisma client extension that transparently constrains queries to the active
 * tenant. This is defence-in-depth: even if a service forgets to filter by
 * tenant, the extension guarantees isolation.
 *
 * Note: operations that take a *unique* where (findUnique/update/delete/upsert)
 * are deliberately left untouched, because their `where` only accepts unique
 * fields. Services therefore use `findFirst` for scoped reads and verify
 * ownership before unique updates/deletes.
 */
export function tenantGuardExtension(getTenantId: () => string | undefined) {
  return Prisma.defineExtension({
    name: 'tenantGuard',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantId = getTenantId();
          if (!tenantId || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const a: any = args ?? {};

          if (WHERE_OPERATIONS.has(operation)) {
            a.where = { ...(a.where ?? {}), tenantId };
          } else if (operation === 'create') {
            a.data = { ...(a.data ?? {}), tenantId };
          } else if (operation === 'createMany') {
            if (Array.isArray(a.data)) {
              a.data = a.data.map((row: any) => ({ ...row, tenantId }));
            } else if (a.data) {
              a.data = { ...a.data, tenantId };
            }
          }

          return query(a);
        },
      },
    },
  });
}
