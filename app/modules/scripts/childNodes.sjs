declareUpdate();
const NS =require('/lib/ns.js').NS; 
const Graph =require('/lib/graph.js').Graph;
const SparqlFunction =require('/lib/sparqlFunction.js').SparqlFunction;
//import { NS } from '/lib/ns.mjs';
//import {SparqlFunction} from '/lib/sparqlFunction.mjs';
let ns = new NS()
ns.load("/json/comics.json")
let g = new Graph(ns)
let trunc = (val)=> fn.substringAfter(val,'/')
//let q = trunc(xdmp.getRequestField("q",""))
//q = q.split("/")[1]
let q = xdmp.getRequestField("q","")
let format = xdmp.getRequestField("format",".md")
let id = xdmp.getRequestField("id","Character:")
let mode = xdmp.getRequestField("mode","strStarts")
format = fn.substringAfter(format,"/")
//curie  = fn.substringAfter(curie,"/")
//curie = fn.upperCase(fn.substring(curie,0,1))+fn.substring(curie,1)
//let mode = trunc(xdmp.getRequestField("mode","strstart")) // strstarts, contains, equals
//owlClass = owlClass.split("/")[1]
let query = `${ns.sparql}
select * where {
    values (?object ?property) {(${id} rdf:type)}
    ?s ?property ?object.
    ?s rdfs:label ?label .
    ${q!=""?`filter(${mode}(lcase(?label),lcase("${q}")))`:''}
} order by ?label limit 20`
 if (format ==".query"){
    xdmp.setResponseContentType("text/plain")
    query
 }
 else {
let sFn = new SparqlFunction(query,ns)
let items = sFn.exec({q:q})
let curie = id
items.params = {q,curie,mode,format}
items.count = items.data.length
if (format == ".json"){
    xdmp.setResponseContentType("text/json")
    items
}
else if (format == ".md"){
    xdmp.setResponseContentType("text/markdown")
    let content = `# ${curie}\n`
    content += items.data.map((item)=>`* [${item.label}](/item.md?id=${item.s})`).join("\n")
    content
}
else if (format == ".query"){
    xdmp.setResponseContentType("text/plain")
    query
}
 }
//let template = (characters)=>`# Characters\n
//${characters.data.map((character)=>`1. ${character.label}`).join("\n")}`
//template(characters)