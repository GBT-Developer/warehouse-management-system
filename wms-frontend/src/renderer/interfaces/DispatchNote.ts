export interface DispatchNote {
  id?: string;
  painter: string;
  date?: string;
  time?: string;
  dispatch_items: {
    product_id: string;
    color: string;
    amount: number;
  }[];
}
