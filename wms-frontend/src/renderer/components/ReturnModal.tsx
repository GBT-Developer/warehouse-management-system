import { db } from 'firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Product } from 'renderer/interfaces/Product';

interface ReturnModalProps {
  confirmationMsg?: string;
  product_id: string | undefined;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmHandler: () => Promise<void>;
  children?: React.ReactNode;
}

export const ReturnModal = ({
  confirmationMsg,
  product_id,
  modalOpen,
  setModalOpen,
  confirmHandler,
  children,
}: ReturnModalProps) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!product_id) return;
        const productRef = doc(db, 'broken_product', product_id);
        setLoading(true);

        const productData = (await getDoc(productRef)).data() as Product;

        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });

    return () => {
      setProduct(null);
    };
  }, [product_id]);

  const confirmButtonHandler = async () => {
    setLoading(true);
    await confirmHandler();
    setLoading(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        modalOpen ? 'block' : 'hidden'
      } w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 flex justify-center items-center backdrop-filter backdrop-blur-sm`}
      onClick={toggleModal}
    >
      <div
        className="relative bg-white rounded-lg shadow w-2/5 p-6 overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-full h-full bg-transparent rounded-lg overflow-hidden">
          <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
            <div className="overflow-y-auto h-full relative">
              {loading && (
                <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                  <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {confirmationMsg && (
                  <div
                    className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <p className="text-center text-2xl font-bold">
                      {confirmationMsg}
                    </p>
                  </div>
                )}
                <div className="flex">
                  <p className="w-2/5 font-bold">Product Name:</p>
                  <p className="w-3/5">
                    {product &&
                      product.brand +
                        ' ' +
                        product.motor_type +
                        ' ' +
                        product.part}
                  </p>
                </div>
                <div className="flex">
                  <p className="w-2/5 font-bold">Color:</p>
                  <p className="w-3/5">
                    {product?.available_color
                      .split(' ')
                      .map((word) => word[0].toUpperCase() + word.slice(1))
                      .join(' ')}
                  </p>
                </div>
                <div className="flex">
                  <p className="w-2/5 font-bold">Count:</p>
                  <p className="w-3/5">{product?.count}</p>
                </div>
                {product?.supplier?.company_name && (
                  <div className="flex">
                    <p className="w-2/5 font-bold">Supplier:</p>
                    <p className="w-3/5">{product.supplier.company_name}</p>
                  </div>
                )}
                <div className="flex">
                  <p className="w-2/5 font-bold">Warehouse Position:</p>
                  <p className="w-3/5">{product?.warehouse_position}</p>
                </div>
                {children}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={toggleModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      confirmButtonHandler().catch((e) => console.log(e));
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
