'use strict';

const sem = require('/MarkLogic/semantics.xqy');

export class Terrapin {
    constructor() {
        this.prefixes = new Map();
      }
    

     convertToTurtle(terrapinStr) {
        let mlRegex = /\[(?![^\[]*\[)(([^\]]+)=>([^\]]+))\]/
        //let mlRegex = /\[(.*?)=>(.*?)\]/
          let regex = new RegExp(mlRegex)
          let index = 0
          while(fn.contains(terrapinStr,'=>')){
            index++
            let tpnStr = new String(terrapinStr)
        //    let [expr,namedNode,preds] = tpnStr.match(regex)?tpnStr.match(regex):['','','']
            let matched = tpnStr.match(regex)
            let expr = matched[0]
            let namedNode = matched[2]
            let preds = matched[3]
            triples.push(`${fn.normalizeSpace(namedNode)} ${fn.normalizeSpace(preds)}.`)
            terrapinStr = tpnStr.replace(regex,namedNode)
            if (index>100 || expr == ""){break}
          }
          //return terrapinStr
          return `${index} ${terrapinStr}\n${triples.join('\n')}`
        }

      processTriple(triple) {
        // Check for named node expressions
        const namedNodeRegex = /\[(\s*:\w+\s*=>[^\[]+?)\]/g;
        let match;
        let processedTriple = triple;
        let additionalTriples = [];
    
        while ((match = namedNodeRegex.exec(triple)) !== null) {
          const [fullMatch, namedNodeContent] = match;
          const [nodeName, ...rest] = namedNodeContent.split('=>');
          const nodeContent = rest.join('=>').trim();
    
          // Replace the named node expression with just the node name
          processedTriple = processedTriple.replace(fullMatch, nodeName.trim());
    
          // Generate additional triples for the named node
          const nodeTriples = nodeContent.split(';').map(pair => 
            `${nodeName.trim()} ${pair.trim()}`
          );
          additionalTriples.push(...nodeTriples);
        }
    
        // Handle unnamed brace expressions (keep them intact)
        processedTriple = processedTriple.replace(/\[(.*?)\]/g, (match, content) => {
          if (!content.includes('=>')) return match;
          return match;
        });
    
        return [processedTriple, ...additionalTriples].join(' .\n') + ' .';
      }
      }


//exports.Terrapin = Terrapin

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