import { Supplier } from './Supplier';

export interface PurchaseHistory {
  id?: string;
  created_at: string;
  time: string;
  supplier: Supplier | null;
  purchase_price: number;
  payment_status: string;
  warehouse_position: string;
  products: {
    id: string;
    name: string;
    quantity: number;
  }[];
}
