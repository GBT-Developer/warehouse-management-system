import { Supplier } from './Supplier';

export interface Product {
  id?: string;
  brand: string;
  motor_type: string;
  part: string;
  available_color: string;
  sell_price: string;
  warehouse_position: string;
  count: string;
  created_at?: string;
  supplier?: Supplier;
}
