/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';

export const HomePage: FC<{ totalScans: number; threats: number }> = ({
  totalScans,
  threats,
}) => (
  <Layout>
    <section class="hero">
      <div class="container">
        <div class="hero-badge">🛡️ Research-Backed AI Safety</div>
        <h1 class="hero-title">
          AI Safety Evaluations,<br />
          <span class="gradient-text">Built on Research</span>
        </h1>
        <p class="hero-subtitle">
          AEGIS detects prompt injection, jailbreaks, and evaluation gaming across multiple models
          with research-backed probes and quantitative safety scores.
        </p>
        <div class="hero-actions">
          <a href="/scan" class="btn btn-primary btn-lg">Run Your First Scan →</a>
          <a href="/about" class="btn btn-outline btn-lg">How It Works</a>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="grid-3">
          <div class="card">
            <div class="card-icon">📚</div>
            <h3>Detect</h3>
            <p>
              5 attack categories grounded in peer-reviewed research — from UniGuardian's prompt trigger
              detection to JailbreakBench's 100-behavior dataset.
            </p>
          </div>
          <div class="card">
            <div class="card-icon">📊</div>
            <h3>Score</h3>
            <p>
              Quantitative safety scores (0–100) based on Attack Success Rate, with per-category
              breakdowns and severity ratings.
            </p>
          </div>
          <div class="card">
            <div class="card-icon">📚</div>
            <h3>Cite</h3>
            <p>
              Every probe traces to a peer-reviewed paper — UniGuardian, JailbreakBench, HarmBench,
              Min-K%, and Constitutional AI.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="container">
        <div class="grid-3">
          <div class="stat">
            <div class="stat-number">{totalScans}</div>
            <div class="stat-label">Scans Run</div>
          </div>
          <div class="stat">
            <div class="stat-number">{threats}</div>
            <div class="stat-label">Threats Detected</div>
          </div>
        </div>
      </div>
    </section>

  </Layout>
);
