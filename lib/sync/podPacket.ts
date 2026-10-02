// Shape of the WilliamsPod /api/sync/export response (the subset studyex_medeetomihub
// consumes to build repair items). Mirrors WilliamsPod's lib/sync/types.ts.

export interface PodRepairRecommendation {
  lectureId: string | null;
  subject: string | null;
  errorType: string; // one of the 8 ErrorType strings (shared with the Hub)
  priority: 'low' | 'medium' | 'high';
  recommendedAction: string;
  sourceQuestionId: string;
}

export interface PodTelemetryPacket {
  version: string;
  source: 'williamspod';
  userId: string | null;
  attemptId: string;
  createdAt: string;
  repairRecommendations: PodRepairRecommendation[];
  // packet also carries telemetry/mistakes/performance — not needed for the queue
}

export interface PodExportResponse {
  version: string;
  source: 'williamspod';
  generatedAt: string;
  packets: PodTelemetryPacket[];
}
