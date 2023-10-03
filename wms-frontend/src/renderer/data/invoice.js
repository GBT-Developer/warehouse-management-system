const invoice = {
  id: '1',
  customer_id: '1',
  customer_name: 'Nguyễn Văn A',
  date: '2020-12-12',
  warehouse_position: 'Gudang Bahan',
  items: [
    {
      id: '1',
      brand: 'Brand 1',
      motor_type: 'Motor 1',
      part: 'Part 1',
      available_color: 'Red',
      sell_price: 100000,
      warehouse_position: 'Gudang Bahan',
      count: 1,
      created_at: '2020-12-12',
      supplier: 'Supplier 1',
      is_returned: false,
    },
  ],
  payment_method: 'Cash',
  total_price: 100000,
  created_at: '2020-12-12',
};

export default invoice;
