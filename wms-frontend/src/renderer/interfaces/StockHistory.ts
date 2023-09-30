import { Product } from './Product';

export interface StockHistory {
  id?: string;
  count: number;
  old_count: number;
  difference: number;
  created_at?: string;
  time?: string;
  product: Product;
  product_name: string;
  warehouse_position: string;
  type: string;
}
