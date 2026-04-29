const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\ASUS\\Desktop\\treva-platform\\apps\\treva-web\\app\\components\\Navbar\\home.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const markers = [
    { name: 'Services', tag: 'className="section_services"' },
    { name: 'Projects', tag: 'className="section_projects"' },
    { name: 'Offices', tag: 'className="section_offices"' },
    { name: 'Contact', tag: 'className="section_contact"' },
    { name: 'Footer', tag: '<footer' }
];

markers.forEach(m => {
    const start = content.indexOf(m.tag);
    if (start !== -1) {
        console.log(`Found ${m.name} at ${start}`);
    } else {
        console.log(`Could not find ${m.name}`);
    }
});
