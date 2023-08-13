import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseLayout } from 'renderer/layout/BaseLayout';
import { AppLayout } from 'renderer/layout/AppLayout';
import InputPageForm from 'renderer/components/InputPageForm';
export const InputPage = () => {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <button
        className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        type="button"
        onClick={() => {
          navigate(-1);
        }}
      >
        Back
      </button>
      <h1>Input Stock</h1>
      <InputPageForm />
    </AppLayout>
  );
};

export default InputPage;
