export interface Customer {
  id?: string;
  name: string;
  address: string;
  phone_number: string;
  special_price_products: {
    product: string | null;
    price: string | null;
  }[];
}
