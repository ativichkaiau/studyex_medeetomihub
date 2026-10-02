import LoadingView from '../../../../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'practice', href: '/practice' }, { label: '…' }]} label="preparing session…" shape="session" width="w-doc" />;
}
