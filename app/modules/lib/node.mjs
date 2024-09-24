//import { NS } from '/lib/ns.mjs';
var sem = require("/MarkLogic/semantics.xqy");
let defaultGraphIRI = "http://marklogic.com/semantics#default-graph"
export class Node {
  constructor(curie,ns,graph=null){
    this.curie = curie // given as curie, extend to handle IRIe
    this.defaultGraph = ns.curie(defaultGraphIRI)
    this.graph = graph?graph:this.defaultGraph // given as curie, indicates the graph to search, use default graph if not given
    this.ns = ns
    this.updateNode(this.curie,this.ns,this.graph)
   }
  updateNode(curie,ns,graph=this.graph){
    let prolog = ns.sparql;
    this.curie = curie;
    this.ns = ns?ns:this.ns;
    this.graph = graph;
    let defaultGraph = this.defaultGraph;
    //this.subject = subject // given as curie, extend to handle IRI
    //this.graph = graph
    let query = `
${prolog}
select ?s ?label (group_concat(?prop; separator="|") as ?props) (group_concat(?o; separator="|") as ?values) ${graph===defaultGraph?'':`from ${graph}`} where {
    bind(${curie} as ?s)
    ?s ?prop ?o.
    optional {
      ?s ?labelPred ?label.
      ?labelPred rdfs:subPropertyOf* rdfs:label.
      }
    } group by ?s`
    this.query = query
    let results = sem.sparql(query).toArray()
    if (results.length==0){return}
    let node = results[0];
    node.curie = sem.curieShorten(node.s,ns.map)
    let props = node.props.split("|")
    let values = node.values.split("|")
    let thisNode = this;
//    node.properties = []
    props.forEach((prop,index)=>{
      let value = values[index].startsWith('http')?sem.curieShorten(values[index],ns.map):values[index]
      let cprop = sem.curieShorten(prop,ns.map).split(':')[1];
      node[cprop]=value
//      node.properties.push(cprop)
      })
   Object.assign(this,node)
   delete this.props
   delete this.values
  }
  getLabel(curie=this.curie){
    let ns = this.ns;
    let prolog = ns.sparql;
    let graph = this.graph;
    let defaultGraph = this.defaultGraph;
    var query = `
      ${prolog}
      select distinct ?label ${graph===defaultGraph?'':`from ${graph}`}  where {
          values ?s {${curie}}
          ?s ?labelPred ?label.
          ?labelPred rdfs:subPropertyOf* rdfs:label.
        } order by ?label`
  let nodeList=sem.sparql(query).toArray();
  return nodeList.length>0?nodeList[0].label:curie
  }

  children(predicate="?predicate",filter=(item)=>true,limit=10,page=1){
    let ns = this.ns
    let prolog = ns.sparql;
    let curie = this.curie;
    let graph = this.graph;
    let defaultGraph = this.defaultGraph;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type ${graph===defaultGraph?'':`from ${graph}`} where {
          ?s ${predicate} ${curie}.
          ?s rdf:type ?type. 
          optional {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }
        } order by ?label`
  this.query = query
  let childNodes =sem.sparql(query).toArray();
  childNodes.forEach((child)=>{child.curie = sem.curieShorten(child.s,ns.map)})
  return childNodes.filter(filter)
  }
  parents(predicate="?predicate",filter=(item)=>true,limit=10,page=1){
    let ns = this.ns;
    let prolog = ns.sparql;
    let curie = this.curie;
    let graph = this.graph;
    let defaultGraph = this.defaultGraph;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type  ${graph===defaultGraph?'':`from ${graph}`}  where {
          ${curie} ${predicate} ?s.
          ?s rdf:type ?type. 
          optional {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }
        } order by ?label`
  let parent=sem.sparql(query).toArray();
  parent.forEach((child)=>{child.curie = sem.curieShorten(child.s,ns.map)})
  return parent.filter(filter)
  }
  siblings(predicate="?predicate",filter=(item)=>true,limit=10,page=1){
    let ns = this.ns;
    let prolog = ns.sparql;
    let curie = this.curie;
    let graph = this.graph;
    let defaultGraph = this.defaultGraph;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type  ${graph===defaultGraph?'':`from ${graph}`}  where {
          ?s ${predicate} ?o.
          ?s rdf:type ?type. 
          optional {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }
        } order by ?label`
    let sibling=sem.sparql(query).toArray();
    sibling.forEach((child)=>{child.curie = sem.curieShorten(child.s,ns.map)})
    return sibling.filter(filter)
    }    
  shacl(curie=this.curie){
      let ns = this.ns;
      let prolog = ns.sparql;
      let graph = this.graph;
      let defaultGraph = this.defaultGraph;
      var query = `
        ${prolog}
        select distinct ?label ?type ?plural (group_concat(?prop) as ?props)  ${graph===defaultGraph?'':`from ${graph}`}  where {
            ${curie} rdf:type ?type.
            ?type a sh:NodeShape. 
            optional {
              ?type sh:name ?label.
            }
            optional {
              ?type sh:plural ?plural.
            }
            ?type sh:property ?prop.
        } order by ?label`
      let constraints=sem.sparql(query).toArray()[0];
      let props = constraints.props.split(" ").map((prop)=>sem.curieShorten(prop,ns.map)).map((prop)=>new Node(prop,ns,graph))
      //constraints.forEach((constraint)=>{constraint.curie = sem.curieShorten(constraint.type,ns.map)})
      constraints.properties = props
      delete constraints.props
      
  }

  search(q,userFilter=(item)=>true,page=1,limit=1000){
    let ns = this.ns;
    let prolog = ns.sparql;
    let graph = this.graph;
    let defaultGraph = this.defaultGraph;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type ${graph===defaultGraph?'':`from ${graph}`} where {
        {{
          ?s ?p ?o.
          ?s ?matchPred ?match.
        } UNION {
          ?s ?p1 ?s1. 
          ?s1 ?p2 ?o.
          ?s1 ?labelPred ?match.
        }}
        ?s ?labelPred ?label.
        ?s rdf:type ?type. 
          {{?matchPred rdfs:subPropertyOf* rdfs:label.} union {?matchPred rdfs:subPropertyOf* rdfs:comment.}}    
          {{?labelPred rdfs:subPropertyOf* rdfs:label.}}    
          filter (contains(lcase(str(?match)),"${q.toLowerCase()}"))
          bind(strlen(str(?match)) as ?len)
        } order by ?label`
    this.query = query
    let results =sem.sparql(query).toArray();
    results.forEach((result)=>{result.curie = sem.curieShorten(result.s,ns.map)})
    return results.filter(userFilter).filter((result,index)=>index<limit*page && index>=limit*(page-1))
  }

  searchExt(q,resolve=true,userFilter=(item)=>true,page=1,limit=10){
    userFilter = userFilter?userFilter:(item)=>true
    let ns = this.ns
    let graph = this.graph
    let results = this.search(q)
    if (resolve){
      results = results.map((result)=>(new Node(result.curie,ns,graph)).resolve())
    }
    else {
      results = results.map((result)=>(new Node(result.curie,ns,graph)).json())
    }
    return results.filter(userFilter).filter((result,index)=>index<limit*page && index>=limit*(page-1))
  }



  toString(){
    return `This is a ${this.label}.`
  }
  toJSONString(){
    return JSON.stringify(this)
  }
  json(){
    let obj = Object.assign({},this)
    delete obj.query
    delete obj.ns
    delete obj.defaultGraph
    delete obj.inverseMap
    delete obj.internalMap
    return obj
  }
  resolve(){
    let baseObj = this.json()
    let obj = {};
    let keys = Object.keys(this.json())
    let me = this;
    keys.forEach((key)=>{
      obj[key] = me.ns.isCurie(baseObj[key]) && key != "curie"?me.getLabel(baseObj[key]):baseObj[key]
    })
    return obj
  }
}