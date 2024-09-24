var sem = require("/MarkLogic/semantics.xqy");

export class SparqlFunction {
  constructor(sparqlScript,ns,name,doc="",postProcessFnScr=`(arr,params)=>arr`){
    this.build(sparqlScript,ns,name,doc,postProcessFnScr)
  }
  build(sparqlScript,ns,name,doc="",postProcessFnScr=`(arr,obj)=>arr`){
    this.name = name
    this.ns = ns
    this.doc= doc
    this.sparqlScript = sparqlScript
    this.sparqlScriptEx = `${ns.sparql}
    ${sparqlScript}`
    this.fn = (params) => {
        let results = sem.sparql(this.sparqlScriptEx,params);
        return (results != null)?results.toArray():[]
    }
    this.postProcessFnScr = postProcessFnScr
  }

  save(){
    let spUpdate = `
      ${this.ns.sparql}
      delete {
        ?oldFnNode ?p ?o
      }
      insert {
        ?newFnNode a Function: .
        ?newFnNode Function:name ?name .
        ?newFnNode Function:doc ?doc .
        ?newFnNode Function:sparqlScript ?sparqlScript .
        ?newFnNode Function:postProcessFnScr ?postProcessFnScr .
        ?newFnNode Function:updated ?date .
      }
      where {
         bind(bnode() as ?newFnNode)
         optional {
           ?oldFnNode Function:name ?name.
           ?oldFnNode ?p ?o
           }
         bind(now() as ?date)
      }
    `;    
    let params = {name:this.name,doc:this.doc,sparqlScript:this.sparqlScript,postProcessFnScr:this.postProcessFnScr}
    let results = sem.sparqlUpdate(spUpdate,params)
    return (results != null)?results.toArray():[]
  }
  static saveAs(ns,name,spqFn){
    let params = {name:name,doc:spqFn.doc,sparqlScript:spqFn.sparqlScript,postProcessFnScr:spqFn.postProcessFnScr}
    
    let spUpdate = `
      ${ns.sparql}
      delete {
        ?oldFnNode ?p ?o
      }
      insert {
        ?newFnNode a Function: .
        ?newFnNode Function:name ?name .
        ?newFnNode Function:doc ?doc .
        ?newFnNode Function:sparqlScript ?sparqlScript .
        ?newFnNode Function:postProcessFnScr ?postProcessFnScr .
        ?newFnNode Function:updated ?date .
      }
      where {
         bind(bnode() as ?newFnNode)
         optional {
           ?oldFnNode Function:name ?name.
           ?oldFnNode ?p ?o
           }
         bind(now() as ?date)
      }
    `;    
    let params = {name:this.name,doc:this.doc,sparqlScript:this.sparqlScript,postProcessFnScr:this.postProcessFnScr}
    let results = sem.sparqlUpdate(spUpdate,params)
    return (results != null)?results.toArray():[]
  }  
  static load(ns,name){
    let spGetFn = `${ns.sparql}
    select ?fn ?name ?doc ?sparqlScript ?postProcessFnScr ?date where {
        ?fn a Function: .
        ?fn Function:name ?name .
        ?fn Function:doc ?doc .
        ?fn Function:sparqlScript ?sparqlScript .
        ?fn Function:postProcessFnScr ?postProcessFnScr.
        ?fn Function:updated ?date .
        }
    `
    let results = sem.sparql(spGetFn,{name:name})
    results = (results != null)?results.toArray():[]
    let fnData = results[0]
    return fnData != null?new SparqlFunction(fnData.sparqlScript,ns,name,fnData.doc,fnData.postProcessFnScr):[]
  }
 static exists(ns,name){
   let spGetFn = `${ns.sparql}
   select ?fn where {
      ?fn a Function: .
      ?fn Function:name ?name .     
   }`
    let results = sem.sparql(spGetFn,{name:name})
    results = (results != null)?results.toArray():[]
    let fnData = results[0]
    return (fnData != null)   
 }
 static delete(ns,name){
    let spUpdate = `
      ${ns.sparql}
      delete {
        ?oldFnNode ?p ?o
      }
      where {
         optional {
           ?oldFnNode Function:name ?name.
           ?oldFnNode ?p ?o
           }
      }
    `
    let params = {name:name}
    let results = sem.sparqlUpdate(spUpdate,params)
    return (results != null)?results.toArray():[]
  }
     
  exec(params,asCuries=true){
    let ppfScr =this.postProcessFnScr
    let ppf = eval(ppfScr)
    let intermediate = ppf(this.fn(params),params)
    let results = []
    if (asCuries){
    intermediate.forEach((result)=>{
      let obj = new Object()
      for (var [key,value] of Object.entries(result)){
        try{obj[key] = this.ns.curie(value)}catch(e){obj[key] = value}
      }
      results.push(obj)
      })
    }
    else {results = intermediate}
    return {context:this.ns.map, data:results};
  }
  get docs(){return this.doc}
}