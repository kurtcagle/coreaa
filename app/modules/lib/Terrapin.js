'use strict';

const sem = require('/MarkLogic/semantics.xqy');

class Terrapin {
  constructor() {
    this.prefixes = {};
  }

  addPrefix(prefix, uri) {
    this.prefixes[prefix] = uri;
  }

  convertTerrapinToTurtle(terrapinCode) {
    let turtleCode = '';
    const lines = terrapinCode.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('@prefix')) {
        turtleCode += this.handlePrefix(line);
      } else if (line.includes('tpn:property')) {
        turtleCode += this.handleSingletonProperty(line);
      } else if (line.includes('=>')) {
        turtleCode += this.handleNamedNodeExpression(line);
      } else {
        turtleCode += line + '\n';
      }
    }
    return turtleCode;
  }

  handlePrefix(line) {
    const match = line.match(/^@prefix\s+(\w+):\s*<(.+)>/);
    if (match) {
      this.prefixes[match[1]] = match[2];
      return line + '\n';
    }
    return '';
  }

  handleSingletonProperty(line) {
    const match = line.match(/(\S+)\s+\[(\S+)\s+=>\s+tpn:property\s+:(\S+)\]\s+(\S+)\s*\./);
    if (match) {
      const subject = match[1];
      const predicate = ':' + match[3];
      const object = match[4];
      return `${subject} ${predicate} ${object} .\n`;
    }
    return '';
  }

  handleNamedNodeExpression(line) {
    const match = line.match(/(\S+)\s+(\S+)\s+\[(\S+)\s+=>\s+(.+)\]\s*\./);
    if (match) {
      const subject = match[1];
      const predicate = match[2];
      const nodeName = match[3];
      const rest = match[4];
      let turtle = `${subject} ${predicate} ${nodeName} .\n`;
      const nestedStatements = rest.split(';').map(s => s.trim());
      for (let statement of nestedStatements) {
        const parts = statement.split(/\s+/);
        const pred = parts[0];
        const obj = parts.slice(1).join(' ');
        turtle += `${nodeName} ${pred} ${obj} .\n`;
      }
      return turtle;
    }
    return '';
  }
}

exports.Terrapin = Terrapin

// Example usage:
/*
const terrapinCode = `
@prefix : <http://example.org/ns#> .
@prefix tpn: <https://terrapin.ai/ns#> .

:john [:starsAs1 => tpn:property :StarsAs1] :Superguy .

:liz :married [:richard => a :Person] .
`;

const converter = new TerrapinConverter();
converter.addPrefix('tpn', 'https://terrapin.ai/ns#');
const turtleCode = converter.convertTerrapinToTurtle(terrapinCode);
console.log(turtleCode);
*/