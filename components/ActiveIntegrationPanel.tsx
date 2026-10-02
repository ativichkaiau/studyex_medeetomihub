import { buildModuleGraph } from '../lib/integrations/graphView';
import IntegrationExplorer from './IntegrationExplorer';
import SectionLabel from './ui/SectionLabel';

// Active Integration — treats the module as a node in the knowledge graph and
// shows its prerequisite / forward / peer / clinical / trap / repair links as
// an interactive map (+ list). Server component: the graph is resolved at
// build time and handed to the client explorer as plain, serializable data.

export default function ActiveIntegrationPanel({ moduleId, id, compact = false }: { moduleId: string; id?: string; compact?: boolean }) {
  const view = buildModuleGraph(moduleId);

  return (
    <section className={`doc-section ${compact ? 'mt-10' : 'mt-12'}`} aria-labelledby={id}>
      <SectionLabel id={id} toc={id ? 'integrations' : undefined} meta={view.hasAny ? `${view.edgeCount} links · knowledge graph` : 'knowledge graph'}>
        integrations
      </SectionLabel>
      {view.hasAny ? (
        <IntegrationExplorer view={view} />
      ) : (
        <p className="font-mono text-[12px] text-fg-3">∅ no integrations mapped yet — links appear as related content is added.</p>
      )}
    </section>
  );
}
