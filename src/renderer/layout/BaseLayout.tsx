import { useState } from 'react';
import { useAuth } from 'renderer/providers/AuthProvider';
import { AppHeader, AppHeaderProps } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { Page, PageProps } from './Page';

export type BaseLayoutProps = AppHeaderProps & PageProps;

export const BaseLayout = ({
  headerRightMenu,
  ...pageProps
}: BaseLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-y-auto">
      <AppHeader headerRightMenu={headerRightMenu} />
      {isLoggedIn && (
        <div className="fixed top-12 h-full px-2 py-4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          <AppSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
      )}

      <Page {...pageProps} isSidebarOpen={isSidebarOpen} />
    </div>
  );
};
