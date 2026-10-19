import { NotFoundScreen } from '../features/not-found-screen/not-found-screen';
import { notFoundScreenData } from '../features/not-found-screen/not-found-screen.data';

export const metadata = { title: notFoundScreenData.documentTitle };

export default function NotFound() {
  return <NotFoundScreen />;
}
