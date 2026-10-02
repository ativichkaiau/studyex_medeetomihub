import Page from '../components/ui/Page';
import NotFoundBody from '../components/NotFoundBody';

export const metadata = { title: 'not found' };

export default function NotFound() {
  return (
    <Page crumbs={[{ label: '404' }]} width="w-doc">
      <NotFoundBody />
    </Page>
  );
}
