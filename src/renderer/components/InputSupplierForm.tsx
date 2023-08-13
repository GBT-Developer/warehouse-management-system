import React from 'react';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from 'firebase';
function InputSupplierForm() {
  const [suppNum, setSuppNum] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    console.log(suppNum, name, address, city, country);
    //make a code to input my data to firebase
    const productCollection = collection(db, '/supplier');
    const payload = {
      account_numer: suppNum,
      address: address,
      city: city,
      company_name: name,
      country: country,
    };
    const docRef = addDoc(productCollection, payload);
    console.log(docRef);
  }
  return (
    <form onSubmit={handleSubmit}>
      <h1>Input Supplier</h1>
      <input
        className="text-black"
        type="text"
        placeholder="Supplier Number"
        value={suppNum}
        onChange={(e) => setSuppNum(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Supplier Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <button
        type="submit"
        className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Submit
      </button>
    </form>
  );
}

export default InputSupplierForm;
