const fs = require('fs');
const yaml = require('js-yaml');

const rendering = require('./src/rendering')({
  'scale': 0.05,
  'h-spacing': 1,
  beautify: true,
});

const g = [];

['default', 'line', 'double', 'split-double', 'dashed', 'dashed-line', 'dashed-double', 'dashed-split-double'].forEach((type, i) => {
  g.push({
    'g': {
      '_attributes': {
        'transform': `translate(${(i % 2) * 1536 + 256} ${Math.floor(i / 2) * 712 + 150})`
      },
      'path': {
        '_attributes': {
          'd': rendering.getLinkPath(type, 2)
        }
      },
      'text': {
        '_attributes': {
          'x': 512,
          'y': 0,
          'font-family': 'Verdana',
          'font-size': 120,
          'text-anchor': 'middle'
        },
        '_text': type
      }
    }
  });
});

fs.writeFileSync(`preview/links.svg`, rendering.toXML({'g': g}, {w: 1536 * 2, h: 4 * 712 + 100}), {encoding: 'utf-8'});

const faDiagrams = require('./src/index');

let readme = fs.readFileSync('README.md', {encoding: 'utf-8'});

const generatePreview = (name, exportSample, data) => {
  const jsRegex = new RegExp(`\\/\\/ data: ${name}([\\s\\S](?!};))*\n};`, 'm');
  const jsonRegex = new RegExp(`<!-- data: ${name} -->\\n\`\`\`json([\\s\\S](?!\`\`\`))*`, 'm');
  const yamlRegex = new RegExp(`<!-- data: ${name} -->\\n\`\`\`yaml([\\s\\S](?!\`\`\`))*`, 'm');

  console.log('readme : ', readme.length);

  // JS object
  if (jsRegex.test(readme)) {
    console.log(`preview ${name}: found JS object`);
    console.log(jsRegex.exec(readme))
    readme = readme.replace(jsRegex, `// data: ${name}\nconst data = ${JSON.stringify(data, null, 2)}`);
  }
  // JSON
  if (jsonRegex.test(readme)) {
    console.log(`preview ${name}: found JSON definition`);
    readme = readme.replace(jsonRegex, `<!-- data: ${name} -->
\`\`\`json
${JSON.stringify(data, null, 2)}`);
  }
  // YAML
  if (yamlRegex.test(readme)) {
    console.log(`preview ${name}: found YAML definition`);
    readme = readme.replace(yamlRegex, `<!-- data: ${name} -->
\`\`\`yaml
${yaml.safeDump(data)}`);
  }

  if (exportSample)
    fs.writeFileSync('docs/sample.yml', yaml.safeDump(data), {encoding: 'utf-8'});
  fs.writeFileSync(`preview/${name}.svg`, faDiagrams.compute(data), {encoding: 'utf-8'});
};

generatePreview('sample', false, {
  nodes: [
    {
      name: 'node1',
      icon: 'laptop-code',
      color: '#4E342E',
      bottom: 'my app'
    },
    {
      name: 'node2',
      icon: 'globe',
      color: '#455A64',
      bottom: 'world'
    }
  ],
  links: [
    {
      from: 'node1',
      to: 'node2',
      color: '#333333',
      top: {icon: 'envelope'},
      bottom: '"hello"'
    }
  ]
});

generatePreview('example1', false, {
  nodes: [
    {
      name: 'node1',
      icon: 'laptop-code',
      color: '#4E342E',
      bottom: 'my app'
    },
    {
      name: 'node2',
      icon: 'globe',
      color: '#455A64',
      bottom: 'world'
    }
  ],
  links: [
    {
      from: 'node1',
      to: 'node2',
      color: '#333333',
      top: {icon: 'envelope'},
      bottom: '"hello"'
    }
  ]
});

fs.writeFileSync('README.md', readme, {encoding: 'utf-8'});