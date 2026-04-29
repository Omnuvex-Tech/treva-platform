const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\ASUS\\Desktop\\treva-platform\\apps\\treva-web\\app\\components\\Navbar\\home.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// A very simple split for demonstration. 
// In a real scenario, we'd use a parser, but since it's Webflow export, 
// we can look for key tags.

const parts = [];
let current = content;

// Look for common blocks
const markers = [
    { name: 'Navbar', tag: '<div data-animation="default" className="nav' },
    { name: 'Hero', tag: '<header className="header"' },
    { name: 'MainStart', tag: '<main className="main-wrapper">' },
    { name: 'SectionHeader', tag: '<section className="section_header">' },
    { name: 'PulseCarousel', tag: '<div className="live_carousel">' },
];

// Let's just find where these tags start
markers.sort((a, b) => current.indexOf(a.tag) - current.indexOf(b.tag));

markers.forEach((m, i) => {
    const start = current.indexOf(m.tag);
    if (start !== -1) {
        console.log(`Found ${m.name} at ${start}`);
    } else {
        console.log(`Could not find ${m.name}`);
    }
});

// Actually, let's just try to extract the main blocks manually based on what we saw
const navStart = content.indexOf('<div data-animation="default" className="nav');
const headerStart = content.indexOf('<header className="header"');
const mainStart = content.indexOf('<main className="main-wrapper">');
const footerStart = content.indexOf('<footer'); // Check if there is a footer

console.log({ navStart, headerStart, mainStart, footerStart });
