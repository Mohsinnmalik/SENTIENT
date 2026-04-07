import mongoose, { Schema, Document, Model } from "mongoose";

// --- PRODUCT ---
export interface IProduct extends Document {
  name: string;
  type: string;
  description: string;
  reviewFocus: string[];
  targetAudience: string;
  buyerCriteria: string;
  investorCriteria: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  reviewFocus: { type: [String], default: [] },
  targetAudience: { type: String },
  buyerCriteria: { type: String },
  investorCriteria: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// --- TOOLKIT ---
export interface IToolkit extends Document {
  productId: mongoose.Types.ObjectId;
  reviewQuestions: string[];
  qualifierQuestions: string[];
  scoringCriteria: string;
  createdAt: Date;
}

const ToolkitSchema = new Schema<IToolkit>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  reviewQuestions: { type: [String], default: [] },
  qualifierQuestions: { type: [String], default: [] },
  scoringCriteria: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// --- SESSION ---
export interface ISession extends Document {
  productId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  status: "active" | "completed";
}

const SessionSchema = new Schema<ISession>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ["active", "completed"], default: "active" },
});

// --- ANSWER ---
export interface IAnswer extends Document {
  sessionId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  score: number;
  signal: string;
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  score: { type: Number, default: 0 },
  signal: { type: String, default: "Neutral" },
  createdAt: { type: Date, default: Date.now },
});

// Avoid model recompilation errors in Next.js dev environment
const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
const Toolkit = mongoose.models.Toolkit || mongoose.model<IToolkit>("Toolkit", ToolkitSchema);
const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
const Answer = mongoose.models.Answer || mongoose.model<IAnswer>("Answer", AnswerSchema);

// --- SESSION REPORT ---
export interface ISessionReport extends Document {
  sessionId: mongoose.Types.ObjectId;
  transcript: string;
  behaviourEvents: string[];
  behaviourScore: number;
  verbalScore: number;
  overallScore: number;
  visitorType: "Buyer" | "Interested" | "Browsing";
  summary: string;
  keywords: string[];
  interactionDuration: number;
  createdAt: Date;
}

const SessionReportSchema = new Schema<ISessionReport>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  transcript: { type: String, default: "" },
  behaviourEvents: { type: [String], default: [] },
  behaviourScore: { type: Number, default: 0 },
  verbalScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  visitorType: { type: String, enum: ["Buyer", "Interested", "Browsing"], default: "Browsing" },
  summary: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  interactionDuration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const SessionReport = mongoose.models.SessionReport || mongoose.model<ISessionReport>("SessionReport", SessionReportSchema);

export { Product, Toolkit, Session, Answer, SessionReport };
