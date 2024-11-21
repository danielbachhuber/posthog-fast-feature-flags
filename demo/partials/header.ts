import { style } from './style';

export const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostHog Fast Feature Flags Demo</title>
    <script src="/posthog-fast-feature-flags.js"></script>
    ${style}
</head>
<body>
`;
