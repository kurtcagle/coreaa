var sem = require("/MarkLogic/semantics.xqy");

class NS {
  constructor(newMap){
    this.map = newMap
  }
  get defaultMap(){return {"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdfs":"http://www.w3.org/2000/01/rdf_schema#","xsd":"http://www.w3.org/2001/XMLSchema#","sh":"https://www.w3.org/ns/shacl"}}  
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
  parseTurtleToMap(path){
    let doc = fn.doc(path).toString()
    let re = ".*@prefix[ ]+([A-z0-9_]+):[ ]+<(.+?)>.*"
    let rawLines = doc.split("\n")
    let lines = rawLines.filter((line)=>fn.matches(line,re)).map((line)=>fn.replace(line,re,'"$1":"$2"'))
    let nsJSON = "{"+lines.join(",\n")+"}"
    this.map = JSON.parse(nsJSON)
   }
namespace(prefix){
    return this.internalMap[prefix]
  }
prefix(namespace){
    return this.inverseMap[namespace]    
  }
} 

module.exports.NS = NS

