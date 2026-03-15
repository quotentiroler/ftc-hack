/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';

export const HumanBadge: FC<{ verified: boolean; scanId?: string }> = ({ verified, scanId }) => {
  if (verified) {
    return (
      <div class="human-badge verified">
        <span class="human-badge-icon">✓</span>
        <span>Verified by Human</span>
        <span class="human-badge-sub">via human.tech ZK proof</span>
      </div>
    );
  }
  return (
    <a href={scanId ? `/verify/${scanId}` : '#'} class="human-badge unverified human-badge-pulse">
      <span class="human-badge-icon">🔐</span>
      <span>Not yet human-verified</span>
      <span class="human-badge-sub">Click to attest with ZK proof →</span>
    </a>
  );
};
