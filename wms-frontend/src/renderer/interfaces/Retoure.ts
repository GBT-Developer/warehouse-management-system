import { Invoice } from './Invoice';
export interface Retoure {
  invoice?: Invoice;
  created_at?: string;
  product_name?: string;
  count?: number;
  remarks?: string;
  status?: string;
}
