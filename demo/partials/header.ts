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
    <link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css">
    <style>
        pre,
        pre code {
            font-size: .9rem;
            line-height: 1.2;
        }
        hr {
            border: 0;
            height: 1px;
            width: 100%;
            background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
        }
        tr:nth-child(2n) {
            background: transparent;
        }
    </style>
</head>
<body>
`;
