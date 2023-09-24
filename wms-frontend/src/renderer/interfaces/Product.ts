import { Supplier } from './Supplier';

export interface Product {
  id?: string;
  brand: string;
  motor_type: string;
  part: string;
  available_color: string;
  sell_price: number;
  warehouse_position: string;
  count: number;
  created_at?: string;
  supplier?: Supplier;
}
