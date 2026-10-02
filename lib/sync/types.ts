// WilliamsSync — the contract by which WilliamsPod telemetry reaches the Hub (studyex_medeetomihub).
// Types only; the client ingestion service is in williamsSync.ts and the (future)
// server endpoint is app/api/williamssync/route.ts. Kept intentionally small.

import type { ErrorType, RepairPriority } from '../repair/types';

/** One answered question from a WilliamsPod session. */
export interface PodQuestionResult {
  question_id: string;
  module_id: string;
  lecture_id: string;
  subject_id: string;
  correct: boolean;
  error_type?: ErrorType; // present when incorrect
  time_ms?: number;
  confidence?: number; // 0..1 self-rated
}

/** A batch of results from one Pod session. */
export interface PodTelemetryPayload {
  user_id: string;
  session_id: string;
  generated_at: string; // ISO
  results: PodQuestionResult[];
}

/** A mistake already classified by the Pod (bypasses raw telemetry). */
export interface MistakeClassification {
  question_id: string;
  module_id: string;
  lecture_id: string;
  subject_id: string;
  error_type: ErrorType;
  note?: string;
}

/** A ready-made repair recommendation pushed from the Pod. */
export interface RepairRecommendationPayload {
  module_id: string;
  lecture_id: string;
  subject_id: string;
  error_type: ErrorType;
  recommended_action?: string;
  source_question_id?: string;
  priority?: RepairPriority;
}

/** Aggregate performance per module (for trends / weak-module surfacing). */
export interface QuestionPerformanceSummary {
  module_id: string;
  attempts: number;
  correct: number;
  accuracy: number; // 0..1
  common_error_type?: ErrorType;
}

/** The tagged envelope WilliamsSync accepts (client service + future API route). */
export type WilliamsSyncEnvelope =
  | { kind: 'telemetry'; payload: PodTelemetryPayload }
  | { kind: 'mistakes'; payload: MistakeClassification[] }
  | { kind: 'repairs'; payload: RepairRecommendationPayload[] }
  | { kind: 'performance'; payload: QuestionPerformanceSummary[] };

/** Result of an ingestion call. */
export interface WilliamsSyncResult {
  ok: boolean;
  kind: WilliamsSyncEnvelope['kind'];
  queued: number; // repair items created
  note?: string;
}
