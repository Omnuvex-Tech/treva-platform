const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ASUS\\Desktop\\trevaa\\treva-next\\apps\\web\\app\\page.tsx', 'utf8');
const matches = content.match(/section_[a-zA-Z0-9_-]+/g);
console.log([...new Set(matches)]);
