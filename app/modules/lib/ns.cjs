const fs= require('fs')
class NS {
  constructor(newMap){
    this.map = newMap
  }
  get defaultMap(){return {
    "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
    "xsd":"http://www.w3.org/2001/XMLSchema#",
    "sh":"http://www.w3.org/ns/shacl#"}}  
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
    let map = this.internalMap
    let regex = /([A-z0-9_]+):([A-z0-9_]+)/
    if (regex.test(curie)){
      let [prefix,local] = curie.split(":")
      let namespace = map[prefix]
      if (namespace){
        return namespace+local
      }
    }
    else {return curie}
  }
  curie(ciri){
    let map = this.inverseMap
    let regex = /http:\/\/([A-z0-9_]+)\.([A-z0-9_]+)/
    if (regex.test(ciri)){
      let [namespace,local] = ciri.split("#")
      namespace += "#"
      let prefix = map[namespace]
      if (prefix){
        return prefix+":"+local
      }
    }
    else {return ciri}
  }
  async load(path="./app/data/json/ns.json"){
    try {
      const data = fs.readFileSync(path, 'utf8');
      // console.log(data);
      this.map = JSON.parse(data);
    } catch (err) {
      console.error(err);
    }
  }
  save(path="./app/data/json/ns.json"){
    let json = JSON.stringify(this.map)
    fs.writeFileSync(path,json)
//    xdmp.documentInsert(path,json)
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
module.exports = NS
