import { Supplier } from './Supplier';

export interface PurchaseHistory {
  id?: string;
  created_at: string;
  supplier: Supplier | null;
  purchase_price: string;
  payment_status: string;
  products: {
    id: string;
    name: string;
    quantity: string;
  }[];
}
