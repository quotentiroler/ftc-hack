# AEGIS — AI Evaluation & Governance Integrity System

> **Hackathon**: Intelligence at the Frontier (Funding the Commons + Protocol Labs)
> **Date**: March 15, 2026
> **Tracks**: 🛡️ AI Safety & Evaluation (Protocol Labs) + 🌸 BONUS: Made by Human (human.tech)
> **Live**: [aegis.maxivities.workers.dev](https://aegis.maxivities.workers.dev/)
> **Repo**: [github.com/quotentiroler/ftc-hack](https://github.com/quotentiroler/ftc-hack)

---

## The Pitch (30 seconds)

AI safety evaluations are only trustworthy if you can prove **who** ran them and that results weren't fabricated by another AI. AEGIS is a reusable AI safety evaluation framework with **human-verified attestations** — every audit is cryptographically tied to a proven human via human.tech's proof-of-personhood protocol.

**"AI safety you can trust, because the humans behind it are verified."**

---

## Target Tracks

- 🛡️ **AI Safety & Evaluation** (Protocol Labs) — summary, github, demo, documentation
- 🌸 **Made by Human** (human.tech) — summary, demo, documentation

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | **Cloudflare Workers** |
| Framework | **Hono + JSX** (server-rendered) |
| Language | **TypeScript** |
| Package manager | **Bun** |
| Database | **Cloudflare D1** (SQLite) |
| Static assets | `public/` dir via Workers Assets |
| Deploy | **Wrangler 4.73** |
| Target Models | **OpenAI GPT-5 Mini** + **HuggingFace** (Llama 3.3 70B, DeepSeek V3.2, Qwen 2.5 72B, Qwen 2.5 Coder 32B) |
| HF SDK | **@huggingface/inference** v4 (`InferenceClient`) |
| Judge Model | **OpenAI GPT-5.4** (LLM-as-Judge for all probe verdicts) |
| Human verification | **human.tech** proof-of-personhood ZK proofs |
| Testing | **Vitest 4.1** — 40 tests (27 unit + 13 integration) |

---

## Project Structure

```
src/
├── index.tsx              # Hono app + all routes + API endpoints
├── pages/
│   ├── home.tsx           # Landing — stats, value props, CTA
│   ├── scan.tsx           # Run safety scan — model/category selection
│   ├── report.tsx         # Per-model scorecard, evidence, findings
│   ├── verify.tsx         # Human attestation via human.tech ZK proof
│   ├── dashboard.tsx      # All scans — per-model scores, filters
│   └── about.tsx          # Methodology, architecture, tech stack
├── components/
│   ├── layout.tsx         # Shared <html> shell, nav, footer
│   ├── nav.tsx            # Navigation bar
│   ├── scan-form.tsx      # Prompt input + model/category checkboxes
│   ├── score-badge.tsx    # Score ring, PASS/FAIL badges, severity
│   └── human-badge.tsx    # "Verified by Human" attestation badge
├── lib/
│   ├── safety-checks.ts   # Core: multi-provider probes, judge, orchestrator
│   ├── scoring.ts         # Risk scoring (0-100, weighted categories)
│   ├── human-verify.ts    # human.tech integration (ZK proof verification)
│   ├── types.ts           # Shared TypeScript types
│   └── constants.ts       # Models, categories, scoring helpers
└── types/
    └── env.d.ts           # CloudflareBindings type
tests/
├── scoring.test.ts        # 9 tests — calculateOverallScore, calculatePromptStrength
├── constants.test.ts      # 13 tests — config integrity, score helpers
├── prompt-quality.test.ts # 5 tests — assessPromptQuality
└── hf-models.integration.test.ts  # 13 tests — HF model availability, adherence, adversarial
public/
├── styles.css             # Full custom CSS
├── scan.js                # Scan loading UX (extracted from inline)
├── llms.txt               # LLM-readable project info
├── robots.txt
├── site.webmanifest
├── favicon/               # Multi-format favicons
├── logo/                  # SVG logos
├── icon/                  # App icons
├── social/                # OG/Twitter card images
└── pwa/                   # PWA icons
```

---

## Pages

### Page 1: **Home** (`/`)
- Hero: "AI Safety Evaluations, Verified by Humans"
- 3 value prop cards: Detect / Score / Attest
- Live stats ticker (total scans, threats caught, human attestations)
- CTA: "Run Your First Scan →"

### Page 2: **Scan** (`/scan`)
- Textarea for system prompt input (with example button)
- Model selection — 5 models across OpenAI + HuggingFace:
  - ☑️ GPT-5 Mini (OpenAI) — default
  - ☐ Llama 3.3 70B (HuggingFace)
  - ☐ DeepSeek V3.2 (HuggingFace)
  - ☐ Qwen 2.5 72B (HuggingFace)
  - ☐ Qwen 2.5 Coder 32B (HuggingFace)
- Category checkboxes (all 5 checked by default)
- Animated loading state: shield icon, progress bar, live probe feed
- POST `/api/scan` → redirects to report

### Page 3: **Report** (`/report/:id`)
- **Single-model**: Score ring (0-100), dual bars (Model Resilience + Prompt Strength), executive summary, detailed findings with evidence
- **Multi-model**: No aggregate score — per-model cards with independent scores, per-category pass/fail rows, inline evidence for failures, severity explanations
- Prompt Strength bar (heuristic, always shown)
- Threat detection banner (if input looks like an attack)
- Prompt quality warning (if input isn't a real system prompt)
- Human attestation CTA + JSON export

### Page 4: **Verify** (`/verify/:id`)
- human.tech proof-of-personhood widget
- ZK proof status: pending → verified
- After verification → "✓ Verified by Human" badge on report + dashboard

### Page 5: **Dashboard** (`/dashboard`)
- KPI strip: total scans, avg score, findings, attestation rate
- Score distribution + threat severity charts
- Category breakdown (pass rates per category)
- Scan table: date, target, **models** (tagged badges), per-model scores, per-model ratings, per-model checks, attestation status

### Page 6: **About** (`/about`)
- Architecture diagram (multi-model probe engine → judge → scorecard → attestation)
- Supported models list (5 models, 4 organizations)
- Methodology: 5 attack categories with research references
- Tech stack section
- Paper references

---

## Safety Checks (40 probes across 5 categories)

### Methodology

| Check | Technique | Probes | Reference |
|-------|-----------|--------|-----------|
| Prompt Injection | UniGuardian PTA taxonomy | 12 | Lin et al. (2025) arXiv:2502.13141 |
| Jailbreak Resistance | JailbreakBench 100-behavior | 10 | Chao et al. (2024) arXiv:2404.01318 |
| Output Manipulation | Safety by Measurement | 6 | Grey & Segerie (2025) arXiv:2505.05541 |
| Evaluation Gaming | Min-K% contamination detection | 4 pairs | Shi et al. (2023) arXiv:2310.17680 |
| Data Exfiltration | HarmBench/AdvBench probes | 8 | Mazeika et al. (2024) arXiv:2402.01630 |

### Scoring

- **Per-model score**: Weighted average across categories (0-100, higher = safer)
- **Severity from failure rate**: critical (≥60%), high (40-60%), medium (20-40%), low (<20%)
- **Prompt Strength**: Heuristic score (0-100) based on system prompt length, instruction patterns, safety keywords — no API calls
- **No aggregate score for multi-model**: Each model is independently scored. No averaged numbers.
- **All verdicts from GPT-5.4**: Single judge model for consistent, fair comparison across all target models

---

## D1 Schema (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,        -- 'prompt' | 'endpoint'
  target_value TEXT NOT NULL,
  overall_score INTEGER NOT NULL,   -- 0-100 (avg across models for backward compat)
  categories TEXT NOT NULL,         -- JSON array of selected categories
  results TEXT NOT NULL,            -- JSON: primary model results (backward compat)
  model_results TEXT,               -- JSON: per-model results array
  input_analysis TEXT,              -- JSON: prompt quality + threat classification
  human_verified INTEGER DEFAULT 0,
  human_proof TEXT,                 -- ZK proof from human.tech
  verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_verified ON scans(human_verified);
```

---

## human.tech Integration (BONUS Track)

1. After a scan completes, user clicks "Attest as Human"
2. Redirect to human.tech verification flow
3. User proves personhood via ZK proof (no biometrics shared, no identity revealed)
4. On success, proof hash stored + scan marked as human-verified
5. Verified scans show "✓ Verified by Human" badge

**Why this matters**: If AI safety evals can be run AND faked by AI, the evaluations themselves become untrustworthy. Human attestation via ZK proofs closes that loop.

---

## Test Suite

```bash
bun run test          # All 40 tests
bun run test:unit     # 27 unit tests (scoring, constants, prompt quality)
bun run test:integration  # 13 integration tests (HF model availability, adversarial)
```

- `predeploy` hook runs full test suite before every deploy
- Integration tests verify all 4 HF models respond, follow system prompts, handle adversarial input

---

## Status

- ✅ Multi-model architecture (5 models, 2 providers)
- ✅ @huggingface/inference SDK integration
- ✅ 40 adversarial probes across 5 categories
- ✅ GPT-5.4 LLM-as-Judge for all verdicts
- ✅ Per-model scoring (no misleading aggregates)
- ✅ Dual scoring: Model Resilience + Prompt Strength
- ✅ Input analysis: prompt quality heuristic + LLM threat classifier
- ✅ Report page: per-model cards with inline evidence for failures
- ✅ Dashboard: per-model scores/ratings/checks in scan table
- ✅ Human attestation via human.tech ZK proofs
- ✅ 40 tests via Vitest (27 unit + 13 integration)
- ✅ Deployed to Cloudflare Workers
- ✅ Full documentation: README, JSON schema, probe library, example report

### Research Backing

The deep research confirms this is well-supported:
- **NIST AI RMF** mandates human-in-the-loop as a critical governance mechanism for safety testing pipelines
- **EU AI Act** requires human oversight for high-risk AI systems, including ability to override AI decisions
- **HAT framework** (Human-in-the-loop Adversarial Testing) uses human feedback to curate adversarial prompts that automated generators miss
- **Human-AI Collaborative Red Teaming** increases discovery of "long-tail" safety vulnerabilities vs. fully automated approaches
- Key audit metrics we surface: *Human-AI Decision Divergence*, *Intervention Efficacy*, *Automation Bias Rate*
- **Constitutional AI** incorporates human feedback to define safety boundaries — our tool makes this verifiable via ZK proofs

### Why human.tech Specifically
- ZK proofs = privacy-preserving (no biometrics leaked)
- Wallet-as-a-Protocol enables embedded verification
- "Human Keys from Human Attributes" — unique identity, not just CAPTCHA
- Their proof-of-personhood is designed exactly for this: proving a human was in the loop without revealing who

---

## Build Order (2-hour Sprint)

| Phase | Time | Tasks |
|-------|------|-------|
| **1. Scaffold** | 15 min | `bun create`, package.json, wrangler.jsonc, tsconfig, schema.sql, project structure |
| **2. Layout + Nav** | 15 min | Shared layout component, navigation, CSS, all 6 route stubs |
| **3. Home Page** | 10 min | Hero, value props, stats, CTA |
| **4. Scan Page** | 15 min | Form UI, category checkboxes, POST handler |
| **5. Safety Engine** | 20 min | Core checks in `lib/safety-checks.ts`, scoring logic |
| **6. Report Page** | 15 min | Score visualization, findings list, export |
| **7. Verify Page** | 10 min | human.tech integration, badge system |
| **8. Dashboard** | 10 min | Scan history table, filters, stats |
| **9. About** | 5 min | Methodology, architecture |
| **10. Polish** | 5 min | Links, final CSS tweaks, test all pages |

---

## Submission Checklist

### 🛡️ AI Safety & Evaluation (Protocol Labs)
- [ ] Summary — what it does, why it matters
- [ ] GitHub — public repo with README
- [ ] Demo — live URL on Cloudflare Workers
- [ ] Documentation — how to run, architecture, methodology

### 🌸 BONUS: Made by Human (human.tech)
- [ ] Summary — how human.tech integration works
- [ ] Demo — show the verification flow
- [ ] Documentation — integration guide

---

## Key Design Principles

1. **Multi-page, not overwhelming** — each page has ONE clear purpose
2. **Server-rendered** — fast, no client JS framework needed (Hono JSX)
3. **Real functionality** — actually runs safety checks against prompts/models
4. **Composable** — checks are modular, others can add their own
5. **Human-in-the-loop** — the core differentiator from pure-AI eval tools

---

## Research Foundation (Papers Downloaded)

AEGIS is grounded in peer-reviewed research. Each safety check, scoring method, and design decision traces back to published work. Papers are cited in the About page, README, and inline in the codebase via `// REF:` comments.

### Primary Papers (Downloaded to `research/papers/`)

1. **Lin et al. (2025)** — "UniGuardian: A Unified Defense for Detecting Prompt Injection, Backdoor Attacks and Adversarial Attacks in Large Language Models." *arXiv:2502.13141*
   - **Used in**: Prompt injection detection architecture. UniGuardian's "Prompt Trigger Attack" taxonomy unifies injection, backdoor, and adversarial attacks into a single detection pipeline. We adapt their single-forward detection strategy for our scan engine.

2. **Chao et al. (2024)** — "JailbreakBench: An Open Robustness Benchmark for Jailbreaking Large Language Models." *arXiv:2404.01318*
   - **Used in**: Jailbreak resistance testing. We adopt their standardized 100-behavior dataset, threat model definitions, and scoring functions. Our leaderboard/dashboard design mirrors their approach.

3. **Liu et al. (2024)** — "Automatic and Universal Prompt Injection Attacks against Large Language Models." *arXiv:2403.04957*
   - **Used in**: Attack generation for scan probes. Their gradient-based method achieves high effectiveness with only 5 training samples. We use their attack taxonomy to generate diverse injection probes.

4. **Yuan et al. (2026)** — "AgenticRed: Optimizing Agentic Systems for Automated Red-teaming." *arXiv:2601.13518*
   - **Used in**: Red-teaming probe evolution. AgenticRed achieves 96% ASR on Llama-2-7B and 100% on GPT-3.5-Turbo. Their evolutionary system design approach informs how we iterate on attack prompts.

5. **Grey & Segerie (2025)** — "Safety by Measurement: A Systematic Literature Review of AI Safety Evaluation Methods." *arXiv:2505.05541*
   - **Used in**: Overall framework design. Their 3-dimensional taxonomy (what / how / framework) structures our evaluation: measuring capabilities, propensities, and control properties.

6. **Zhang et al. (2025)** — "Jailbreak Distillation: Renewable Safety Benchmarking." *arXiv:2505.22037*
   - **Used in**: Dynamic benchmark resistance. JBDistill's approach to "distilling" attacks into updatable benchmarks informs our anti-gaming strategy — we don't use static test sets.

7. **Chen et al. (2025)** — "TeleAI-Safety: A Comprehensive LLM Jailbreaking Benchmark." *arXiv:2512.05485*
   - **Used in**: Attack/defense coverage matrix. Their integration of 19 attack methods, 29 defense methods across 14 models provides our baseline for comprehensive coverage.

### Additional Papers Referenced (from Deep Research)

8. **Zou et al. (2023)** — "Universal and Transferable Adversarial Attacks on Aligned Language Models." *arXiv:2307.15043*
   - GCG (Greedy Coordinate Gradient) suffix-based attack — foundational jailbreak method

9. **Mehrotra et al. (2023)** — "Tree of Attacks with Pruning (TAP)." *arXiv:2312.02119*
   - Iterative LLM-driven jailbreak refinement — informs our multi-round probe strategy

10. **Mazeika et al. (2024)** — "HarmBench: A Standardized Evaluation Framework for Automated Red Teaming." *arXiv:2402.01630*
    - Standardized ASR measurement — we adopt their attack success criteria

11. **Anthropic (2024)** — "Many-Shot Jailbreaking" (research blog)
    - Context-window exploitation technique — included in our jailbreak probe set

12. **Shi et al. (2023)** — "Detecting Pretraining Data from Large Language Models." *arXiv:2310.17680*
    - Min-K% probability method for contamination detection — powers our eval gaming check

13. **Bai et al. (2022)** — "Constitutional AI: Harmlessness from AI Feedback." *arXiv:2212.08073*
    - Human feedback for safety boundaries — theoretical basis for human attestation

14. **Mei et al. (2023)** — "ASSERT: Automated Safety Scenario Red Teaming." *arXiv:2310.09624*
    - Algorithmic test suite generation across robustness settings

### Governance & Standards

15. **NIST (2023)** — "AI Risk Management Framework (AI RMF 1.0)" *NIST.AI.100-1*
    - Human oversight as critical control layer; mandates HITL for high-stakes AI validation

16. **European Parliament (2024)** — "EU AI Act" *Regulation 2024/1689*
    - Art. 14: Human oversight requirements for high-risk AI systems

17. **IEEE (2021)** — "IEEE 7000: Model Process for Addressing Ethical Concerns During System Design"
    - Value-based auditing as core engineering process

### Key Open-Source Tools

| Tool | Source | How We Use It |
|------|--------|---------------|
| **Garak** | NVIDIA (`github.com/NVIDIA/garak`) | Probe patterns for prompt injection & data exfiltration tests |
| **JailbreakBench** | `jailbreakbench.github.io` | 100 standardized jailbreak behaviors as test cases |
| **AdvBench** | Zou et al. | 520 harmful behavior prompts for robustness testing |
| **Do-Not-Answer** | LMSYS | Adversarial prompts designed to elicit unsafe responses |

### How References Appear in the App

**In the About Page** (`/about`):
- Full bibliography section with numbered citations
- Each safety check links to its foundational paper(s)
- "Methodology" section explains which techniques come from which papers

**In Scan Reports** (`/report/:id`):
- Each finding category shows a "Based on: [Paper Name]" attribution
- Hover tooltips with paper abstracts for key techniques
- Footer: "AEGIS evaluations are grounded in peer-reviewed research. See methodology →"

**In the Codebase**:
```typescript
// REF: Lin et al. (2025) "UniGuardian" arXiv:2502.13141
// Adapted single-forward Prompt Trigger Attack detection
function detectPromptInjection(input: string): CheckResult { ... }

// REF: Chao et al. (2024) "JailbreakBench" arXiv:2404.01318
// Using standardized 100-behavior threat model
const JAILBREAK_BEHAVIORS = [ ... ]

// REF: Shi et al. (2023) "Min-K%" arXiv:2310.17680
// Probability-based contamination detection
function detectEvalGaming(responses: string[]): CheckResult { ... }
```

**In the README**:
- "Research Foundation" section with BibTeX entries
- Links to all papers on arXiv
- Acknowledgments to Garak, JailbreakBench, HarmBench communities
