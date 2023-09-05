export interface DispatchNote {
  id?: string;
  painter: string;
  created_at?: string;
  dispatch_items: {
    product_id: string;
    color: string;
    amount: string;
  }[];
}
