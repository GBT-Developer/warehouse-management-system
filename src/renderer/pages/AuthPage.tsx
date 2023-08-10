import React from 'react';
import { BaseLayout } from 'renderer/layout/BaseLayout';
import { Routes } from 'react-router-dom';
import SignIn from 'renderer/components/Signin';


export const AuthPage = () => {
  return (
    <BaseLayout>
      <SignIn />
    </BaseLayout>
  );
};
