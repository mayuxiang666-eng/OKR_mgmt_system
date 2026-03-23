const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const webAppDir = path.join(rootDir, 'apps', 'web');
const distDir = path.join(rootDir, 'dist');
const standaloneDir = path.join(webAppDir, '.next', 'standalone');

async function packageApp() {
  console.log('--- Starting Packaging Process ---');

  // 1. Clean dist folder
  if (fs.existsSync(distDir)) {
    fs.removeSync(distDir);
  }
  fs.mkdirSync(distDir);

  // 2. Copy standalone folder contents
  console.log('Copying standalone build...');
  fs.copySync(standaloneDir, distDir);

  // 3. Copy public and static assets (Crucial for Next.js standalone)
  console.log('Copying public assets and static files...');
  const publicSrc = path.join(webAppDir, 'public');
  const publicDest = path.join(distDir, 'apps', 'web', 'public');
  if (fs.existsSync(publicSrc)) {
    fs.copySync(publicSrc, publicDest);
  }

  const staticSrc = path.join(webAppDir, '.next', 'static');
  const staticDest = path.join(distDir, 'apps', 'web', '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    fs.copySync(staticSrc, staticDest);
  }

  // 4. Create launcher.js
  console.log('Creating launcher.js...');
  const launcherContent = `
const path = require('path');
const { fork } = require('child_process');

console.log('--- OKR Tool Launcher ---');
process.env.PORT = process.env.PORT || 3000;
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const serverPath = path.join(__dirname, 'apps', 'web', 'server.js');
console.log('Starting server at: ' + serverPath);

const p = fork(serverPath, {
  env: process.env,
  stdio: 'inherit'
});

p.on('exit', (code) => {
  console.log('Server exited with code: ' + code);
  process.exit(code);
});
  `;
  fs.writeFileSync(path.join(distDir, 'launcher.js'), launcherContent);

  // 5. Build .exe with pkg (if available)
  console.log('Building .exe with pkg...');
  try {
    // We target win-x64
    execSync('npx pkg launcher.js --target node18-win-x64 --output okr-tool.exe', { cwd: distDir, stdio: 'inherit' });
    console.log('SUCCESS: okr-tool.exe created in dist folder.');
  } catch (err) {
    console.error('FAILED to build .exe. You may need to run "npm install -g pkg".');
    console.log('Falling back: You can still use "node launcher.js" or point NSSM to "node dist/apps/web/server.js"');
  }

  console.log('--- Packaging Complete ---');
}

// Ensure fs-extra is available
try {
  require.resolve('fs-extra');
  packageApp();
} catch (e) {
  console.log('Installing fs-extra for packaging script...');
  execSync('npm install fs-extra', { stdio: 'inherit' });
  packageApp();
}
