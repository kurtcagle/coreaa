declareUpdate();
//import { NS } from '/lib/ns.mjs';
let NS = require("/lib/ns.js").NS
var sem = require("/MarkLogic/semantics.xqy");
var graph = sem.iri("http://thecaglereport.com/ns/comics/Graph#")
sem.graphDelete(graph)
let triples = sem.rdfGet("file:///C:/Users/kurtc/Downloads/superhero.ttl", ["turtle"])
sem.graphInsert(graph, triples)
let shaclTriples = sem.rdfGet("file:///C:/Users/kurtc/Downloads/Superhero.shacl.ttl", ["turtle"])
var SHACLgraph = sem.iri("http://thecaglereport.com/ns/comics/Graph#SHACL")
sem.graphDelete(SHACLgraph)
sem.graphInsert(SHACLgraph, shaclTriples)
//sem.graphDelete(graph)