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

        <p>Current path: <code>${req.path}</code></p>
        
        <h2>Example Usage:</h2>
        <pre><code>
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
    }
]);

console.log(flags);
// Example output:
// {
//     'variant-flag': 'control',
//     'boolean-flag': false
// }
        </code></pre>

        <h2>Try it in the console!</h2>
        <script>
            // Initialize example flags
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
                }
            ]);

            // Make it available in console
            window.flags = flags;
            
            console.log('Assigned flags:', flags);
            console.log('Try it again! Just run PFFF() with your flag definitions.');
        </script>
        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
