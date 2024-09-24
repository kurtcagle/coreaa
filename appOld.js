//import {main} from './app/sparqlQueryTest.js';
//main();
import{NS} from './app/modules/lib/ns.js';
import{Graph} from './app/modules/lib/graph.js';
async function main(){
    let ns = new NS();
    ns.load()
    let graph = new Graph(ns)
    let results = await graph.list("Platform:")
    console.log(results)
    return results
}

main();