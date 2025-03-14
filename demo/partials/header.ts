// @ts-expect-error Importing HTML
import originalSampleHtml from './sample.html';
// @ts-expect-error Importing JavaScript
import originalScriptContents from '../../dist/posthog-fast-feature-flags.txt';

export const getSampleHtml = () => {
  let sampleHtml = originalSampleHtml.replace(/\s+\/\/ prettier-ignore/, '');

  sampleHtml = sampleHtml.trim();

  sampleHtml = sampleHtml.replace(
    '//insert-pfff-here\n',
    originalScriptContents
  );

  return sampleHtml;
};

const sampleHtml = getSampleHtml().replace(
  'INSERT_YOUR_POSTHOG_TOKEN_HERE',
  "'phc_JtkPfO4mv6wUgNVcEvexwjtihCMXSgdeA3JKvc8lxfg'"
);

export const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostHog Fast Feature Flags</title>
    ${sampleHtml}
    <link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css">
    <style>
        body {
            padding-bottom: 3rem;
        }
        pre,
        pre code {
            font-size: .9rem;
            line-height: 1.2;
        }
        .copyable {
            position: relative;
            button {
                position: absolute;
                padding-bottom: 0.25rem;
                padding-top: 0.25rem;
                border-radius: 2px;
                right: 4px;
                top: 4px;
            }
        }
        hr {
            background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
            width: 100%;
            height: 1px;
            left: 0;
            right: 0;
        }
        tr:nth-child(2n) {
            background: transparent;
        }
    </style>
</head>
<body>
`;
