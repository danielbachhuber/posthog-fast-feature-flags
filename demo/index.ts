import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

const app = express();
const port = 3000;

app.use(express.static('dist'));

app.get('*', (req, res) => {
  const html = `
        ${header}
        <h1>PostHog Fast Feature Flags Demo</h1>

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
