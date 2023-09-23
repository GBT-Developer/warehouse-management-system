import { Product } from './Product';
export interface Invoice {
  id?: string;
  customer_id?: string;
  date?: string;
  items?: Product[];
  payment_method?: string;
  total_price?: string;
  created_at?: string;
}
