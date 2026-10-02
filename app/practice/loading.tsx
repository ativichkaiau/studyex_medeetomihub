import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'practice' }]} label="loading question bank…" shape="rows" />;
}
