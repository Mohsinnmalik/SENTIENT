import mongoose, { Schema, Document } from "mongoose";

// --- USER ---
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// --- PRODUCT ---
export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
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
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
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
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  reviewQuestions: string[];
  qualifierQuestions: string[];
  scoringCriteria: string;
  createdAt: Date;
}

const ToolkitSchema = new Schema<IToolkit>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  reviewQuestions: { type: [String], default: [] },
  qualifierQuestions: { type: [String], default: [] },
  scoringCriteria: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// --- SESSION ---
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  // FIX 7: status includes ENDING for race-condition-safe shutdown
  status: "active" | "ending" | "completed";
  // FIX 7: flag to completely separate demo data from real analytics
  isDemoSession: boolean;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ["active", "ending", "completed"], default: "active" },
  isDemoSession: { type: Boolean, default: false },
});

// --- ANSWER ---
export interface IAnswer extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  score: number;
  signal: string;
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  score: { type: Number, default: 0 },
  signal: { type: String, default: "Neutral" },
  createdAt: { type: Date, default: Date.now },
});

// Avoid model recompilation errors in Next.js dev environment
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
const Toolkit = mongoose.models.Toolkit || mongoose.model<IToolkit>("Toolkit", ToolkitSchema);
const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
const Answer = mongoose.models.Answer || mongoose.model<IAnswer>("Answer", AnswerSchema);

// --- SESSION REPORT ---
export interface ISessionReport extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  transcript: string;
  behaviourEvents: string[];
  behaviourScore: number;
  verbalScore: number;
  overallScore: number;
  visitorType: "Buyer" | "Interested" | "Browsing";
  summary: string;
  keywords: string[];
  interactionDuration: number;
  isDemo: boolean;
  confidenceLevel: "High" | "Medium" | "Low";
  keySignals: string[];
  // FIX 3: capture how reliable behavioral data was
  detectionQuality: "full" | "face_only" | "no_camera" | "failed";
  // FIX 6: compressed score summary (replaces raw snapshots)
  scoreSummary?: {
    min: number;
    max: number;
    average: number;
    standardDeviation: number;
    expressionFrequency: Record<string, number>;
  };
  createdAt: Date;
}

const SessionReportSchema = new Schema<ISessionReport>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  transcript: { type: String, default: "" },
  behaviourEvents: { type: [String], default: [] },
  behaviourScore: { type: Number, default: 0 },
  verbalScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  visitorType: { type: String, enum: ["Buyer", "Interested", "Browsing"], default: "Browsing" },
  summary: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  interactionDuration: { type: Number, default: 0 },
  isDemo: { type: Boolean, default: false },
  confidenceLevel: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  keySignals: { type: [String], default: [] },
  // FIX 3
  detectionQuality: {
    type: String,
    enum: ["full", "face_only", "no_camera", "failed"],
    default: "full",
  },
  // FIX 6
  scoreSummary: {
    type: new Schema({
      min: Number,
      max: Number,
      average: Number,
      standardDeviation: Number,
      expressionFrequency: { type: Map, of: Number },
    }, { _id: false }),
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

const SessionReport = mongoose.models.SessionReport || mongoose.model<ISessionReport>("SessionReport", SessionReportSchema);

export { User, Product, Toolkit, Session, Answer, SessionReport };
