import fs from 'fs';
import path from 'path';
import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

// @ts-ignore
import originalScriptContents from '../dist/posthog-fast-feature-flags.txt';
import originalSampleHtml from './partials/sample.html';
import originalRedirectSampleHtml from './partials/redirect-sample.html';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));

let sampleHtml = originalSampleHtml.replace(/\s+\/\/ prettier-ignore/, '');

sampleHtml = sampleHtml.trim();

sampleHtml = sampleHtml.replace('//insert-pfff-here\n', originalScriptContents);
let modifiedScriptContents = originalScriptContents.replace(
  '"use strict";',
  ''
);
let escapedScriptContents = modifiedScriptContents
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
// Escape HTML special characters for display
let escapedSampleHtml = sampleHtml
  .replace('"use strict";', '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
// Escape HTML special characters for display
let redirectSampleHtml = originalRedirectSampleHtml
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.get('*', (req, res) => {
  const html = `
        ${header}
<h1>PostHog Fast Feature Flags</h1>

<p><strong>PostHog Fast Feature Flags</strong> is a small library that assigns feature flags to visitors before the PostHog web snippet (posthog.js) loads. It works in limited cases where zero latency is more important than some of the advanced PostHog feature flags features (e.g. release conditions).</p>

<p>If you need the PFFF code snippet and know what you're doing, here it is:</p>

<pre class="copyable"><code class="language-javascript">// PostHog Fast Feature Flags
${escapedScriptContents}</code></pre>

<p>Otherwise, read on for more details&hellip;</p>

<hr>

<p>Out of the box, <a target="_blank" href="https://posthog.com/docs/libraries/js">PostHog web snippet</a> (posthog.js) assigns feature flags by:</p>
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
      <td>Receiving the assignments from the server, parsing the response, and applying the feature&nbsp;flags.</td>
      <td>[server -> posthog.js]</td>
    </tr>
  </tbody>
</table>

<p>Notice the little round-trip there? This approach works for many use cases but can include some latency. If you want to remove the latency, you can:</p>
<ul>
  <li><a target="_blank" href="https://posthog.com/docs/feature-flags/bootstrapping">Bootstrap the feature flag assignments</a> on your page. This requires requires access to backend code and calling the PostHog <code>/decide</code> endpoint within your backend.<br><br>Or&hellip;<br><br></li>
  <li>Use PostHog Fast Feature Flags (**this library!**) to handle feature flag assignments before posthog.js loads.<br><br>It generates an identifier for your visitor, stores the identifier in a cookie, and then uses the same algorithm as the PostHog <code>/decide</code> endpoint to assign feature flags.<br><br>It's even running on this page! <span id="pfff-status">Your identity is not yet known and you aren't assigned to a variant yet</span>.</li>
</ul>

${sampleHtml}

<p>Here's how you can use PostHog Fast Feature Flags:</p>

<pre><code class="language-javascript">${escapedSampleHtml}</code></pre>

<p>If you want to redirect the visitor to a different landing page based on their feature flag assignment, replace the last bit with something like this:</p>

<pre><code class="language-javascript">${redirectSampleHtml}</code></pre>

<p>Keep in mind: PostHog Fast Feature Flags is pretty limited. Because the feature flags are assigned in the browser, advanced features like release conditions, etc. aren't available.</p>

<p>Feel free to <a target="_blank" href="https://github.com/danielbachhuber/posthog-fast-feature-flags/issues">open a GitHub issue</a> if you have any questions or feedback!</p>

        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
