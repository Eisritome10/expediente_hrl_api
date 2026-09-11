import { Prisma } from '@prisma/client';

type DriverAdapterUniqueConstraintMeta = {
  driverAdapterError?: {
    cause?: {
      constraint?: {
        index?: string;
      };
    };
  };
};

/**
 * With `@prisma/adapter-pg`, a P2002 error doesn't populate `meta.target`
 * (the array of column names Prisma's own query engine would give) — the
 * offending constraint only shows up nested under `meta.driverAdapterError`.
 * This normalizes both shapes into a single string to match against.
 */
export function getUniqueConstraintTarget(error: Prisma.PrismaClientKnownRequestError): string {
  const target = error.meta?.target;

  if (typeof target === 'string') return target;
  if (Array.isArray(target)) return target.join(',');

  const driverAdapterMeta = error.meta as DriverAdapterUniqueConstraintMeta | undefined;
  return driverAdapterMeta?.driverAdapterError?.cause?.constraint?.index ?? '';
}
