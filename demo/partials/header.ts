export const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostHog Fast Feature Flags</title>
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
