import { Firestore, addDoc } from 'firebase/firestore';
import { auth, db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseLayout } from 'renderer/layout/BaseLayout';

export const InputPage = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [total, setTotal] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    console.log(id, name, price, total);
    //make a code to input my data to firebase
    const productCollection = collection(db, '/Product');
    const payload = {
      product_id: id,
      product: name,
      price: price,
      total: total,
    };
    const docRef = addDoc(productCollection, payload);
    console.log(docRef);
  }

  return (
    <BaseLayout>
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
          id="Id"
          placeholder="Item Id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="text-black"
          type="text"
          id="Name"
          placeholder="Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="text-black"
          type="text"
          id="Price"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="text-black"
          type="text"
          id="Total"
          placeholder="Total"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
        />
        <button type="submit">Input</button>
      </form>
    </BaseLayout>
  );
};
