import React from 'react';
import { BaseLayout } from 'renderer/layout/BaseLayout';

export const AuthPage = () => {
  return (
    <BaseLayout>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </BaseLayout>
  );
};
