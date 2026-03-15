/** @jsxImportSource hono/jsx */
import type { FC, PropsWithChildren } from 'hono/jsx';
import { Nav } from './nav';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '../lib/constants';

const SITE_URL = 'https://aegis.dev';

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: APP_NAME,
  description: APP_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  url: SITE_URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  keywords: ['AI safety', 'prompt injection', 'jailbreak detection', 'human attestation', 'LLM evaluation'],
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: `${APP_NAME} — ${APP_TAGLINE}`,
  url: SITE_URL,
};

export const Layout: FC<PropsWithChildren<{ title?: string; description?: string; path?: string }>> = ({
  title,
  description,
  path,
  children,
}) => {
  const pageTitle = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — AI Safety Evaluations, Verified by Humans`;
  const pageDesc = description ?? APP_DESCRIPTION;
  const canonicalUrl = path ? `${SITE_URL}${path}` : SITE_URL;

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>

        {/* SEO */}
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content="AI safety, prompt injection, jailbreak detection, LLM evaluation, human attestation, AI governance, zero-knowledge proof" />
        <meta name="author" content="AEGIS" />
        <meta name="robots" content="index, follow" />
        <meta name="category" content="technology" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={`${APP_NAME} — ${APP_TAGLINE}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={`${SITE_URL}/social/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${APP_NAME} — ${APP_TAGLINE}`} />

        {/* Twitter/X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={`${SITE_URL}/social/og-image.png`} />

        {/* Favicons */}
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />

        {/* PWA */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* AI Discoverability */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Information" />

        {/* Styles */}
        <link rel="stylesheet" href="/styles.css" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <footer class="footer">
          <div class="container">
            <p>
              <strong>{APP_NAME}</strong> — {APP_TAGLINE}
            </p>
            <p class="footer-sub">
              Built at <em>Intelligence at the Frontier</em> · Funding the Commons + Protocol Labs · March 2026
            </p>
            <p class="footer-sub">
              Research-backed evaluations · Human-verified attestations via <a href="https://human.tech" target="_blank" rel="noopener">human.tech</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
};
