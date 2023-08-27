import { DocumentReference } from '@firebase/firestore';

export interface Product {
  id?: string;
  brand: string;
  motor_type: string;
  part: string;
  available_color: string;
  buy_price: string;
  sell_price: string;
  warehouse_position: string;
  count: string;
  created_at?: string;
  updated_at?: string;
  supplier: DocumentReference;
}
