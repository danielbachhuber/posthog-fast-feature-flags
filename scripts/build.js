const esbuild = require('esbuild');
const path = require('path');
const chokidar = require('chokidar');
const { spawn } = require('child_process');
const fs = require('fs');

const isWatchMode = process.argv.includes('--watch');

// Build the main library - always minified
const mainBuildOptions = {
  entryPoints: [
    {
      in: 'src/posthog-fast-feature-flags.ts',
      out: 'posthog-fast-feature-flags',
    },
  ],
  outdir: 'dist',
  bundle: true,
  minify: true,
  sourcemap: false,
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
};

// Build the demo server - unminified for debugging
const demoBuildOptions = {
  entryPoints: [{ in: 'demo/index.ts', out: 'demo' }],
  outdir: 'dist',
  bundle: true,
  minify: false,
  platform: 'node',
  target: ['node18'],
  format: 'cjs',
  loader: {
    '.html': 'text',
  },
};

let serverProcess = null;

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  serverProcess = spawn('node-dev', ['dist/demo.js'], {
    stdio: 'inherit',
    shell: true,
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

if (isWatchMode) {
  Promise.all([
    esbuild.context(mainBuildOptions),
    esbuild.context(demoBuildOptions),
  ]).then(async ([mainContext, demoContext]) => {
    // Initial build
    await mainContext.rebuild();
    await demoContext.rebuild();

    const mainFile = 'dist/posthog-fast-feature-flags.js';
    fs.copyFileSync(mainFile, mainFile.replace('.js', '.txt'));

    // Start watching
    mainContext.watch();
    demoContext.watch();

    // Watch HTML files
    const watcher = chokidar.watch(['demo/**/*.html'], {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    });

    watcher.on('change', (path) => {
      console.log(`HTML file changed: ${path}`);
      // Rebuild demo and restart server
      demoContext.rebuild().then(() => {
        startServer();
      });
    });

    // Start the server
    startServer();

    // Rebuild notification
    console.log('Watching for changes...');
  });
} else {
  // Single build
  Promise.all([
    esbuild.build(mainBuildOptions),
    esbuild.build(demoBuildOptions),
  ])
    .then(() => {
      // Create .txt copy of the main build
      const mainFile = 'dist/posthog-fast-feature-flags.js';
      fs.copyFileSync(mainFile, mainFile.replace('.js', '.txt'));

      // Verify files exist
      const files = fs.readdirSync('dist');
      console.log('Built files:', files);
      console.log('Build completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Build failed:', error);
      process.exit(1);
    });
}

// Cleanup on exit
process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});
