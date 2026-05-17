const fs = require('fs');
let file = fs.readFileSync('apps/treva-web/app/components/Projects/projects.tsx', 'utf8');

const regexes = [
  { match: 'Panorama by Elie Saab', regex: /(<div className="heading-style-h3 text-color-blue400">Panorama by Elie Saab<\/div>)/ },
  { match: 'Reportage Heights', regex: /(<div className="heading-style-h3 text-color-blue400">Reportage Heights<\/div>)/ },
  { match: 'Arabian Ranches', regex: /(<div className="heading-style-h3 text-color-blue400">Arabian Ranches<\/div>)/ },
  { match: 'Marina Village', regex: /(<div className="heading-style-h3 text-color-blue400">Marina Village<\/div>)/ },
  { match: 'Villa Siena', regex: /(<div className="heading-style-h3 text-color-blue400">Villa Siena<\/div>)/ },
  { match: 'Sabah Residence', regex: /(<div className="heading-style-h3 text-color-blue400">Sabah Residence<\/div>)/ }
];

file = file.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<div className="img-cover"><\/div>\s*<\/div>\s*<div className="projects_content-wrap">\s*<div className="heading-style-h3 text-color-blue400">([^<]+)<\/div>/g, 
  (match, title) => {
    return `</div>
                                  </div>
                                  <div className="projects_caption">${title}</div>
                                </div>
                                <div className="img-cover"></div>
                              </div>
                              <div className="projects_content-wrap">
                                <div className="heading-style-h3 text-color-blue400">${title}</div>`;
  }
);

fs.writeFileSync('apps/treva-web/app/components/Projects/projects.tsx', file);
