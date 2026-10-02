import { lecturesBySubject, subjectByCode, subjectSlug } from '../../content';
import { keystonesForSubject } from '../../lib/integrations/centrality';
import ProgressTelemetry, { type SubjectMeta } from '../../components/ProgressTelemetry';
import Page from '../../components/ui/Page';
import PageHeader from '../../components/ui/PageHeader';
import { pageMeta } from '../../lib/meta';

export const metadata = pageMeta({
  title: 'progress',
  description: 'Coverage, quiz accuracy, repairs and an activity log, read from this device only.',
  path: '/progress',
});

export default function ProgressPage() {
  const subjects: SubjectMeta[] = Object.entries(lecturesBySubject)
    .map(([code, mods]) => {
      const s = subjectByCode[code];
      return {
        code,
        name: s?.name ?? code,
        slug: subjectSlug(code),
        year: s?.year ?? 0,
        total: mods.length,
        keystones: keystonesForSubject(code, 3).map((k) => ({ id: k.id, title: k.title })),
      };
    })
    .sort((a, b) => a.year - b.year || a.code.localeCompare(b.code));

  return (
    <Page crumbs={[{ label: 'progress' }]} aside={<span>source: this device</span>}>
      <PageHeader
        kicker={
          <>
            <strong>progress</strong>
            <span>telemetry</span>
          </>
        }
        title="Progress"
        lede="Coverage, accuracy, repairs and the activity log — read from this device only. Nothing here is estimated; a number exists because you did the thing."
      />
      <ProgressTelemetry subjects={subjects} />
    </Page>
  );
}
