import { Timestamp } from '@firebase/firestore';

export interface Retoure {
  id?: string;
  created_at?: Timestamp;
  product_name: string;
  count: string;
  remarks: string;
  status: string;
}
