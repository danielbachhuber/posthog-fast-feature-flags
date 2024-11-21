import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files from dist directory
app.use(express.static('dist'));

// Handle all routes with the same HTML template
app.get('*', (req, res) => {
  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PostHog Fast Feature Flags Demo</title>
            <script src="/posthog-fast-feature-flags.js"></script>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <h1>PostHog Fast Feature Flags Demo</h1>
            <p>Current path: ${req.path}</p>
        </body>
        </html>
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
