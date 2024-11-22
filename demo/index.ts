import fs from 'fs';
import path from 'path';
import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

const app = express();
const port = 3000;

app.use(express.static('dist'));

let sampleHtml = fs.readFileSync(
  path.join(path.dirname(__dirname), 'demo', 'partials', 'sample.html'),
  'utf8'
);

sampleHtml = sampleHtml.replace('// prettier-ignore', '');

sampleHtml = sampleHtml.trim();

sampleHtml = sampleHtml.replace(
  '//insert-pfff-here',
  fs.readFileSync('dist/posthog-fast-feature-flags.js', 'utf8')
);
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

		<p>PostHog Fast Feature Flags uses the same algorithm as the PostHog backend to assign feature flags.</p>

		<template id="identity-template">
			<div class="identity">
				<strong>Identity</strong>: <span class="identity-value"></span>
			</div>
		</template>

        <template id="flag-template">
            <div class="flag">
                <strong></strong>: <span class="flag-value"></span>
            </div>
        </template>

		<pre><code>${sampleHtml}</code></pre>

        <div id="flags-display">
            <h2>Assigned Feature Flags:</h2>
        </div>

        <h2>Feature Flags Configuration:</h2>
        <pre><code>
const flags = PFFF([
    {
        key: 'variant-flag',
        variants: {
            control: 0.5,
            test: 0.5,
        },
    },
    {
        key: 'boolean-flag',
        variants: {
            true: 0.5,
            false: 0.5,
        },
    },
    {
        key: 'multi-variant',
        variants: {
            control: 0.34,
            variantA: 0.33,
            variantB: 0.33,
        },
    }
]);
</code></pre>

        <script>
            // Get identity
            const identity = PFFF.identity();
            console.log('Identity:', identity);

            // Initialize flags
            const flags = PFFF([
                {
                    key: 'variant-flag',
                    variants: {
                        control: 0.5,
                        test: 0.5,
                    },
                },
                {
                    key: 'boolean-flag',
                    variants: {
                        true: 0.5,
                        false: 0.5,
                    },
                },
                {
                    key: 'multi-variant',
                    variants: {
                        control: 0.34,
                        variantA: 0.33,
                        variantB: 0.33,
                    },
                }
            ]);

            // Display identity on the page
            const flagsDisplay = document.getElementById('flags-display');
            const identityTemplate = document.getElementById('identity-template');
            const identityElement = identityTemplate.content.cloneNode(true);
            const identitySpan = identityElement.querySelector('.identity-value');
            identitySpan.textContent = identity;
            flagsDisplay.insertBefore(identityElement, flagsDisplay.firstChild);

            // Display flags
            const template = document.getElementById('flag-template');
            
            Object.entries(flags).forEach(([key, value]) => {
                const flagElement = template.content.cloneNode(true);
                const strong = flagElement.querySelector('strong');
                const span = flagElement.querySelector('.flag-value');
                
                strong.textContent = key;
                span.textContent = JSON.stringify(value);
                
                flagsDisplay.appendChild(flagElement);
            });

            console.log('Assigned flags:', flags);
        </script>
        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
