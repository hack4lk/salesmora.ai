import { AccountLayout, type AccountLayoutProps } from '@salesmora/ui';
import { ProtectedFooter } from '../../public-site/site-footer/protected-footer';

export function ProtectedAccountLayout(props: Omit<AccountLayoutProps, 'variant' | 'pageFooter'>) {
  return <AccountLayout {...props} pageFooter={<ProtectedFooter />} />;
}
