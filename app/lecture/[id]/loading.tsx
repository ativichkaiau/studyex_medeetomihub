import LoadingView from '../../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'library', href: '/library' }, { label: '…' }]} label="loading module…" shape="doc" width="w-doc" />;
}
