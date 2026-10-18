
export type SortDirection = 'asc' | 'desc';
export type SortInput = { field: string; direction: SortDirection };

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'between';

export type FilterInput = {
  field: string;
  operator: FilterOperator;
  value: any;
};

export type SearchInput = {
  search?: string; // global search
  searchFields?: string[]; // fields to search in
  filters?: FilterInput[];
  sort?: SortInput[];
  page?: number;
  limit?: number;
};

export type PaginationResult = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
