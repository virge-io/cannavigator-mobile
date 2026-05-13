export interface Paginated<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}
