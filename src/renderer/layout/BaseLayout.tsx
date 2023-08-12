import { AppHeader, AppHeaderProps } from './AppHeader';
import { Page, PageProps } from './Page';

export type BaseLayoutProps = AppHeaderProps & PageProps;

export const BaseLayout = ({
  headerRightMenu,
  ...pageProps
}: BaseLayoutProps) => {
  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 dark:bg-gray-900">
      <AppHeader headerRightMenu={headerRightMenu} />
      <Page {...pageProps} />
    </div>
  );
};
