// Analysis Engine for SENTIENT Interaction Intelligence

const POSITIVE_WORDS = [
  "love","great","amazing","excellent","good","nice","perfect","fantastic",
  "awesome","like","interesting","impressed","smooth","fast","beautiful",
  "want","definitely","innovative","premium","quality","value","impressive",
  "intuitive","clean","modern","sleek","efficient","powerful","comfortable",
  "responsive","reliable","recommend","brilliant","outstanding"
];
const NEGATIVE_WORDS = [
  "bad","poor","hate","dislike","slow","expensive","cheap","broken","issue",
  "problem","disappointing","average","mediocre","boring","complicated",
  "confusing","not","never","difficult","heavy","ugly","frustrating",
  "inconsistent","fragile","overpriced","clunky","laggy","outdated"
];
const BUYING_SIGNALS = [
  "how much","price","cost","buy","purchase","where can","when","order",
  "available","recommend","gift","take it","worth it","compared to",
  "better than","can i get","i want","i need","how do i buy","is it available",
  "what's the price","would buy","planning to","thinking of buying"
];

// No simulated transcripts in production.

export interface AnalysisResult {
  verbalScore: number;
  positiveSignals: string[];
  negativeSignals: string[];
  buyingSignals: string[];
  visitorType: "Buyer" | "Interested" | "Browsing";
  summary: string;
  keywords: string[];
  overallScore: number;
  confidenceLevel: "High" | "Medium" | "Low";
  keySignals: string[];
}

export function analyzeTranscript(
  transcript: string,
  behaviourScore: number,
  behaviourEvents: string[],
  interactionDuration: number = 0
): AnalysisResult {
  const lower = transcript.toLowerCase();
  
  const isSilent = lower.includes("remained silent") || transcript.trim() === "";

  if (isSilent && behaviourScore <= 2 && behaviourEvents.length <= 1) {
    return {
      verbalScore: 0,
      positiveSignals: [], negativeSignals: [], buyingSignals: [],
      visitorType: "Browsing",
      summary: "Insufficient data to determine user intent.",
      keywords: [],
      overallScore: 0,
      confidenceLevel: "Low",
      keySignals: ["No face detected", "No audio detected", "No interaction detected"]
    };
  }

  const positiveFound = POSITIVE_WORDS.filter(w => !isSilent && lower.includes(w));
  const negativeFound  = NEGATIVE_WORDS.filter(w => !isSilent && lower.includes(w));
  const buyingFound    = BUYING_SIGNALS.filter(s => !isSilent && lower.includes(s));

  // Verbal scoring with buying signal boost
  let verbalScore = isSilent ? 0 : 5;
  if (!isSilent) {
    verbalScore += positiveFound.length * 0.8;
    verbalScore -= negativeFound.length * 0.6;
    verbalScore += buyingFound.length * 1.2;
  }
  verbalScore = Math.max(0, Math.min(10, verbalScore));

  // Composite score: 45% verbal + 55% behaviour
  const overallScore = Math.max(1, Math.min(10,
    (verbalScore * 0.45) + (behaviourScore * 0.55)
  ));

  // Classification thresholds
  let visitorType: "Buyer" | "Interested" | "Browsing" = "Browsing";
  if (overallScore >= 7 || buyingFound.length >= 2) visitorType = "Buyer";
  else if (overallScore >= 4.5) visitorType = "Interested";

  // Confidence & Key Signals
  let confidenceLevel: "High" | "Medium" | "Low" = "Medium";
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  if (interactionDuration > 30 && wordCount > 15 && behaviourEvents.length > 5) confidenceLevel = "High";
  else if (interactionDuration < 10 || wordCount < 5) confidenceLevel = "Low";

  const keySignals: string[] = [];
  if (behaviourScore >= 7.5) keySignals.push("Sustained high engagement observed");
  else if (behaviourScore <= 4.0) keySignals.push("Low interaction continuity");
  
  if (positiveFound.length >= 2) keySignals.push("Expressed positive features preference");
  if (buyingFound.length >= 1) keySignals.push("Explicit conversion intent detected");
  if (negativeFound.length > 0) keySignals.push("Identified potential friction points");
  if (keySignals.length === 0) keySignals.push("Standard exploration pattern");

  const summary = buildSummary(
    transcript, positiveFound, negativeFound, buyingFound, visitorType, behaviourScore, behaviourEvents, confidenceLevel
  );
  const keywords = [...new Set([...positiveFound.slice(0, 3), ...buyingFound.slice(0, 2)])];

  return {
    verbalScore: Math.round(verbalScore * 10) / 10,
    positiveSignals: positiveFound,
    negativeSignals: negativeFound,
    buyingSignals: buyingFound,
    visitorType,
    summary,
    keywords,
    overallScore: Math.round(overallScore * 10) / 10,
    confidenceLevel,
    keySignals: keySignals.slice(0, 3)
  };
}

function buildSummary(
  transcript: string,
  pos: string[],
  neg: string[],
  buying: string[],
  visitorType: string,
  bScore: number,
  events: string[],
  conf: string
): string {
  if (transcript.includes("remained silent") || transcript.trim().length < 10) {
    if (bScore <= 2) return "Insufficient data to determine user intent.";
    if (visitorType === "Buyer") return "User maintained exceptional attention velocity, actively tracing core functionalities while generating high-assurance purchase indicators throughout the session timeline.";
    if (visitorType === "Interested") return "User exhibited sustained thematic engagement, analyzing key product offerings with measurable curiosity and stable interaction depth.";
    return "User engaged in rudimentary visual mapping, resulting in baseline exploratory trajectories with minimal conversion markers detected.";
  }

  const parts: string[] = [];

  if (visitorType === "Buyer") parts.push(`Subject demonstrated definitive conversion readiness, projecting high-intent behavioural stability.`);
  else if (visitorType === "Interested") parts.push(`Subject generated sustained discovery momentum, validating partial adoption potential.`);
  else parts.push(`Subject remained in preliminary qualification loops, with low-velocity engagement signals.`);

  if (pos.length >= 2) {
    parts.push(`Verbal payload indicates accelerated sentiment optimization, particularly indexing around "${pos[0]}" and "${pos[1]}" attributes.`);
  } else if (pos.length === 1) {
    parts.push(`Positive thematic correlation noted towards "${pos[0]}" specifications.`);
  }

  if (buying.length > 0) {
    parts.push(`Critical transaction-oriented vocabulary recorded (e.g., "${buying[0]}"), reinforcing the overarching buy-side intent.`);
  }

  if (neg.length > 0) {
    parts.push(`Friction vectors detected related to "${neg[0]}"; recommend targeted mitigation protocols.`);
  }

  if (bScore > 7.5) {
    parts.push(`Optical telemetry verifies elite kinetic immersion and fluid UX interfacing.`);
  } else if (bScore > 4) {
    parts.push(`Aggregate optical metrics fall within nominal median bands.`);
  } else {
    parts.push(`Vision nodes flagged sparse interaction events, risking attention drop-off.`);
  }

  parts.push(`[System Confidence: ${conf}]`);
  return parts.join(" ");
}

export function calculateSentiment(transcript: string): number {
  const lower = transcript.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => {
    if (lower.includes(w)) score += 1;
  });
  NEGATIVE_WORDS.forEach(w => {
    if (lower.includes(w)) score -= 1;
  });
  return score;
}

