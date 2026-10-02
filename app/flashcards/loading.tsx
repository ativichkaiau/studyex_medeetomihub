import LoadingView from '../../components/ui/Loading';

export default function Loading() {
  return <LoadingView crumbs={[{ label: 'cards' }]} label="loading decks…" shape="rows" />;
}
