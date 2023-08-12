import React from 'react';
import { AppLayout } from 'renderer/layout/AppLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function handleSubmit(e: { preventDefault: () => void }) {
  e.preventDefault();
}

function InputSupplier() {
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bankNum, setBankNum] = useState('');

  return (
    <AppLayout>
      <form onSubmit={handleSubmit}>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1>Input Supplier</h1>
        <input
          className="text-black"
          type="text"
          placeholder="Supplier Id"
          value={id}
          onChange={(e) => setId(e.target.value)}
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
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="text-black"
          type="text"
          placeholder="Bank Number"
          value={bankNum}
          onChange={(e) => setBankNum(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </AppLayout>
  );
}

export default InputSupplier;
