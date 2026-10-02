import { lectureById } from '../../../content';
import { stripMarkup } from '../../../lib/concept/modes';
import type { Lecture } from '../../../lib/types';

// Server-side "Ask AI" study tutor. The OpenAI key stays on the server
// (process.env.OPENAI_API_KEY — the same key the content generators use); the
// browser only talks to /api/ask. When the user is on a lecture page the client
// passes moduleId, and we ground the answer in that module's content.
//
// NOTE: on the deployed app (Vercel) OPENAI_API_KEY must be set in the project's
// Environment Variables — .env.local is git-ignored and never deployed.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // allow time for a streamed answer (Vercel clamps to the plan max)

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function err(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Compact, plain-text context from a module (bounded so prompts stay small). */
function moduleContext(l: Lecture): string {
  const parts: string[] = [`MODULE: ${l.title} (${l.source})`];
  if (l.highYield?.length) parts.push('High-yield:\n' + l.highYield.map((h) => `- ${stripMarkup(h)}`).join('\n'));
  if (l.examFindings?.length)
    parts.push('Key findings:\n' + l.examFindings.map((f) => `- ${f.sign} — ${f.mechanism}`).join('\n'));
  if (l.investigations?.length)
    parts.push('Investigations:\n' + l.investigations.map((iv) => `- ${iv.clue} → ${iv.meaning}`).join('\n'));
  if (l.treatment?.length)
    parts.push('Management:\n' + l.treatment.map((t) => `- ${t.logic}${t.detail ? `: ${stripMarkup(t.detail)}` : ''}`).join('\n'));
  return parts.join('\n\n').slice(0, 4000);
}

const BASE_SYSTEM =
  'You are the study tutor inside studyex_medeetomihub, a revision app for a Thai (CMU) medical student. ' +
  'Answer clearly and concisely at the level of a strong Year-3 student preparing for exams. ' +
  'Lead with the key point, use short paragraphs and **bold** for the terms that matter, and prefer ' +
  'exam-relevant discriminators, red flags, and mechanisms over exhaustive detail. Use plain ASCII and ' +
  '**bold** only (no headers, tables, or other markdown). If you are unsure or a question is outside ' +
  'medicine, say so briefly. This is educational revision support, not individual patient advice.';

export async function POST(req: Request) {
  try {
    // Strip stray whitespace / non-ASCII (e.g. a U+2028 line separator that can
    // sneak in when a key is pasted into a dashboard) — an HTTP header value must
    // be Latin-1, so any character > 255 makes fetch throw before it even sends.
    const key = (process.env.OPENAI_API_KEY ?? '').replace(/[^\x21-\x7e]/g, '');
    if (!key) {
      return err(
        'The AI tutor is not configured — set OPENAI_API_KEY in the deployment environment (Vercel → Project Settings → Environment Variables).',
        503,
      );
    }

    let body: { messages?: ChatMessage[]; moduleId?: string };
    try {
      body = await req.json();
    } catch {
      return err('Invalid request body.', 400);
    }

    const history = (body.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12);
    if (history.length === 0) return err('No message provided.', 400);

    const module = body.moduleId ? lectureById[body.moduleId] : undefined;
    const system = module
      ? `${BASE_SYSTEM}\n\nThe student is currently studying this module — ground your answer in it and reference its content when relevant:\n\n${moduleContext(module)}`
      : BASE_SYSTEM;

    let upstream: Response;
    try {
      upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.ASK_AI_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          stream: true,
          temperature: 0.3,
          max_tokens: 900,
          messages: [{ role: 'system', content: system }, ...history],
        }),
      });
    } catch (e) {
      return err(`Could not reach the AI service: ${(e as Error).message}`, 502);
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      return err(`AI service error (${upstream.status}). ${detail.slice(0, 300)}`.trim(), 502);
    }

    // Transform OpenAI's SSE into a plain-text token stream for the client.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const delta = JSON.parse(data).choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                /* ignore keep-alives / partial frames */
              }
            }
          }
          controller.close();
        } catch (e) {
          try {
            controller.enqueue(encoder.encode(`\n\n[stream error: ${(e as Error).message}]`));
          } catch {
            /* controller already closed */
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    return err(`Ask AI failed: ${(e as Error).message}`, 500);
  }
}
