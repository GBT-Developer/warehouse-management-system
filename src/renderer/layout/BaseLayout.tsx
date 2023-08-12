import { AppHeader, AppHeaderProps } from './AppHeader';
import { Page, PageProps } from './Page';

export type BaseLayoutProps = AppHeaderProps & PageProps;

export const BaseLayout = ({
  headerRightMenu,
  ...pageProps
}: BaseLayoutProps) => {
  return (
    <div className="flex flex-col bg-red-300 w-screen h-screen">
      <AppHeader headerRightMenu={headerRightMenu} />
      <Page {...pageProps} />
    </div>
  );
};
