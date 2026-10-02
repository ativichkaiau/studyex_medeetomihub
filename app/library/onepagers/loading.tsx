import LoadingView from '../../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'library', href: '/library' }, { label: 'onepagers' }]} label="fetching archive…" shape="rows" />;
}
