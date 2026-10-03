import { lectures, lecturesBySubject, subjectByCode, subjectOfSource } from '../../../content';
import { getModuleBank } from '../../../lib/questions/bank';
import type { QuestionBank } from '../../../lib/questions/types';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'public, max-age=3600, s-maxage=3600',
};

function normalizeSubject(value: string | null): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized ? normalized : null;
}

function buildBank(subjectFilter: string | null): { bank: QuestionBank; modules: number; count: number } {
  const bank: QuestionBank = {};
  let count = 0;

  for (const lecture of lectures) {
    const subject = subjectOfSource[lecture.source] ?? null;
    if (subjectFilter && subject !== subjectFilter) continue;
    const questions = getModuleBank(lecture.id);
    if (questions.length === 0) continue;
    bank[lecture.id] = questions;
    count += questions.length;
  }

  return { bank, modules: Object.keys(bank).length, count };
}

function subjectSummaries() {
  return Object.entries(lecturesBySubject)
    .map(([code, modules]) => {
      const questions = modules.reduce((sum, lecture) => sum + getModuleBank(lecture.id).length, 0);
      return {
        code,
        name: subjectByCode[code]?.name ?? code,
        year: subjectByCode[code]?.year ?? null,
        modules: modules.length,
        questions,
      };
    })
    .filter((subject) => subject.questions > 0)
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.code.localeCompare(b.code));
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const subject = normalizeSubject(url.searchParams.get('subject'));
  const summaryOnly = ['1', 'true', 'yes'].includes((url.searchParams.get('summary') ?? '').toLowerCase());
  const subjects = subjectSummaries();

  if (summaryOnly) {
    return Response.json(
      {
        version: '1.0',
        source: 'studyex_medeetomihub',
        generatedAt: new Date().toISOString(),
        subjects,
      },
      { headers: CORS_HEADERS },
    );
  }

  if (subject && !lecturesBySubject[subject]) {
    return Response.json(
      {
        ok: false,
        error: `Unknown subject: ${subject}`,
        subjects,
      },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const payload = buildBank(subject);
  return Response.json(
    {
      version: '1.0',
      source: 'studyex_medeetomihub',
      generatedAt: new Date().toISOString(),
      subject,
      subjects,
      modules: payload.modules,
      count: payload.count,
      bank: payload.bank,
    },
    { headers: CORS_HEADERS },
  );
}
