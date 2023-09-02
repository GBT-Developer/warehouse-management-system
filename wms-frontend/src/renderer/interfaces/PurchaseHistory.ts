import { Product } from './Product';
import { Supplier } from './Supplier';

export interface Purchase_History {
  id?: string;
  count: string;
  payment_status: string;
  purchase_price: string;
  created_at: string;
  product: Product | null;
  supplier: Supplier | null;
}
