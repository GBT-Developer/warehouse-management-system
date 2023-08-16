import React from 'react';
import { useState } from 'react';
import { Firestore, addDoc } from 'firebase/firestore';
import { auth, db } from 'firebase';
import { collection, getDocs, query } from 'firebase/firestore';

function InputPageForm() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [total, setTotal] = useState('');

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
      <button
        type="submit"
        className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Input
      </button>
    </form>
  );
}

export default InputPageForm;
