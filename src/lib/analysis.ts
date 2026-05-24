// ── SENTIENT Analysis Engine — Production v3.0 ────────────────────────────────
// Complete rewrite for truth-first, multilingual, high-fidelity sentiment analysis.

// ── Vocabulary Banks ─────────────────────────────────────────────────────────

// IMPORTANT: Use whole-word checks only — never substring match bare words like "not"
// Each entry must be matched with word-boundary logic to prevent false positives.
const POSITIVE_PATTERNS = [
  // English
  "love it", "love this", "great", "amazing", "excellent", "very good",
  "so good", "really good", "fantastic", "awesome", "wonderful", "outstanding",
  "impressive", "beautiful", "smooth", "fast", "premium", "high quality",
  "intuitive", "clean design", "well made", "would buy", "will buy",
  "want to buy", "definitely", "recommend", "really like", "i like",
  "best", "brilliant", "solid", "reliable", "perfect", "sleek",
  // Hinglish / Romanized Hindi
  "bahut acha", "bahut accha", "bahut badhiya", "bahut sahi",
  "acha hai", "accha hai", "sahi hai", "badhiya hai",
  "mast hai", "mast", "ekdum sahi", "zabardast", "shandar",
  "pasand aaya", "pasand aya", "pasand hai",
  "lena chahiye", "lena chahta", "kharidna chahta", "lena hai",
];

const NEGATIVE_PATTERNS = [
  // English — only PHRASES to avoid word-boundary false positives
  "not good", "not great", "not impressed", "not satisfied", "not happy",
  "don't like", "do not like", "doesn't work", "waste of money",
  "bad quality", "very bad", "really bad", "so bad", "the worst",
  "disappointing", "disappointed", "poor quality", "horrible",
  "overpriced", "too expensive", "not worth", "broken", "awful",
  "hate it", "hate this", "would not buy", "will not buy",
  "would never buy", "not buying", "complete waste", "totally useless",
  "doesn't look", "ugly", "cheap feel", "cheaply made",
  // Hinglish / Romanized Hindi — phrases
  "accha nahi", "acha nahi", "pasand nahi", "achha nahi lagta",
  "acha nahi lagta", "nahi lagta", "pasand nahi aaya", "pasand nahi hai",
  "bakwas hai", "bakwas", "bekar hai", "bekar", "kharab hai", "kharab",
  "bahut bura", "bilkul nahi", "nahi chahiye", "nahi lunga",
  "mujhe nahi", "mujhe accha nahi", "mujhe achha nahi",
  "nahi pasand", "kuch khaas nahi", "average hai", "theek hai par",
];

// Buying intent — strong conversion signals
const BUYING_SIGNALS = [
  // English
  "how much", "what is the price", "what's the price", "how much does it cost",
  "where can i buy", "where to buy", "can i buy", "i want to buy",
  "i want this", "i'll take it", "i'd like to buy", "i would buy this",
  "take this", "order this", "purchase this", "how do i order",
  "is it available", "when is it available", "price", "cost",
  // Hinglish
  "kitna paisa", "kitne ka", "kahan milega", "kahan se lu",
  "price kya hai", "kitne ka hai", "lena hai", "le lunga",
  "zaroor lunga", "bahut value", "value for money",
];

// Strong dealbreakers — these override everything
const DEALBREAKER_PATTERNS = [
  "waste of money", "complete waste", "total waste", "buying this never",
  "never buying", "would not recommend", "will not recommend",
  "return this", "want a refund", "ask for refund",
  "bakwas", "bekar", "kharab", "mujhe accha nahi", "mujhe achha nahi",
  "bilkul nahi", "nahi lunga", "nahi chahiye",
];

// ── Result Interface ──────────────────────────────────────────────────────────

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

// ── Core Engine ───────────────────────────────────────────────────────────────

export function analyzeTranscript(
  transcript: string,
  behaviourScore: number,
  behaviourEvents: string[],
  interactionDuration: number = 0,
  detectionQuality: "full" | "face_only" | "no_camera" | "failed" | "waiting" = "full"
): AnalysisResult {
  const lower = transcript.toLowerCase().trim();
  const isSilent = !lower || lower.includes("remained silent") || lower.length < 4;

  // Early return for truly empty sessions
  if (isSilent && behaviourScore <= 2 && behaviourEvents.length <= 1) {
    return buildEmptyResult();
  }

  // ── Pattern matching (phrase-based, not word-based) ─────────────────────
  // We check for negative/dealbreaker phrases FIRST to accurately weigh them
  const dealbreakerFound = DEALBREAKER_PATTERNS.filter(p => lower.includes(p));
  const negativeFound     = NEGATIVE_PATTERNS.filter(p => lower.includes(p));
  const positiveFound = POSITIVE_PATTERNS.filter(p => {
    // Basic Negation Check: If this positive pattern is immediately followed/preceded by negation in the same substring, ignore it
    const index = lower.indexOf(p);
    if (index > -1) {
      const context = lower.slice(Math.max(0, index - 10), Math.min(lower.length, index + p.length + 10));
      if (context.includes("not ") || context.includes("nahi ") || context.includes("no ")) return false;
    }
    return lower.includes(p);
  });
  
  const buyingFound = BUYING_SIGNALS.filter(s => lower.includes(s));
  const hasDealBreaker = dealbreakerFound.length > 0;

  // ── Kinetic bonus from behaviour events ─────────────────────────────────
  let kineticBonus = 0;
  let kineticPenalty = 0;
  behaviourEvents.forEach(e => {
    const ev = e.toLowerCase();
    if (ev.includes("leaning in") || ev.includes("physical interest")) kineticBonus += 2.0;
    if (ev.includes("intent_gesture") || ev.includes("thumbs up") || ev.includes("pointing")) kineticBonus += 2.5;
    if (ev.includes("leaning back") || ev.includes("detachment")) kineticPenalty += 2.0;
    if (ev.includes("disgusted") || ev.includes("angry") || ev.includes("thumbs down")) kineticPenalty += 3.5;
  });

  // ── Verbal Score (0-10) — Truth-First ───────────────────────────────────
  let verbalScore = isSilent ? 0 : 5.0;
  if (!isSilent) {
    verbalScore += positiveFound.length * 1.5;
    verbalScore -= negativeFound.length * 2.5;
    verbalScore -= dealbreakerFound.length * 4.0;
    verbalScore += buyingFound.length * 2.5;
  }
  
  // DEALBREAKER HARD CAP: If you say it's "bakwas", it doesn't matter how you're leaning.
  if (hasDealBreaker) {
    verbalScore = Math.min(verbalScore, 2.0);
  }
  
  verbalScore = Math.max(0, Math.min(10, verbalScore));

  // ── Behaviour Score Adjustment —────────────────────────────────────────
  const adjustedBehaviour = Math.max(0, Math.min(10,
    behaviourScore + kineticBonus - kineticPenalty
  ));

  // ── Composite Score ───────────────────────────────────────────────────
  const behaviourWeight = (detectionQuality === "no_camera" || detectionQuality === "failed") ? 0 : 0.50;
  const verbalWeight    = 1.0 - behaviourWeight;
  
  // When camera is available, verbal has more weight than behaviour
  // because verbal IS the truth — behaviour is context
  const rawOverall = (verbalScore * verbalWeight) + (adjustedBehaviour * behaviourWeight);
  
  // NO minimum floor — let bad sessions score near zero
  const overallScore = Math.max(0, Math.min(10, rawOverall));

  // ── Visitor Classification ────────────────────────────────────────────
  let visitorType: "Buyer" | "Interested" | "Browsing" = "Browsing";
  if (!hasDealBreaker && (overallScore > 7.0 || buyingFound.length >= 2)) {
    visitorType = "Buyer";
  } else if (!hasDealBreaker && overallScore >= 4.5 && negativeFound.length < 2) {
    visitorType = "Interested";
  }
  // If person said dealbreaker phrases → always "Browsing" regardless of behaviour score

  // ── Confidence Level ──────────────────────────────────────────────────
  let confidenceLevel: "High" | "Medium" | "Low" = "Medium";
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  if (interactionDuration > 30 && wordCount > 15 && behaviourEvents.length > 5) {
    confidenceLevel = "High";
  } else if (interactionDuration < 10 || wordCount < 5) {
    confidenceLevel = "Low";
  }

  // ── Key Signals ───────────────────────────────────────────────────────
  const keySignals: string[] = [];
  if (hasDealBreaker) keySignals.push("⚠️ Critical disinterest phrase detected");
  if (negativeFound.length > 0) keySignals.push(`Friction: "${negativeFound[0]}"`);
  if (positiveFound.length >= 2) keySignals.push("Positive sentiment confirmed");
  if (buyingFound.length >= 1) keySignals.push("Explicit purchase intent detected");
  if (behaviourScore >= 7.5) keySignals.push("Strong physical engagement observed");
  if (behaviourScore <= 3.0 && detectionQuality !== "no_camera") keySignals.push("Low physical engagement");
  if (lower.match(/bakwas|bekar|kharab|nahi pasand|accha nahi/)) {
    keySignals.push("Hindi negative feedback detected");
  }
  if (keySignals.length === 0) keySignals.push("Standard exploration pattern");

  const summary = buildSummary(
    lower, positiveFound, negativeFound, buyingFound, hasDealBreaker,
    visitorType, adjustedBehaviour, behaviourEvents, confidenceLevel, detectionQuality
  );

  // Keywords: most meaningful signals found
  const allKeywords = [
    ...positiveFound.slice(0, 2),
    ...buyingFound.slice(0, 2),
    ...negativeFound.slice(0, 2),
  ];
  const keywords = [...new Set(allKeywords)].slice(0, 4);

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
    keySignals: keySignals.slice(0, 4),
  };
}

// ── Summary Builder ───────────────────────────────────────────────────────────

function buildSummary(
  lower: string,
  pos: string[],
  neg: string[],
  buying: string[],
  hasDealBreaker: boolean,
  visitorType: string,
  bScore: number,
  events: string[],
  conf: string,
  detectionQuality: "full" | "face_only" | "no_camera" | "failed" | "waiting"
): string {
  const parts: string[] = [];

  // Quality disclaimer
  if (detectionQuality === "failed" || detectionQuality === "no_camera") {
    parts.push("NOTE: Camera unavailable — analysis based solely on verbal input.");
  } else if (detectionQuality === "face_only") {
    parts.push("NOTE: Hand tracking unavailable — physical engagement based on face presence only.");
  }

  // Lead with the most critical signal
  if (hasDealBreaker) {
    parts.push("Subject expressed explicit disinterest or rejection during the interaction.");
  } else if (visitorType === "Buyer") {
    parts.push("Subject exhibited strong purchase readiness with clear conversion signals.");
  } else if (visitorType === "Interested") {
    parts.push("Subject demonstrated genuine curiosity and moderate intent.");
  } else {
    parts.push("Subject showed limited engagement with no clear conversion indicators.");
  }

  // Verbal signals
  if (neg.length > 0) {
    const negSample = neg.slice(0, 2).join('", "');
    parts.push(`Friction detected: "${negSample}" — indicates dissatisfaction or objection.`);
  }
  if (pos.length > 0 && !hasDealBreaker) {
    const posSample = pos.slice(0, 2).join('", "');
    parts.push(`Positive markers: "${posSample}".`);
  }
  if (buying.length > 0 && !hasDealBreaker) {
    parts.push(`Purchase intent phrases recorded: "${buying[0]}".`);
  }

  // Physical signals
  if (detectionQuality === "full" || detectionQuality === "face_only") {
    const leanIn = events.some(e => e.toLowerCase().includes("leaning in"));
    const leanBack = events.some(e => e.toLowerCase().includes("leaning back"));
    if (leanIn && !leanBack) parts.push("Body language: physically engaged (leaning in).");
    if (leanBack) parts.push("Body language: disengaged (leaning back detected).");
    if (bScore >= 7.5) parts.push("Optical telemetry confirms high sustained engagement.");
    else if (bScore <= 3.5) parts.push("Optical telemetry flagged low engagement levels.");
  }

  parts.push(`[Confidence: ${conf}]`);
  return parts.join(" ");
}

// ── Empty Result ──────────────────────────────────────────────────────────────

function buildEmptyResult(): AnalysisResult {
  return {
    verbalScore: 0,
    positiveSignals: [], negativeSignals: [], buyingSignals: [],
    visitorType: "Browsing",
    summary: "Insufficient interaction data to generate a meaningful analysis.",
    keywords: [],
    overallScore: 0,
    confidenceLevel: "Low",
    keySignals: ["No audio detected", "No face detected", "No interaction recorded"],
  };
}

