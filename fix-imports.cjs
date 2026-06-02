const fs = require('fs');
const path = require('path');

const files = [
  'src/components/ui/grading-sheet/GradingMainContent.jsx',
  'src/components/ui/grading-sheet/GradingSheetHeader.jsx',
  'src/components/ui/grading-sheet/GradingSheetTableHeader.jsx',
  'src/components/ui/grading-sheet/GradingSheetTableBody.jsx',
  'src/components/ui/grading-sheet/GradingSheetFooter.jsx',
  'src/components/ui/grading-sheet/StpErrorBanner.jsx',
];

for (const rel of files) {
  const p = path.join('front-end', rel);
  if (!fs.existsSync(p)) {
    console.log('missing', p);
    continue;
  }
  let c = fs.readFileSync(p, 'utf8');
  const n = c.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils['"]/g, 'from "@/lib/utils"');
  if (c !== n) {
    fs.writeFileSync(p, n);
    console.log('fixed', rel);
  } else {
    console.log('nochange', rel);
  }
}
