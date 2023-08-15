import React from 'react';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from 'firebase';
import { stat } from 'fs';
function InputSupplierForm() {
  const [company_name, setCompany_name] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [city, setCity] = useState('');
  const [product, setProduct] = useState('');
  const [factory, setFactory] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    console.log(
      company_name,
      address,
      phoneNum,
      city,
      accountNum,
      product,
      factory
    );
    //make a code to input my data to firebase
    const productCollection = collection(db, '/supplier');
    const payload = {
      company_name: company_name,
      address: address,
      city: city,
      phoneNum: phoneNum,
      accountNum: accountNum,
      product: product,
      factory: factory,
      status: status,
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
        placeholder="Company Name"
        value={company_name}
        onChange={(e) => setCompany_name(e.target.value)}
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
        placeholder="Phone Number"
        value={phoneNum}
        onChange={(e) => setPhoneNum(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="account number"
        value={accountNum}
        onChange={(e) => setAccountNum(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Product"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Factory"
        value={factory}
        onChange={(e) => setFactory(e.target.value)}
      />
      <input
        className="text-black"
        type="text"
        placeholder="Payment Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
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
