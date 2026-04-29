const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ASUS\\Desktop\\trevaa\\treva-next\\apps\\web\\app\\page.tsx', 'utf8');

const sections = [
    'section_header',
    'section_services',
    'section_projects-prev',
    'section_live',
    'section_logos',
    'section_offices',
    'section_footer'
];

sections.forEach(s => {
    const searchStr = 'className="' + s;
    const startIdx = content.lastIndexOf('<section', content.indexOf(searchStr));
    
    if (startIdx !== -1) {
        // Find the matching </section>
        // Simple heuristic: find next </section> after the class occurrence
        const classPos = content.indexOf(searchStr);
        const endIdx = content.indexOf('</section>', classPos) + 10;
        fs.writeFileSync(`c:\\Users\\ASUS\\Desktop\\treva-platform\\${s}.txt`, content.substring(startIdx, endIdx));
    }
});
