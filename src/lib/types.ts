// --- Central type definitions for the entire AEGIS app ---

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Category = 'prompt-injection' | 'jailbreak' | 'output-manipulation' | 'eval-gaming' | 'data-exfiltration';
export type TargetType = 'prompt' | 'endpoint';

// Prompt quality assessment (heuristic, no API calls)
export type PromptQuality = 'rich' | 'minimal' | 'not-a-prompt';
export interface PromptQualityInfo {
  quality: PromptQuality;
  charCount: number;
  hasInstructions: boolean;
  warning: string | null;
}

// Input threat classification (LLM-as-judge)
export type ThreatLevel = 'benign' | 'suspicious' | 'malicious';
export interface InputThreatAnalysis {
  threatLevel: ThreatLevel;
  isAttack: boolean;
  categories: string[];
  reasoning: string;
  confidence: number; // 0-100
}

// Combined input analysis
export interface InputAnalysis {
  promptQuality: PromptQualityInfo;
  threatScan: InputThreatAnalysis | null; // null if not run (rich prompt)
}

export interface CheckResult {
  category: Category;
  name: string;
  passed: boolean;
  severity: Severity;
  description: string;
  evidence: string;
  reference: string;
}

// Multi-model support
export type ModelProvider = 'openai' | 'huggingface';

export interface ModelConfig {
  id: string;            // e.g. 'gpt-5-mini', 'meta-llama/Llama-3.1-8B-Instruct'
  name: string;          // Display name
  provider: ModelProvider;
  icon: string;          // Emoji icon
}

export interface ModelResult {
  modelId: string;
  modelName: string;
  provider: ModelProvider;
  overallScore: number;
  results: CheckResult[];
  error?: string;        // If the model failed entirely
}

export interface ScanResult {
  id: string;
  targetType: TargetType;
  targetValue: string;
  overallScore: number;         // Best/primary model score (backward compat)
  categories: Category[];
  results: CheckResult[];       // Primary model results (backward compat)
  modelResults?: ModelResult[]; // Per-model breakdown
  inputAnalysis?: InputAnalysis;
  humanVerified: boolean;
  humanProof?: string;
  verifiedAt?: string;
  createdAt: string;
}

// D1 row shape — maps 1:1 with schema.sql columns
export interface ScanRow {
  id: string;
  target_type: string;
  target_value: string;
  overall_score: number;
  categories: string;        // JSON
  results: string;           // JSON
  model_results: string | null; // JSON
  input_analysis: string | null; // JSON
  human_verified: number;
  human_proof: string | null;
  verified_at: string | null;
  created_at: string;
  ip_hash: string | null;
}

// Cloudflare Worker environment bindings
export type AppBindings = {
  DB: D1Database;
  OPENAI_API_KEY: string;
  HF_TOKEN: string;
};

// Hono Env type — used by the Hono app and all route handlers
export type AppEnv = {
  Bindings: AppBindings;
};
