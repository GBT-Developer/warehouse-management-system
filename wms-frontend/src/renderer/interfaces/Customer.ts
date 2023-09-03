import { SpecialPrice } from './SpecialPrice';

export interface Customer {
  id?: string;
  name: string;
  address: string;
  phone_number: string;
  SpecialPrice: SpecialPrice[];
}
