import { db } from 'firebase';
import {
  addDoc,
  and,
  collection,
  doc,
  getDocs,
  or,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import React, { FormEvent, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiSolidTrash } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { DispatchNote } from 'renderer/interfaces/DispatchNote';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';
const newDispatchNoteInitialStates: DispatchNote = {
  painter: '',
  date: '',
  dispatch_items: [],
};

export const TransferItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatchNote, setDispatchNote] = useState<DispatchNote>(
    newDispatchNoteInitialStates
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const successNotify = () => toast.success('Item successfully transferred');
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Failed to transfer item');
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (dispatchNote.dispatch_items.length === 0) {
      if (
        dispatchNote.date === '' ||
        dispatchNote.painter === '' ||
        dispatchNote.dispatch_items.map((item) => item.color === '') ||
        dispatchNote.dispatch_items.map((item) => item.amount === 0)
      ) {
        setIsEmpty(true);
        setErrorMessage('Please fill all fields');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      } else if (dispatchNote.date != '' && dispatchNote.painter != '') {
        setIsEmpty(true);
        setErrorMessage('Please fill all fields');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      }
    } else if (
      dispatchNote.dispatch_items.length != 0 &&
      dispatchNote.date != '' &&
      dispatchNote.painter != ''
    ) {
      dispatchNote.dispatch_items.map((item) => {
        if (item.color != '' && item.amount != 0) {
          setIsEmpty(false);
          return;
        } else {
          setIsEmpty(true);
          setErrorMessage('Please fill all fields');
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
          return;
        }
      });
    }
    console.log('isEmpty', isEmpty);
  }, [dispatchNote]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!dispatchNote.date || !dispatchNote.painter) {
      setErrorMessage('Please fill all fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (dispatchNote.dispatch_items.length === 0) {
      setErrorMessage('Please add at least one product');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Check if color and amount is filled
    if (
      dispatchNote.dispatch_items.some(
        (item) => item.color === '' || item.amount === 0
      )
    ) {
      setErrorMessage('Please fill all fields');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Check if amount is greater than 0, is a number, is smaller or equal to available amount
    if (
      dispatchNote.dispatch_items.some(
        (item) =>
          item.amount <= 0 ||
          isNaN(item.amount) ||
          item.amount >
            (selectedProducts.find((p) => p.id === item.product_id)?.count ?? 0)
      )
    ) {
      setErrorMessage('Invalid amount');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    try {
      setLoading(true);
      const dispatchNoteRef = collection(db, 'dispatch_note');
      const dispatchNoteDoc = await addDoc(dispatchNoteRef, dispatchNote);

      // Update product count, set new product with new status
      await runTransaction(db, (transaction) => {
        for (const item of dispatchNote.dispatch_items) {
          const currentProduct = selectedProducts.find(
            (p) => p.id === item.product_id
          );
          if (!currentProduct) return Promise.reject();
          const difference = currentProduct.count - item.amount;
          transaction.update(
            doc(db, 'product', item.product_id),
            'count',
            difference.toString()
          );
        }

        // Set new product with new status
        for (const item of dispatchNote.dispatch_items) {
          const currentProduct = selectedProducts.find(
            (p) => p.id === item.product_id
          );
          if (!currentProduct) return Promise.reject();
          currentProduct.available_color = item.color;
          transaction.set(doc(collection(db, 'on_dispatch')), {
            ...currentProduct,
            status: 'Under painting',
            count: item.amount,
            dispatch_note_id: dispatchNoteDoc.id,
          });
        }
        setLoading(false);
        successNotify();
        return Promise.resolve();
      }).catch((error) => {
        setLoading(false);
        const errorMessage = error as unknown as string;
        failNotify(errorMessage);
      });

      // Clear form
      setDispatchNote(newDispatchNoteInitialStates);
      setSelectedProducts([]);
      setProducts([]);
      setLoading(false);
      if (dateInputRef.current) dateInputRef.current.value = '';
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  const handleSearch = async (search: string) => {
    const productsQuery = query(
      collection(db, 'product'),
      and(
        where('warehouse_position', '==', 'Gudang Bahan'),
        or(
          // Query as-is:
          and(
            where('brand', '>=', search),
            where('brand', '<=', search + '\uf8ff')
          ),
          // Capitalize first letter:
          and(
            where(
              'brand',
              '>=',
              search.charAt(0).toUpperCase() + search.slice(1)
            ),
            where(
              'brand',
              '<=',
              search.charAt(0).toUpperCase() + search.slice(1) + '\uf8ff'
            )
          ),
          // Lowercase:
          and(
            where('brand', '>=', search.toLowerCase()),
            where('brand', '<=', search.toLowerCase() + '\uf8ff')
          )
        )
      )
    );
    const querySnapshot = await getDocs(productsQuery);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Product;
      data.id = doc.id;
      products.push(data);
    });
    setProducts(products);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl pt-4">
        Transfer Item
      </h1>
      <form
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}

        <InputField
          label="Painter"
          labelFor="painter"
          loading={loading}
          value={dispatchNote.painter}
          onChange={(e) => {
            setDispatchNote(() => ({
              ...dispatchNote,
              painter: e.target.value,
            }));
          }}
        />

        <div className="flex justify-between">
          <div className="w-1/3 flex items-center">
            <label htmlFor={'date-id'} className="text-md">
              Date
            </label>
          </div>
          <div className="w-2/3">
            <input
              ref={dateInputRef}
              disabled={loading}
              type="date"
              name="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => {
                setDispatchNote(() => ({
                  ...dispatchNote,
                  date: e.target.value,
                }));
              }}
            />
          </div>
        </div>

        <ul className="my-3 space-y-3 font-regular">
          {selectedProducts.length > 0 &&
            dispatchNote.dispatch_items.length > 0 &&
            dispatchNote.dispatch_items.map((item, index) => (
              <li key={index}>
                <div className="flex flex-row">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex w-full justify-between">
                      <p className="text-lg font-semibold">
                        {selectedProducts[index].brand +
                          ' ' +
                          selectedProducts[index].motor_type +
                          ' ' +
                          selectedProducts[index].part +
                          ' ' +
                          selectedProducts[index].available_color}
                      </p>
                      <button
                        type="button"
                        className="text-red-500 text-lg p-2 hover:text-red-700 cursor-pointer bg-transparent rounded-md"
                        onClick={() => {
                          setDispatchNote({
                            ...dispatchNote,
                            dispatch_items: dispatchNote.dispatch_items.filter(
                              (i, idx) => idx !== index
                            ),
                          });
                          setSelectedProducts(
                            selectedProducts.filter(
                              (p) => p.id !== item.product_id
                            )
                          );
                        }}
                      >
                        <BiSolidTrash />
                      </button>
                    </div>
                    <InputField
                      label="Color"
                      labelFor="color"
                      loading={loading}
                      value={item.color}
                      onChange={(e) => {
                        setDispatchNote({
                          ...dispatchNote,
                          dispatch_items: dispatchNote.dispatch_items.map(
                            (i, idx) => {
                              if (idx === index) i.color = e.target.value;

                              return i;
                            }
                          ),
                        });
                      }}
                    />
                    <InputField
                      label="Amount"
                      labelFor="amount"
                      loading={loading}
                      value={item.amount}
                      onChange={(e) => {
                        if (!/^[0-9]+$/.test(e.target.value)) return;

                        setDispatchNote({
                          ...dispatchNote,
                          dispatch_items: dispatchNote.dispatch_items.map(
                            (i, idx) => {
                              if (idx === index)
                                i.amount = Number(e.target.value);

                              return i;
                            }
                          ),
                        });
                      }}
                    />
                  </div>
                </div>
                <hr className="mt-3 mb-4" />
              </li>
            ))}
        </ul>

        <button
          type="button"
          className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
          onClick={() => setModalOpen(true)}
        >
          + Add Products
        </button>

        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={isEmpty}
            type="submit"
            style={{
              backgroundColor: isEmpty ? 'gray' : 'blue',
              // Add other styles as needed
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
            onClick={(e) => {
              handleSubmit(e).catch((error) => console.error(error));
            }}
          >
            Transfer Item
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>

      <TableModal
        placeholder="Search by product brand"
        modalOpen={modalOpen}
        handleSearch={handleSearch}
        setModalOpen={setModalOpen}
        title={'Choose Product'}
        headerList={
          products.length > 0 ? ['', 'Product name', 'Available amount'] : []
        }
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <tr
              key={index}
              className="border-b hover:shadow-md cursor-pointer"
              onClick={() => {
                if (selectedProducts.find((p) => p === product)) {
                  setSelectedProducts(
                    selectedProducts.filter((p) => p !== product)
                  );
                  setDispatchNote({
                    ...dispatchNote,
                    dispatch_items: dispatchNote.dispatch_items.filter(
                      (i) => i.product_id !== product.id
                    ),
                  });
                } else {
                  if (!product.id) return;
                  setSelectedProducts([...selectedProducts, product]);
                  setDispatchNote({
                    ...dispatchNote,
                    dispatch_items: [
                      ...dispatchNote.dispatch_items,
                      {
                        product_id: product.id,
                        color: '',
                        amount: 0,
                      },
                    ],
                  });
                }
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product)}
                  readOnly
                />
              </SingleTableItem>
              <SingleTableItem key={index}>
                {product.brand +
                  ' ' +
                  product.motor_type +
                  ' ' +
                  product.part +
                  ' ' +
                  product.available_color}
              </SingleTableItem>
              <SingleTableItem>{product.count}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </PageLayout>
  );
};
