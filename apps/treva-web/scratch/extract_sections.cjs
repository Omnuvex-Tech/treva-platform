const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\ASUS\\Desktop\\treva-platform\\apps\\treva-web\\app\\components\\Navbar\\home.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const outputDir = 'c:\\Users\\ASUS\\Desktop\\treva-platform\\apps\\treva-web\\app\\components\\Home';

function extract(name, start, end) {
    let block = content.substring(start, end).trim();
    
    // Basic cleanup for JSX components
    const componentContent = `
import React from 'react';
import Link from 'next/link';
import "./styles/home.css";

export const ${name} = () => {
    return (
        ${block}
    );
};
`;
    fs.writeFileSync(path.join(outputDir, `${name}.tsx`), componentContent);
}

// Based on previous analysis
const navbarStart = 224;
const heroStart = 6407;
const pulseStart = 13035;
const servicesStart = 130032;
const officesStart = 322645;
const footerStart = 326207;

// Find closing tags more accurately if possible, or just use next start
// Navbar ends before Hero
extract('HomeNavbar', navbarStart, heroStart);

// Hero ends before MainStart (9608) or SectionHeader (9639)
extract('HomeHero', heroStart, 9608);

// Pulse starts at 13035. What's before it? SectionHeader?
// Let's take from SectionHeader start to Services start
extract('HomeHeader', 9639, pulseStart);

// Pulse from 13035 to Services
extract('HomePulse', pulseStart, servicesStart);

// Services from 130032 to Offices
extract('HomeServices', servicesStart, officesStart);

// Offices from 322645 to Footer
extract('HomeOffices', officesStart, footerStart);

// Footer from 326207 to the end (excluding the closing tags of the page)
const footerEnd = content.lastIndexOf('</footer>') + 9;
extract('HomeFooter', footerStart, footerEnd);

console.log('Extraction complete');
