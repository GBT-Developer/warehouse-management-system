import React from 'react';
import { AppLayout } from 'renderer/layout/AppLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputSupplierForm from 'renderer/components/InputSupplierForm';

function InputSupplier() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Back
      </button>
      <InputSupplierForm />
    </AppLayout>
  );
}

export default InputSupplier;
