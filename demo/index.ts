import express from 'express';
import { header } from './partials/header';
import { footer } from './partials/footer';

const app = express();
const port = 3000;

// Serve static files from dist directory
app.use(express.static('dist'));

// Handle all routes with the same HTML template
app.get('*', (req, res) => {
  const html = `
        ${header}
        <h1>PostHog Fast Feature Flags Demo</h1>
        <p>Current path: ${req.path}</p>
        ${footer}
    `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}`);
});
