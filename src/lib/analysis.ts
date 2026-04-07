// Analysis Engine for SENTIENT Interaction Intelligence

const POSITIVE_WORDS = ["love","great","amazing","excellent","good","nice","perfect","fantastic","awesome","like","interesting","impressed","smooth","fast","beautiful","want","definitely","innovative","premium","quality","value","impressive","intuitive"];
const NEGATIVE_WORDS = ["bad","poor","hate","dislike","slow","expensive","cheap","broken","issue","problem","disappointing","average","mediocre","boring","complicated","confusing","not","never","difficult","heavy"];
const BUYING_SIGNALS = ["how much","price","cost","buy","purchase","where can","when","order","available","recommend","gift","take it","worth it","compared to","better than"];
const DEMO_TRANSCRIPTS = [
  "I really like the design and the screen quality is impressive. The camera features are much better than I expected. I'm curious about the battery life. Overall I'm quite interested in this product.",
  "The build quality feels premium. How much does it cost? I was comparing this with other products and this one stands out. I would definitely recommend this to my friends.",
  "It looks good but I'm not sure about the price point. The features seem decent. Battery life is okay. I might consider it if the price is right."
];

export interface AnalysisResult {
  verbalScore: number;
  positiveSignals: string[];
  negativeSignals: string[];
  buyingSignals: string[];
  visitorType: "Buyer" | "Interested" | "Browsing";
  summary: string;
  keywords: string[];
  overallScore: number;
}

export function analyzeTranscript(transcript: string, behaviourScore: number, behaviourEvents: string[]): AnalysisResult {
  const lower = transcript.toLowerCase();

  const positiveFound = POSITIVE_WORDS.filter(w => lower.includes(w));
  const negativeFound  = NEGATIVE_WORDS.filter(w => lower.includes(w));
  const buyingFound    = BUYING_SIGNALS.filter(s => lower.includes(s));

  let verbalScore = 5;
  verbalScore += positiveFound.length * 0.8;
  verbalScore -= negativeFound.length * 0.6;
  verbalScore += buyingFound.length * 1.2;
  verbalScore = Math.max(1, Math.min(10, verbalScore));

  const overallScore = Math.max(1, Math.min(10, (verbalScore * 0.45) + (behaviourScore * 0.55)));

  let visitorType: "Buyer" | "Interested" | "Browsing" = "Browsing";
  if (overallScore >= 7 || buyingFound.length >= 2) visitorType = "Buyer";
  else if (overallScore >= 4.5) visitorType = "Interested";

  const summary = buildSummary(transcript, positiveFound, negativeFound, buyingFound, visitorType, behaviourScore);
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
  };
}

function buildSummary(transcript: string, pos: string[], neg: string[], buying: string[], visitorType: string, bScore: number): string {
  if (!transcript || transcript.trim().length < 10) {
    return {
      Buyer:       "User showed strong purchase intent, maintaining high engagement and actively exploring product features throughout the session.",
      Interested:  "User demonstrated genuine interest in the product, engaging with key features and asking relevant questions.",
      Browsing:    "User browsed through the product features. Some interest noted but further engagement may be needed.",
    }[visitorType] || "";
  }
  const parts: string[] = [];
  if (pos.length > 1)    parts.push(`User expressed positive sentiment, highlighting ${pos.slice(0,2).join(" and ")} aspects.`);
  if (buying.length > 0) parts.push(`Clear purchasing intent detected — user enquired about ${buying.slice(0,2).join(" and ")}.`);
  if (neg.length > 1)    parts.push(`Some concerns raised around ${neg.slice(0,2).join(" and ")}.`);
  if (bScore > 7)        parts.push("Behaviour tracking confirmed high engagement and active exploration.");
  else if (bScore > 4)   parts.push("Moderate behavioural engagement observed.");
  return parts.length ? parts.join(" ") : "Session completed with standard interaction patterns detected.";
}

export function getSimulatedTranscript(): string {
  return DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];
}
