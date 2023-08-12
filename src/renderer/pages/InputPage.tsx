import { addDoc, collection } from 'firebase/firestore';
import { db } from 'firebase';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from 'renderer/layout/AppLayout';
import { Product } from 'renderer/interfaces/Product';

const newProductInitialState = {
  brand: '',
  motor_type: '',
  part: '',
  available_color: '',
  price: '',
  warehouse_position: '',
  count: '',
};

export const InputPage = () => {
  const [newProduct, setNewProduct] = useState<Product>(newProductInitialState);
  const navigate = useNavigate();

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    const productCollection = collection(db, '/product');

    addDoc(productCollection, newProduct).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  }

  return (
    <AppLayout>
      <button
        type="button"
        onClick={() => {
          navigate(-1);
        }}
      >
        Back
      </button>
      <form onSubmit={handleSubmit}>
        <input
          className="text-black"
          type="text"
          placeholder="Merek"
          value={newProduct.brand}
          onChange={(e) =>
            setNewProduct({ ...newProduct, brand: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Jenis motor"
          value={newProduct.motor_type}
          onChange={(e) =>
            setNewProduct({ ...newProduct, motor_type: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Part"
          value={newProduct.part}
          onChange={(e) =>
            setNewProduct({ ...newProduct, part: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Warna tersedia"
          value={newProduct.available_color}
          onChange={(e) =>
            setNewProduct({ ...newProduct, available_color: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Jumlah barang"
          value={newProduct.count}
          onChange={(e) =>
            setNewProduct({ ...newProduct, count: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Harga barang"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <input
          className="text-black"
          type="text"
          placeholder="Posisi gudang"
          value={newProduct.warehouse_position}
          onChange={(e) =>
            setNewProduct({ ...newProduct, warehouse_position: e.target.value })
          }
        />
        <button type="submit">Input</button>
      </form>
    </AppLayout>
  );
};
