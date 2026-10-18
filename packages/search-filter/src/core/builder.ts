
import type { SearchInput, FilterInput, SortInput, PaginationResult } from './types.js';

export class QueryBuilder {
  constructor(private input: SearchInput) {}

  // Build Prisma where clause
  buildPrismaWhere(): any {
    const where: any = {};
    const { filters, search, searchFields } = this.input;

    if (filters?.length) {
      for (const f of filters) {
        where[f.field] = this.filterToPrisma(f);
      }
    }

    if (search && searchFields?.length) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    } else if (search) {
      // if no searchFields, search will be handled by client
    }

    return where;
  }

  private filterToPrisma(f: FilterInput) {
    switch (f.operator) {
      case 'eq': return f.value;
      case 'ne': return { not: f.value };
      case 'gt': return { gt: f.value };
      case 'gte': return { gte: f.value };
      case 'lt': return { lt: f.value };
      case 'lte': return { lte: f.value };
      case 'in': return { in: f.value };
      case 'nin': return { notIn: f.value };
      case 'contains': return { contains: f.value, mode: 'insensitive' };
      case 'startsWith': return { startsWith: f.value, mode: 'insensitive' };
      case 'endsWith': return { endsWith: f.value, mode: 'insensitive' };
      case 'between': return { gte: f.value[0], lte: f.value[1] };
      default: return f.value;
    }
  }

  buildPrismaOrderBy(): any {
    if (!this.input.sort?.length) return { createdAt: 'desc' };
    return this.input.sort.map(s => ({ [s.field]: s.direction }));
  }

  buildPrismaPagination() {
    const page = this.input.page || 1;
    const limit = Math.min(this.input.limit || 20, 100);
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  buildPaginationMeta(total: number): PaginationResult {
    const page = this.input.page || 1;
    const limit = this.input.limit || 20;
    const totalPages = Math.ceil(total / limit);
    return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  }

  // For MongoDB
  buildMongoFilter(): any {
    const filter: any = {};
    if (this.input.filters) {
      for (const f of this.input.filters) {
        filter[f.field] = this.filterToMongo(f);
      }
    }
    if (this.input.search && this.input.searchFields) {
      filter.$or = this.input.searchFields.map(field => ({ [field]: { $regex: this.input.search, $options: 'i' } }));
    }
    return filter;
  }

  private filterToMongo(f: FilterInput) {
    switch (f.operator) {
      case 'eq': return f.value;
      case 'ne': return { $ne: f.value };
      case 'gt': return { $gt: f.value };
      case 'gte': return { $gte: f.value };
      case 'lt': return { $lt: f.value };
      case 'lte': return { $lte: f.value };
      case 'in': return { $in: f.value };
      case 'nin': return { $nin: f.value };
      case 'contains': return { $regex: f.value, $options: 'i' };
      case 'startsWith': return { $regex: `^${f.value}`, $options: 'i' };
      case 'endsWith': return { $regex: `${f.value}$`, $options: 'i' };
      case 'between': return { $gte: f.value[0], $lte: f.value[1] };
      default: return f.value;
    }
  }
}

export const createQueryBuilder = (input: SearchInput) => new QueryBuilder(input);

// High-level helper for Prisma
export const withSearchFilter = async (prismaModel: any, input: SearchInput) => {
  const builder = new QueryBuilder(input);
  const where = builder.buildPrismaWhere();
  const orderBy = builder.buildPrismaOrderBy();
  const { skip, take, page, limit } = builder.buildPrismaPagination();

  const [data, total] = await Promise.all([
    prismaModel.findMany({ where, orderBy, skip, take }),
    prismaModel.count({ where }),
  ]);

  return { data, pagination: builder.buildPaginationMeta(total) };
};
