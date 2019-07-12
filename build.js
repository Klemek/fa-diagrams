const fs = require('fs');
const path = require('path');
const svn = require('node-svn-ultimate');
const rimraf = require('rimraf');

const FA_SVG_FOLDER_URL = 'https://github.com/FortAwesome/Font-Awesome.git/trunk/svgs';

const buildDir = path.join(__dirname, 'build');

/**
 * Get all files path inside a given folder path
 * @param dir
 * @param cb
 */
const getFileTree = (dir, cb) => {
  let list = [];
  let remaining = 0;
  fs.readdir(dir, {withFileTypes: true}, (err, items) => {
    if (err)
      return cb(err);
    items.forEach((item) => {
      if (item.isDirectory()) {
        remaining++;
        getFileTree(path.join(dir, item.name), (err, out) => {
          if (err)
            return cb(err);
          list.push(...out);
          remaining--;
          if (remaining === 0)
            cb(null, list);
        });
      } else {
        list.push(path.join(dir, item.name));
      }
    });
    if (remaining === 0)
      cb(null, list);
  });
};

console.log('Building fa-diagrams svg list');

if (fs.existsSync(buildDir)) {
  console.log('\tCleaning build directory...');
  rimraf.sync(buildDir);
} else {
  console.log('\tCreating build directory...');
}

fs.mkdirSync(buildDir);

console.log('\tFetching Font-Awesome SVGs from repository...');

const svgDir = path.join(buildDir, 'svgs');

svn.commands.checkout(FA_SVG_FOLDER_URL, svgDir, (err) => {
  if (err)
    throw err;

  rimraf.sync(path.join(svgDir, '.svn'));

  console.log('\tReading SVGs...');

  getFileTree(svgDir, (err, list) => {
    if (err)
      throw err;

    const svgs = {};

    let count = 0;

    list.filter(x => /\.svg$/.test(x)).forEach(svgFile => {
      const data = fs.readFileSync(svgFile, {encoding: 'utf8'});
      const match1 = data.match(/viewBox="0 0 (\d+) 512"/);
      if (!match1)
        return console.warn(`\t\tInvalid viewBox match for "${svgFile}"`);
      const match2 = data.match(/path d="([^"]+)"/);
      if (!match2)
        return console.warn(`\t\tInvalid path for "${svgFile}"`);

      const type = path.basename(path.dirname(svgFile));
      const name = path.basename(svgFile, '.svg');

      if (!svgs[type])
        svgs[type] = {};

      svgs[type][name] = {
        path: match2[1],
        width: parseInt(match1[1])
      };

      count++;
    });

    console.log(`\t${count} SVGs loaded`);
    Object.keys(svgs).forEach(type => {
      console.log(`\t\t${type}: ${Object.keys(svgs[type]).length} SVGs`);
    });

    const output = path.join(__dirname, 'svg_list.json');

    fs.writeFileSync(output, JSON.stringify(svgs, null, 4), {encoding: 'utf8'});
    console.log(`\tSVG list saved at "${output}"`);

  });
});
