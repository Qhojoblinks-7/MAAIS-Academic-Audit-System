const { execSync } = require('child_process');
const root = process.cwd();

const components = [
  'textarea',
  'slider',
  'radio-group',
  'command',
  'empty',
];

console.log('Installing remaining shadcn components...\n');

for (const name of components) {
  try {
    const result = execSync(`npx shadcn@latest add ${name} -y`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
    });
  } catch (err) {
    const message = err.stdout || err.message || '';
    const skipped = message.includes('Skipped') || message.includes('identical');
    if (skipped) {
      console.log(`  ${name}: already exists, skipped`);
      continue;
    }
    console.error(`  ${name}: FAILED - ${message.slice(0, 200)}`);
    process.exit(1);
  }
}

console.log('\n✓ Final batch complete');
