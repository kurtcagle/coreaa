import { NS } from '/lib/ns.mjs';
import { Node} from '/lib/node.mjs';
import { Graph} from '/lib/graph.mjs';
var sem = require("/MarkLogic/semantics.xqy"); 


CharacterToString() { 
        let lc = (expr)=> (this.g.label(expr)+"").toLowerCase()
        return `${this.label} is a ${lc(this.gender)} ${lc(this.type)} with ${lc(this.hairColor)} hair and ${lc(this.eyeColor)} eyes.`;
    }