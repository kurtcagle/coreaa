import { NS } from '/lib/ns.mjs';
import { Node } from '/lib/node.mjs';
var sem = require("/MarkLogic/semantics.xqy");
export class Graph {
  constructor(ns,graphIRI=sem.defaultGraphIri()){
    this.ns = ns
    this.graphIRI = graphIRI
  }
fromLabel(label){
    let prolog = this.ns.sparql;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type where {
          #?s rdfs:label ?label.
          ?s rdf:type ?type. 
          optional {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }
          filter(contains(lcase(?label),"${label.toLowerCase()}"))
        } order by ?label`
    let nodesRaw=sem.sparql(query).toArray();
    let nodes = nodesRaw.map((node)=>{return {curie:this.ns.curie(node.s),label:node.label,type:this.ns.curie(node.type)}})
    return nodes
  }
  fromDescription(q){
    let prolog = this.ns.sparql;
    var query = `
      ${prolog}
      select distinct ?s ?label ?description ?type where {
          #?s rdfs:label ?label.
          ?s rdf:type ?type. 
          {{
            ?s ?descPred ?description.
            ?descPred rdfs:subPropertyOf* rdfs:comment.
          } UNION {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }}
          filter(contains(lcase(?description),"${q.toLowerCase()}"))
        }  order by ?label`
    let nodesRaw=sem.sparql(query).toArray();
    let nodes = nodesRaw.map((node)=>{return {s:node.s,curie:this.ns.curie(node.s),label:node.label,description:node.description,type:this.ns.curie(node.type)}})
    return nodes
  }
  getClass(curie){
    let prolog = this.ns.sparql;
    var query = `
      ${prolog}
      select ?type where {
          bind(${curie} as ?s)
          ?s rdf:type ?type. 
          optional {
            ?s rdfs:label ?label.
          }
        }  order by ?label`
    let nodesRaw=sem.sparql(query).toArray();
    //let nodes = nodesRaw.map((node)=>{return {curie:this.ns.curie(node.s),label:node.label,type:this.ns.curie(node.type)}})
    return this.ns.curie(nodesRaw[0].type)
  }
  schema(curie){
    let prolog = this.ns.sparql;
    var query = `
      ${prolog}
      select distinct ?label ?type ?plural ?name ?namespace ?prefix where {
          bind(${curie} as ?type)
          ?type a sh:NodeShape. 
          optional {
            ?type sh:name ?label.
          }
          optional {
            ?type sh:plural ?plural.
          }
          optional {
            ?type sh:declare ?declare.
            ?declare sh:namespace ?namespace.
            ?declare sh:prefix ?prefix.
          }
          optional {
            ?type sh:name ?name.
          }
        }  order by ?label`
    let constraints=sem.sparql(query).toArray()[0];
    constraints.type = curie
//    constraints.namespace = constraints.namespace;
//    constraints.prefix = constraints.prefix;
    var propsQuery = `
        ${prolog}
        select distinct ?curie ?path ?plabel ?name ?datatype ?class ?minCount ?maxCount ?node ?nodeKind 
            ?language ?code ?groupOrder ?order where {
            ${constraints.type} rdfs:subClassOf* ?targetClass.
            ?targetClass sh:property ?prop .
            ?prop sh:path ?path.
            ?prop sh:name ?name.
            ?prop rdfs:label ?plabel.
            optional {
                ?prop sh:datatype ?datatype.
            }
            optional {
                ?prop sh:class ?class.
            }
            optional {
                ?prop sh:minCount ?minCount.
            }
            optional {
                ?prop sh:maxCount ?maxCount.
            }
            optional {
                ?prop sh:node ?node.
            }
            optional {
                ?prop sh:nodeKind ?nodeKind.
            }
            optional {
                ?prop sh:group ?group.
                ?group sh:order ?groupOrder1
            }
            optional {
                ?prop sh:order ?order1.
            }
            optional {
                ?prop sh:function ?function.
                ?function sh:language ?language.
                ?function sh:code ?code.
                }
            bind(?prop as ?curie)
            bind(coalesce(?order1,1) as ?order)
            bind(coalesce(?groupOrder1,1) as ?groupOrder)
        } order by ?groupOrder ?order
    `    
    let propsets=sem.sparql(propsQuery).toArray();
    constraints.properties = []
    propsets.forEach((props)=>{
        let obj = {}
        Object.entries(props).forEach((prop)=>{
            obj[prop[0]] = this.ns.curie(""+prop[1])
        })
        constraints.properties.push(obj)
    })
    // Evaluate Javascript code
    propsets.filter((prop)=>prop.code).forEach((prop)=>constraints[prop.name]=eval(prop.code))
    return constraints
  }
  createClassFromString(classString){
        // Create a new function that will act as the constructor for the new class.
        const constructor = new Function(classString);
      
        // Create a new prototype object for the new class.
        const prototype = {};
      
        // Set the constructor property of the prototype object to the new constructor function.
        prototype.constructor = constructor;
      
        // Return the new class object.
        return constructor;
      }
    list(object="?object",predicate="rdf:type",filter=(item)=>true,limit=1000,page=1){
        let prolog = this.ns.sparql;
        let query = `
            ${prolog}
            select ?s ?label ?type ?description where {
                ?s ${predicate} ${object}.
                ?s rdf:type ?type. 
                optional {
                  ?s ?labelPred ?label. 
                  ?labelPred rdfs:subPropertyOf* rdfs:label.
                }
                optional {
                  ?s Entity:description ?description.
                }
              } order by ?label`
        let nodes=this.executeSparql(query);
        nodes.forEach((node)=>{node.curie = this.ns.curie(node.s);node.type = this.ns.curie(node.type)})
        let filteredNodes = nodes.filter(filter);
        let start = (page-1)*limit;
        let end = start+limit;
        return filteredNodes.slice(start,end)
        }

    label(curie){
        if (curie){
            let prolog = this.ns.sparql;
            let query = `{prolog}
            select ?label where {                
                $curie rdfs:label ?label.
                }`
            let nodes=this.executeSparql(query,{curie:curie});
            return (nodes.length>0)?nodes[0].label:query
            }
        else {
            return curie
        }
        return curie
    }
 /*   populate(curie, schema) {
        var resource = {}
        const arr = []
        var g = this
        resource.curie = curie
        let query = `${this.ns.sparql}
        select * where {
            values ?s {${curie}}
            ?s a ?type.
            ?s rdfs:label ?label
        }`
        return this.executeSparql(query).map((result)=>{return {curie:this.ns.curie(result.type),label:this.label(result.type)}})
    }*/

    populate(curie,schema){
      var resource = {}
      var results = []
      for (const property of schema.properties) {
        const query = `${this.ns.sparql}
        SELECT distinct ?curie ?value ?label ?name ?nodeKind ?pcurie ?plabel ?datatype ?class ?groupOrder ?order WHERE { 
          bind("${curie}" as ?curie)
          ${curie} ${property.path} ?value.
        optional {
            ?value ?labelProp ?label.
            ?labelProp rdfs:subPropertyOf* rdfs:label.
        }
        bind(strAfter("${property.nodeKind}","sh:") as ?nodeKind)
        bind("${property.name}" as ?name)
        bind("${property.curie}" as ?pcurie)
        bind("${property.datatype}" as ?datatype)
        bind("${property.plabel}" as ?plabel)
        bind("${property.class}" as ?class)
        bind(${property.groupOrder} as ?groupOrder)
        bind(${property.order} as ?order)
     } order by ?groupOrder ?order`;
        results.push(this.executeSparql(query)); 
      }
      let propertyValues = results.filter((result)=>result.length>0).map((result)=>
         result.map((item)=>{if (item.nodeKind === "IRI"){item.value=this.ns.curie(item.value)};return item}))
//          return results
      return propertyValues
  }
    populateOld(curie, schema) {
        var resource = {}
        const arr = []
        var g = this
        resource.curie = curie
        for (const property of schema.properties) {
          const query = `${this.ns.sparql}
          SELECT ?value ?label WHERE { 
            ${curie} ${property.path} ?value.
            optional {
                ?value rdfs:label ?label.
            }
        }`;
          const results = this.executeSparql(query);

          const values = results.map(result => (fn.startsWith(result.value,"http"))?{curie:this.ns.curie(result.value),label:result.label}:result.value);
          const minCount = parseInt(property.minCount, 10);
          const maxCount = property.maxCount === 'null' ? null : parseInt(property.maxCount, 10);
//          arr.push(property.name)
          resource[property.name] = property.name
          // Define getter and setter based on occurrences
          if (!property.code) {
          Object.defineProperty(resource, property.name, {
            get: function() {
              if (maxCount === 1) {
                let value = values[0] || null;
                return value
            }
               else {
                return values; // Return all values
              }
            },
            set: function(newValue) {
              if (maxCount === 1) {
                values[0] = newValue; // Set the first value
              } else {
                values.push(newValue); // Add to the values array
              }
            }
          })} else {
                arr.push({"name":property.name,code:property.code});
                let g = this.g
                let ns = this.ns
                let me = resource
                let f = new Function(property.code)
                resource[property.name] = Function.apply(f) // Return the first value or null */
                //resource[property.name]=xdmp.invoke("/lib/Character.mjs","CharacterToString")
            
          // Validate the number of values based on minCount and maxCount
          /* if (values.length < minCount || (maxCount !== null && values.length > maxCount)) {
            throw new Error(`Property ${property.name} does not meet the occurrence constraints. Values: ${values.length}, Min: ${minCount}, Max: ${maxCount}`);
          }*/
        }
      }
      return resource;
      }
      executeSparql(query,params={}) {
        // Implement the SPARQL query execution here
        return sem.sparql(query,params).toArray()
      }
        wrapXML(list,schema,namespace=schema.namespace,wrapper="List"){
            let xml = `<${wrapper} xmlns="${namespace}">
${list.map((entry)=>schema.toXML(entry,schema)).join('\n')}
</${wrapper}>`
            return xml
        }      
        wrapJSON(list,schema,wrapper="List"){
            let json = `{"${wrapper}":${list.map((entry)=>schema.toJSON(entry,schema)).join(',')}}`
            return json
        }
        wrapHTML(list,schema,wrapper="article"){
            let html = `<${wrapper}>
${list.map((entry)=>schema.toHTML(entry,schema)).join('\n')}
</${wrapper}>`
            return html
        }
        treeView(parentClass,childClass){
          let ns = this.ns
          let query = `${ns.sparql}
          select distinct ?parent ?child ?parentLabel ?childLabel ?parentClassLabel ?childClassLabel ?parentTypeLabel ?childTypeLabel
              ?parentChildPropLabel ?parentTypePropLabel ?childTypePropLabel  ?parentType ?childType ?parentTypeClass ?childTypeClass ?parentTypeClassLabel ?childTypeClassLabel where {
            values (?parentClass) {(${parentClass})}
            ?parent a ?parentClass .
           ?child a ?childClass .
           ?parent ?parentChildProp ?child .
           ?parentChildProp rdfs:subPropertyOf Entity:child .
           ?parentChildProp sh:name ?parentChildPropLabel .
           ?parent ?parentTypeProp ?parentType .
           ?parentTypeProp rdfs:subPropertyOf Entity:type .
           ?parentTypeProp sh:name ?parentTypePropLabel .
           ?child ?childTypeProp ?childType .
           ?childTypeProp sh:name ?childTypePropLabel .
           ?TypeProp sh:name ?parentTypePropLabel .
           ?parent Entity:name ?parentLabel .
            ?child Entity:name ?childLabel .
            ?parentType Entity:name ?parentTypeLabel .
            ?childType  Entity:name ?childTypeLabel .
            ?parentClass sh:name ?parentClassLabel .
            ?childClass sh:name ?childClassLabel .
            ?parentType a ?parentTypeClass .
            ?childType a ?childTypeClass .
            ?parentTypeClass sh:name ?parentTypeClassLabel .
            ?childTypeClass sh:name ?childTypeClassLabel .
          } order by ?parent ?child
          `
          let result = this.executeSparql(query)
          let statements = []
          result.forEach((item)=>{
          let block = `${ns.curie(item.parent)}[<b>${item.parentClassLabel}</b><br/>${item.parentLabel}]
          ${ns.curie(item.child)}[<b>${item.childClassLabel}</b><br/>${item.childLabel}]
          ${ns.curie(item.parentType)}[<b>${item.parentTypeClassLabel}</b><br/>${item.parentTypeLabel}]
          ${ns.curie(item.childType)}[<b>${item.childTypeClassLabel}</b><br/>${item.childTypeLabel}]
          ${ns.curie(item.parent)}-->|${item.parentChildPropLabel}| ${ns.curie(item.child)}
          ${ns.curie(item.parent)}-->|${item.parentTypePropLabel}| ${ns.curie(item.parentType)}
          ${ns.curie(item.child)}-->|${item.childTypePropLabel}| ${ns.curie(item.childType)}
          `
          let lines = block.split('\n')
          lines.forEach((line)=>statements.push(line))
          })
          let statementSet = [...new Set(statements)];
          let output = `flowchart LR
          ${statementSet.join('\n')}`
          return output
        }


} 

