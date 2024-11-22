import fs from 'fs';
import path from 'path';
import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

// @ts-ignore
import scriptContents from '../dist/posthog-fast-feature-flags.txt';
import originalSampleHtml from './partials/sample.html';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));

let sampleHtml = originalSampleHtml.replace(/\s+\/\/ prettier-ignore/, '');

sampleHtml = sampleHtml.trim();

sampleHtml = sampleHtml.replace('//insert-pfff-here\n', scriptContents);
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

<p>Out of the box, the <a target="_blank" href="https://posthog.com/docs/libraries/js">PostHog JavaScript library</a> (posthog.js) assigns feature flags by:</p>
<table>
  <thead>
    <tr>
      <th>What</th>
      <th>Where</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Generating a unique identifier for the visitor, if one doesn't already&nbsp;exist.</td>
      <td>[posthog.js]</td>
    </tr>
    <tr>
      <td>Sending the unique identifier to PostHog's <code>/decide</code> endpoint to determine feature flag&nbsp;assignments.</td>
      <td>[posthog.js -> server]</td>
    </tr>
    <tr>
      <td>Parsing the response and applying feature flag&nbsp;assignments.</td>
      <td>[server -> posthog.js]</td>
    </tr>
  </tbody>
</table>

<p>Notice the little round-trip there? This approach works for many use cases but can include some latency. If you want to remove the latency, you can:</p>
<ul>
  <li><a target="_blank" href="https://posthog.com/docs/feature-flags/bootstrapping">Bootstrap the feature flag assignments</a> on your page (which requires access to backend code and calling the PostHog <code>/decide</code> endpoint within your backend), or&hellip;</li>
  <li>Use PostHog Fast Feature Flags (**this library!**) to handle feature flag assignments before posthog.js loads. It generates an identifier for your visitor, stores the identifer in a cookie, and then uses the same algorithm as the PostHog <code>/decide</code> endpoint to assign feature flags.</li>
</ul>

<p>PostHog Fast Feature Flags is even running on this page! <span id="pfff-status">Your identity is not yet known and you aren't assigned to a variant yet</span>.</p>

<p>Here's how you can use it:</p>

<pre><code class="language-javascript">${sampleHtml}</code></pre>

        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
