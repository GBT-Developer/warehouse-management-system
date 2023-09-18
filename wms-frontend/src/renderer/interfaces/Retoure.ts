import { Invoice } from './Invoice';
export interface Retoure {
  invoice?: Invoice;
  created_at?: string;
  product_name?: string;
  count?: string;
  remarks?: string;
  status?: string;
}
