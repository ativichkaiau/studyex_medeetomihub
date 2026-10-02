import LoadingView from '../../../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'cards', href: '/flashcards' }, { label: '…' }]} label="loading deck…" shape="session" width="w-doc" />;
}
