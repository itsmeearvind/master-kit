
export const buildPrismaQuery = (input: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc'|'desc'; search?: string; filters?: any; searchableFields?: string[] }) => {
  const page = input.page || 1;
  const limit = Math.min(input.limit || 20, 100);
  const skip = (page-1)*limit;
  let where: any = { ...input.filters };
  if(input.search && input.searchableFields?.length){
    where.OR = input.searchableFields.map(f => ({ [f]: { contains: input.search, mode: 'insensitive' } }));
  }
  const orderBy = input.sortBy ? { [input.sortBy]: input.sortOrder || 'desc' } : { createdAt: 'desc' };
  return { skip, take: limit, where, orderBy };
};
