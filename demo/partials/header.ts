// @ts-ignore
import scriptContents from '../../dist/posthog-fast-feature-flags.txt';
// @ts-ignore
import originalSampleHtml from './sample.html';

const modifiedHtml = originalSampleHtml.replace(
  '//insert-pfff-here',
  scriptContents
);

export const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostHog Fast Feature Flags</title>
    ${modifiedHtml}
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .flag {
            margin: 10px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        .flag-value {
            font-family: monospace;
            color: #2a2a2a;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
`;
