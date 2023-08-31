import { Timestamp } from 'firebase/firestore';
import { Product } from './Product';
import { Supplier } from './Supplier';

export interface Purchase_History {
  id?: string;
  count: number;
  payment_status: string;
  created_at: Timestamp;
  product: Product;
  supplier: Supplier;
}
