import React from 'react';
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { BaseLayout } from 'renderer/layout/BaseLayout';

export const AuthPage = () => {
  const navigate = useNavigate();
  return (
    <BaseLayout>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <button
        type="button"
        onClick={() => {
          navigate('/inputpage');
        }}
      >
        Input Stock
      </button>
    </BaseLayout>
  );
};
