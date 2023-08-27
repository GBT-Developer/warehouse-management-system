import { DocumentReference, Timestamp } from '@firebase/firestore';

export interface StockHistory {
  id?: string;
  old_count: string;
  new_count: string;
  difference: string;
  updated_at?: Timestamp;
  product: DocumentReference;
}
