'use client';

import { useState } from 'react';
import type { QuizQuestion } from '../lib/types';
import { recordQuizAnswer } from '../lib/user/activity';
import { logActivity } from '../lib/user/eventLog';
import { pad2 } from '../lib/paths';

function QuizItem({ q, moduleId, n }: { q: QuizQuestion; moduleId?: string; n: number }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;

  const choose = (id: string) => {
    setChosen(id);
    if (moduleId) {
      recordQuizAnswer(moduleId, q.id, id === q.answerId);
      logActivity({ type: 'recall.answer', ref: moduleId, n: 1, ok: id === q.answerId ? 1 : 0 });
    }
  };

  return (
    <div className="quiz-item panel p-4">
      <p className="label mb-2">Q{pad2(n)}</p>
      <p className="text-[15px] font-medium leading-relaxed text-fg">{q.stem}</p>
      <div className="mt-3">
        {q.options.map((o) => {
          const isCorrect = o.id === q.answerId;
          const isChosen = o.id === chosen;
          const state = !answered ? undefined : isCorrect ? 'correct' : isChosen ? 'wrong' : 'dim';
          return (
            <button key={o.id} type="button" disabled={answered} onClick={() => choose(o.id)} className="opt" data-state={state}>
              <span className="opt-key">{o.id}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="verdict reveal-in" data-ok={chosen === q.answerId}>
          <span className="verdict-key">{chosen === q.answerId ? 'correct' : 'incorrect'}</span>
          {q.explanation}
        </p>
      )}
    </div>
  );
}

export default function Quiz({ questions, moduleId }: { questions: QuizQuestion[]; moduleId?: string }) {
  return (
    <div className="quiz-list grid gap-3">
      {questions.map((q, i) => (
        <QuizItem key={q.id} q={q} moduleId={moduleId} n={i + 1} />
      ))}
    </div>
  );
}
