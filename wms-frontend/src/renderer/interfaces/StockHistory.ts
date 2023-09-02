import { Product } from './Product';

export interface StockHistory {
  id?: string;
  old_count: string;
  new_count: string;
  difference: string;
  updated_at?: string;
  product: Product;
}
