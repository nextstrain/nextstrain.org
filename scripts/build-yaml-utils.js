const yaml = require('js-yaml');
const fs = require('fs');

function dumpYaml(content, path) {
  try {
    fs.writeFileSync(path, yaml.dump(content), 'utf8');
  } catch (e) {
    console.log(`There was an error writing ${path}.`);
    console.log(e);
    process.exit(2);
  }
}

function getYaml(buildsFilename) {
  let content;
  try {
    content = yaml.load(fs.readFileSync(buildsFilename, 'utf8'));
  } catch (e) {
    console.log(`There was an error reading ${buildsFilename}. Please ensure it exists and it is valid YAML.`);
    console.log(e);
    process.exit(2);
  }
  if (!content.builds) {
    console.log(`The builds YAML was missing a top-level entry for "builds".`);
    process.exit(2);
  }
  return content.builds;
}

function blockDefinesBuild(block) {
  return block.geo && block.name && block.url && block.coords;
}

module.exports = {getYaml, dumpYaml, blockDefinesBuild};
