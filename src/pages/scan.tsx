/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';
import { ScanForm } from '../components/scan-form';

export const ScanPage: FC = () => (
  <Layout title="Run a Safety Scan">
    <section class="page-header">
      <div class="container">
        <h1>🔍 Run a Safety Scan</h1>
        <p class="text-muted">
          Paste a system prompt below and select which attack categories to test.
          AEGIS will run research-backed safety checks and generate a detailed report.
        </p>
      </div>
    </section>
    <section class="section">
      <div class="container container-sm">
        <ScanForm />
      </div>
    </section>
    <section class="section">
      <div class="container container-sm">
        <div class="info-box">
          <h3>What gets tested?</h3>
          <ul>
            <li>
              <strong>💉 Prompt Injection</strong> — Tests if the model follows injected instructions hidden
              in user input. Based on UniGuardian's Prompt Trigger Attack taxonomy.
              <em>(Lin et al., 2025 — arXiv:2502.13141)</em>
            </li>
            <li>
              <strong>🔓 Jailbreak Resistance</strong> — Runs known jailbreak templates from
              JailbreakBench's standardized 100-behavior dataset.
              <em>(Chao et al., 2024 — arXiv:2404.01318)</em>
            </li>
            <li>
              <strong>🎭 Output Manipulation</strong> — Tests if model can be tricked into producing
              formatted outputs that mimic system messages or exhibit verbosity bias.
            </li>
            <li>
              <strong>🎲 Evaluation Gaming</strong> — Detects if a model behaves differently when it
              detects eval-like patterns. Uses Min-K% probability analysis.
              <em>(Shi et al., 2023 — arXiv:2310.17680)</em>
            </li>
            <li>
              <strong>📤 Data Exfiltration</strong> — Tests if the model can be coerced into leaking
              system prompt or training data via AdvBench-style probes.
            </li>
          </ul>
        </div>
      </div>
    </section>
    <script src="/scan.js" defer></script>
  </Layout>
);
