# AEGIS — AI Evaluation & Governance Integrity System

> **Hackathon**: Intelligence at the Frontier (Funding the Commons + Protocol Labs)
> **Date**: March 15, 2026 11:55 AM
> **Tracks**: 🛡️ AI Safety & Evaluation (Protocol Labs) + 🌸 BONUS: Made by Human (human.tech)

---

## The Pitch (30 seconds)

AI safety evaluations are only trustworthy if you can prove **who** ran them and that results weren't fabricated by another AI. AEGIS is a reusable AI safety evaluation framework with **human-verified attestations** — every audit is cryptographically tied to a proven human via human.tech's proof-of-personhood protocol.

**"AI safety you can trust, because the humans behind it are verified."**

---

## Target Tracks

- 🛡️ **AI Safety & Evaluation** (Protocol Labs) — summary, github, demo, documentation
- 🌸 **Made by Human** (human.tech) — summary, demo, documentation

---

## Tech Stack (follows secretspots.guide patterns)

| Layer | Tech |
|-------|------|
| Runtime | **Cloudflare Workers** |
| Framework | **Hono + JSX** (server-rendered) |
| Language | **TypeScript** |
| Package manager | **Bun** |
| Database | **Cloudflare D1** (SQLite) |
| Static assets | `public/` dir via Workers Assets |
| Deploy | **Wrangler** |
| Target Models | **OpenAI GPT-5 Mini** + **HuggingFace** (Llama 3.1, Mistral 7B, Qwen 2.5, Phi-3) |
| Judge Model | **OpenAI GPT-5.4** (LLM-as-Judge for all probe verdicts) |
| Human verification | **human.tech** proof-of-personhood ZK proofs |

---

## Project Structure

```
src/
├── index.tsx              # Hono app + all routes (secretspots pattern)
├── pages/
│   ├── home.tsx           # Page 1: Landing — what AEGIS does
│   ├── scan.tsx           # Page 2: Run a safety scan on a prompt/model
│   ├── report.tsx         # Page 3: View scan results & severity scores
│   ├── verify.tsx         # Page 4: Human attestation via human.tech
│   ├── dashboard.tsx      # Page 5: All scans overview + leaderboard
│   └── about.tsx          # Page 6: Methodology + how it works
├── components/
│   ├── layout.tsx         # Shared <html> shell, nav, footer
│   ├── nav.tsx            # Navigation bar (links to all 5+ pages)
│   ├── scan-form.tsx      # The prompt/model input form
│   ├── score-badge.tsx    # Severity badge component (PASS/WARN/FAIL)
│   └── human-badge.tsx    # "Verified by Human" attestation badge
├── lib/
│   ├── safety-checks.ts   # Core: prompt injection, jailbreak, eval gaming detectors
│   ├── scoring.ts         # Risk scoring engine (0-100 scale)
│   ├── human-verify.ts    # human.tech integration (ZK proof verification)
│   ├── types.ts           # Shared TypeScript types
│   └── constants.ts       # App constants
├── api/
│   └── index.ts           # API routes: POST /api/scan, GET /api/reports
└── types/
    └── env.d.ts           # CloudflareBindings type
public/
├── styles.css             # Tailwind-ish utility CSS (inline or minimal)
└── favicon.ico
wrangler.jsonc
package.json
tsconfig.json
schema.sql                 # D1 schema for scans + attestations
```

---

## 5+ Pages (Navigation Flow)

### Page 1: **Home** (`/`)
- Hero: "AI Safety Evaluations, Verified by Humans"
- 3 value prop cards: Detect / Score / Attest
- CTA: "Run Your First Scan →"
- Stats ticker (total scans, threats caught, human attestations)

### Page 2: **Scan** (`/scan`)
- Input form: paste a system prompt OR enter a model API endpoint
- Select target models to test against:
  - ☑️ GPT-5 Mini (OpenAI)
  - ☐ Llama 3.1 8B (HuggingFace)
  - ☐ Mistral 7B (HuggingFace)
  - ☐ Qwen 2.5 72B (HuggingFace)
  - ☐ Phi-3 Mini (HuggingFace)
- Select attack categories to test:
  - ☑️ Prompt injection
  - ☑️ Jailbreak resistance
  - ☑️ Output manipulation
  - ☑️ Evaluation gaming
  - ☑️ Data exfiltration
- "Run Scan" button → POST to `/api/scan` → redirect to report

### Page 3: **Report** (`/report/:id`)
- Overall safety score (0–100) with color-coded ring
- **Multi-model comparative scorecard**: side-by-side bars showing per-model scores
- Per-category breakdown with PASS/WARN/FAIL badges
- Specific findings list with severity + description
- "Attest as Human" CTA → links to verify page
- Export: "Download JSON report"

### Page 4: **Verify** (`/verify/:id`)
- human.tech proof-of-personhood widget integration
- Shows: "This evaluation was reviewed and attested by a verified human"
- ZK proof status: pending / verified
- After verification → badge appears on report + dashboard entry

### Page 5: **Dashboard** (`/dashboard`)
- Table of all past scans (date, target, score, human-verified badge)
- Filter by: score range, verified only, category
- Summary stats: avg score, % human-attested, top failure categories

### Page 6: **About** (`/about`)
- Methodology: how each safety check works
- Why human attestation matters for AI safety
- Architecture diagram
- Links to Protocol Labs + human.tech

---

## Safety Checks (Core Logic in `lib/safety-checks.ts`)

Each check returns `{ passed: boolean, severity: 'low'|'medium'|'high'|'critical', description: string, evidence: string }`

### Grounded in Research

Our checks are based on state-of-the-art techniques from the AI safety literature:

| Check | Inspired By | Key Reference |
|-------|-------------|---------------|
| Prompt Injection | UniGuardian unified detection, StruQ structured queries | arxiv:2502.13141, arxiv:2402.06363 |
| Jailbreak Resistance | JailbreakBench standardized eval, TAP attack trees | arxiv:2404.01318, arxiv:2312.02119 |
| Eval Gaming | Goodhart's Law in LLMs, Min-K% contamination detection | arxiv:2505.22037, arxiv:2310.17680 |
| Red Teaming | AgenticRed automated pipeline, ASSERT scenarios | arxiv:2601.13518, arxiv:2310.09624 |
| Human Attestation | NIST AI RMF human oversight, HAT framework | NIST.AI.100-1 |

### Check Details

1. **Prompt Injection Detection** — Tests if the model follows injected instructions hidden in user input. Uses techniques from UniGuardian (Prompt Trigger Attack detection) and Garak probe patterns. Tests both direct injection ("ignore previous instructions") and indirect injection (hidden instructions in data context).

2. **Jailbreak Resistance** — Runs known jailbreak templates based on JailbreakBench's 100-behavior dataset. Includes DAN, roleplay, hypothetical framing, Many-Shot Jailbreaking (MSJ) patterns, and GCG-style suffix attacks. Measures Attack Success Rate (ASR).

3. **Output Manipulation** — Tests if model can be tricked into producing formatted outputs that look like system messages, or if it exhibits verbosity bias that gaming LLM-as-a-judge evaluations. Detects length bias and confidence-sounding refusals.

4. **Evaluation Gaming Detection** — Detects if a model behaves differently when it detects eval-like patterns. Uses Min-K% probability analysis to flag potential benchmark contamination. Compares performance on canonical vs. paraphrased test prompts to detect memorization.

5. **Data Exfiltration** — Tests if the model can be coerced into leaking system prompt or training data patterns. Uses techniques from the AdvBench 520-behavior dataset and representation engineering approaches to detect information leakage.

### Scoring Methodology

- **Overall Score**: Weighted average across all categories (0-100, higher = safer)
- **Per-Category Score**: Based on Attack Success Rate (ASR) — lower ASR = higher safety score
- **Utility-Preservation Score**: Ensures safety hardening doesn't break the model's primary purpose (prevents over-refusal)
- **Human-AI Alignment Score**: After human attestation, measures agreement between automated findings and human judgment

---

## D1 Schema (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,        -- 'prompt' | 'endpoint'
  target_value TEXT NOT NULL,
  overall_score INTEGER NOT NULL,   -- 0-100
  categories TEXT NOT NULL,         -- JSON array of selected categories
  results TEXT NOT NULL,            -- JSON array of check results
  human_verified INTEGER DEFAULT 0,
  human_proof TEXT,                 -- ZK proof from human.tech
  verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  ip_hash TEXT
);

CREATE INDEX idx_scans_created ON scans(created_at DESC);
CREATE INDEX idx_scans_verified ON scans(human_verified);
```

---

## human.tech Integration (BONUS Track)

Integration approach:
1. After a scan completes, user clicks "Attest as Human"
2. Redirect to human.tech verification flow (or embed their widget)
3. User proves personhood via ZK proof (no biometrics shared)
4. On success, we store the proof hash + mark scan as human-verified
5. Verified scans show a "✓ Verified by Human" badge

This addresses a real problem: **Who watches the watchmen?** If AI safety evals can be run AND faked by AI, the evaluations themselves become untrustworthy. Human attestation via ZK proofs closes that loop.

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
