import { Product } from './Product';
export interface Invoice {
  id?: string;
  customer_id?: string;
  customer_name?: string;
  date?: string;
  time: string;
  warehouse_position?: string;
  items?: (Product & {
    is_returned?: boolean;
  })[];
  payment_method?: string;
  total_price?: number;
}
