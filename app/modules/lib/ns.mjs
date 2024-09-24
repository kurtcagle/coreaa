var sem = require("/MarkLogic/semantics.xqy");

export class NS {
  constructor(newMap){
    this.map = newMap
  }
  get defaultMap(){return {
    "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
    "xsd":"http://www.w3.org/2001/XMLSchema#",
    "sh":"http://www.w3.org/ns/shacl#",
    "marklogic":"http://marklogic.com/semantics#",
  }}  
  get map(){
    return this.internalMap
  }
  set map(newMap={}){
    this.internalMap = newMap;
    this.addToMap(this.defaultMap)
    this.invertMap();
  }
  
  invertMap(){
    let entries = Object.entries(this.internalMap)
    let inverseMap = {}
    entries.forEach((entry)=>inverseMap[entry[1]]=entry[0])
    this.inverseMap = inverseMap
  }
 get turtle(){
    return (Object.entries(this.internalMap).map((entry)=>`@prefix ${entry[0]}: <${entry[1]}> .`).join("\n"))+"\n\n"
  }
 get sparql(){
    return (Object.entries(this.internalMap).map((entry)=>`prefix ${entry[0]}: <${entry[1]}> `).join("\n"))+"\n\n"
  }
  ciri(curie){
    return sem.curieExpand(curie, this.internalMap)
  }
  curie(ciri){
    return sem.curieShorten(ciri, this.internalMap)
  }
  isCurie(curie){
    if (typeof curie !== 'string'){return false}
    let prefix = curie.split(":")[0]
    return prefix in this.internalMap
  }
  load(path){
    this.map = JSON.parse(fn.doc(path).toString())
  }
  save(path){
    let json = xdmp.toJSON(this.map)
    xdmp.documentInsert(path,json)
  }
  addToMap(map2){
    Object.entries(map2).forEach((entry)=>this.internalMap[entry[0]]=entry[1])
  }
  parseTurtleFileToMap(path){
    let doc = fn.doc(path).toString()
    let re = ".*@prefix[ ]+([A-z0-9_]+):[ ]+<(.+?)>.*"
    let rawLines = doc.split("\n")
    let lines = rawLines.filter((line)=>fn.matches(line,re)).map((line)=>fn.replace(line,re,'"$1":"$2"'))
    let nsJSON = "{"+lines.join(",\n")+"}"
    this.map = JSON.parse(nsJSON)
   }
   parseTurtleToMap(turtle){
    let doc = turtle
    let re = ".*@prefix[ ]+([A-z0-9_]+):[ ]+<(.+?)>.*"
    let rawLines = doc.split("\n")
    let lines = rawLines.filter((line)=>fn.matches(line,re)).map((line)=>fn.replace(line,re,'"$1":"$2"'))
    let nsJSON = "{"+lines.join(",\n")+"}"
    return JSON.parse(nsJSON)
   }

namespace(prefix){
    return this.internalMap[prefix]
  }
prefix(namespace){
    return this.inverseMap[namespace]    
  }
serialize(turtle){
  let oldMap = this.parseTurtleToMap(turtle)
  let ns2 = new NS(oldMap)
  let inMap2 = ns2.inverseMap
  let inMap = this.inverseMap
  let prefixMap = {}
  Object.keys(inMap2).forEach((nsKey)=>prefixMap[inMap2[nsKey]]=inMap[nsKey])
  let prefixKeys =Object.keys(prefixMap)
  prefixKeys.sort((a,b)=>b.length - a.length)
  prefixKeys.forEach((key)=>{let regex = new RegExp(key+":");turtle = turtle.split(regex).join(prefixMap[key]+":")})
  return turtle
}

}

