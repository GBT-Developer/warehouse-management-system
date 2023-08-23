import { useState } from 'react';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
function StockHistory() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch} />
          <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <TableHeader>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Merk</th>
                <th className="px-4 py-3">Part</th>
                <td className="px-4 py-3">Supplier</td>
                <td className="px-4 py-3">Jumlah</td>
              </TableHeader>
              <tbody className="overflow-y-auto">
                {products.map((product: Product, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <SingleTableItem>{index + 1}</SingleTableItem>
                    <SingleTableItem>{`${product.brand}`}</SingleTableItem>
                    <SingleTableItem>{`${product.part}`}</SingleTableItem>
                    <SingleTableItem>{`${product.supplier}`}</SingleTableItem>
                    <SingleTableItem>
                      <input
                        type="text"
                        className="w-20 text-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary-500 focus:ring-primary-500"
                      />
                    </SingleTableItem>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default StockHistory;
