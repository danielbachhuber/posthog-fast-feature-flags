import fs from 'fs';
import path from 'path';
import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

// @ts-ignore
import originalSampleHtml from './partials/sample.html';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));

let sampleHtml = originalSampleHtml.replace('// prettier-ignore', '');

sampleHtml = sampleHtml.trim();

const scriptContents = fs.readFileSync(
  path.join(process.cwd(), 'dist/posthog-fast-feature-flags.js'),
  'utf8'
);

sampleHtml = sampleHtml.replace('//insert-pfff-here', scriptContents);
// Escape HTML special characters for display
sampleHtml = sampleHtml
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.get('*', (req, res) => {
  const html = `
        ${header}
        <h1>PostHog Fast Feature Flags</h1>

		<p>Out of the box, the PostHog JavaScript library assigns feature flags by:<p>
		<ol>
			<li>Generating a unique identifier for the visitor, if one doesn't already exist.</li>
			<li>Sending the unique identifier to PostHog to determine the feature flag assignments.</li>
			<li>Parsing the response and applying the feature flag assignments.</li>
		</ol>

		<p>This is great for many cases, but if you need to reduce latency on the initial request you can:</p>
		<ul>
			<li><a target="_blank" href="https://posthog.com/docs/feature-flags/bootstrapping">Bootstrap the feature flag assignments</a> on your page (requires calling the PostHog server within your backend), or</li>
			<li>Use PostHog Fast Feature Flags (this utility!) to dynamically assign feature flags within the client.</li>
		</ul>

		<p>PostHog Fast Feature Flags uses the same algorithm as the PostHog backend to assign feature flags. Check out this code snippet for an example of how it works:</p>

		<pre><code>${sampleHtml}</code></pre>

        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
