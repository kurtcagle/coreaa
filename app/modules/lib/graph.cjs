//import { NS } from '/lib/ns.mjs';
//import { Node } from '/lib/node.mjs';
// var sem = require("/MarkLogic/semantics.xqy");
class Graph {
  constructor(ns,graphIRI="",mode="json") {
    this.ns = ns
    this.graphIRI = graphIRI
    this.mode = mode 
  }
fromLabel(label){
    let prolog = this.ns.sparql;
    var query = `
      ${prolog}
      select distinct ?s ?label ?type ?typeLabel ?description where {
          #?s rdfs:label ?label.
          ?s rdf:type ?type. 
          optional {
            ?s ?labelPred ?label.
            ?labelPred rdfs:subPropertyOf* rdfs:label.
          }
          optional {
            ?type rdfs:label ?typeLabel1.
          }
          optional {
            ?s Entity:description ?description1.
          }
          filter(contains(lcase(?label),"${label.toLowerCase()}"))
          filter(!(?type in (sh:NodeShape,sh:PropertyShape)))
          bind(coalesce(?description1,?label) as ?description)
          bind(strlen(?label) as ?len)
          bind(coalesce(?typeLabel1,"Class") as ?typeLabel)
        } order by ?len ?label`
    let nodesRaw=sem.sparql(query).toArray();
    let nodes = nodesRaw.map((node)=>{return {curie:this.ns.curie(node.s),label:node.label,type:this.ns.curie(node.type),typeLabel:node.typeLabel,description:node.description}})
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
    if (this.ns.map[curie]!=null){return curie}
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
        select distinct ?curie ?path ?targetClass ?plabel ?name ?datatype ?class ?minCount ?maxCount ?node ?nodeKind 
            ?language ?code ?groupOrder ?order where {
            ${constraints.type} rdfs:subClassOf* ?targetClass.
            ?targetClass sh:property ?prop.
            ?prop sh:path ?path.
            ?prop sh:name ?name.
            optional {
                ?prop rdfs:label ?plabel.
            }
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
    async list(object="?object",predicate="rdf:type",filter=(item)=>true,limit=1000,page=1){
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
        let nodes=await this.executeSparql(query);
        nodes.forEach((node)=> Object.keys(node).forEach((key)=>{if (node[key].type=="uri"){node[key].curie = this.ns.curie(node[key].value);node[key].nodeKind = node[key].type;delete node[key].type}}))
        return nodes
//        return nodes.map((node)=>{return {curie:this.ns.curie(node.s.value),label:node.label.value,type:this.ns.curie(node.type.value),description:node.description.value}})  
//        return nodes.map((node)=>{return {curie:this.ns.curie(node.s.value),label:node.label.value,type:this.ns.curie(node.value),description:node.description.value}})
/*        nodes = nodes.map((node)=>{node.curie = this.ns.curie(node.s.value);node.type = this.ns.curie(node.type.value)})
        let filteredNodes = nodes.filter(filter);
        let start = (page-1)*limit;
        let end = start+limit;
        return filteredNodes.slice(start,end)*/
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
//         return results
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
    async executeSparql(query,params={}) {
        // Implement the SPARQL query execution here
        //return sem.sparql(query,params).toArray()
        try {
          let endpoint = "http://localhost:3030/coreaa/sparql"
          let newObject = [];
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/sparql-query',
              // Add any other headers if necessary
            },
            body: query
          });                
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
          const data = await response.json();
          let results = data.results.bindings;
          //console.log(JSON.stringify(results,null,4))
/*          results.forEach((result)=>{
            let obj = {}
            Object.keys(result).forEach((key)=>{
              obj[key] = result[key].value
            })
            newObject.push(obj)
          })  */
          return results
        } catch(error){
          console.error('Error:', error);
        };
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
        treeView(id,mode=this.mode){
          let ns = this.ns
          let renderer = "dagre"
          let params = (id.endsWith(":"))?{parentClass:ns.ciri(id)}:{node:id}
          let statements = []
          if (params.hasOwnProperty("parentClass")){
            let query = `${ns.sparql}
            select distinct ?parent ?child ?parentLabel ?childLabel ?parentClassLabel ?childClassLabel ?parentTypeLabel ?childTypeLabel
                ?parentChildPropLabel ?parentTypePropLabel ?childTypePropLabel  ?parentType ?childType ?parentTypeClass ?childTypeClass ?parentTypeClassLabel ?childTypeClassLabel where {
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
            let result = this.executeSparql(query,params)
            result.forEach((item)=>{
            let block = `
            %% Class ${ns.curie(item.parent)}
            ${ns.curie(item.parent)}["<b>${item.parentClassLabel}</b>:<br>  ${item.parentLabel}"]:::${item.parentClassLabel}
            ${ns.curie(item.child)}["<b>${item.childClassLabel}</b>:<br>  ${item.childLabel}"]:::${item.childClassLabel}
            ${ns.curie(item.parentType)}["<b>${item.parentTypeClassLabel}</b>:<br>  ${item.parentTypeLabel}"]:::${item.parentTypeClassLabel}
            ${ns.curie(item.childType)}[<b>${item.childTypeClassLabel}</b>:  ${item.childTypeLabel}]:::${item.childTypeClassLabel}
            ${ns.curie(item.parent)}-->|${item.parentChildPropLabel}| ${ns.curie(item.child)}
            ${ns.curie(item.parent)}-->|${item.parentTypePropLabel}| ${ns.curie(item.parentType)}
            ${ns.curie(item.child)}-->|${item.childTypePropLabel}| ${ns.curie(item.childType)}
            click ${ns.curie(item.parent)} "diagram2.html?id=${ns.curie(item.parent)}" "View ${item.parentLabel}"
            click ${ns.curie(item.child)} "diagram2.html?id=${ns.curie(item.child)}" "View ${item.parentLabel}"
            click ${ns.curie(item.parentType)} "diagram2.html?id=${ns.curie(item.parentType)}" "View ${item.parentTypeLabel}"
            click ${ns.curie(item.childType)} "diagram2.html?id=${ns.curie(item.childType)}" "View ${item.childTypeLabel}"
            `
            let lines = block.split('\n')
            lines.forEach((line)=>statements.push(line))
            })
            let statementSet = [...new Set(statements)];
            let output = `
%%{init: {"flowchart": {"defaultRenderer": "${renderer}"}} }%%
flowchart LR
            ${statementSet.join('\n')}
            classDef Platform fill:#ff9,stroke:#333,stroke-width:2px;
            classDef Application fill:#f9f,stroke:#333,stroke-width:2px;
            classDef Module fill:#fbb,stroke:#333,stroke-width:2px;
            classDef Component fill:#9ff,stroke:#333,stroke-width:2px;
            classDef Vendor fill:#abf,stroke:#333,stroke-width:2px;
            classDef Person fill:#fd9,stroke:#333,stroke-width:2px;
            classDef DataSet fill:#f6d,stroke:#333,stroke-width:2px;
            classDef DataField fill:#6fd,stroke:#333,stroke-width:2px;
            classDef PlatformType fill:#aa7,color:white,stroke:#333,stroke-width:2px;
            classDef ApplicationType fill:#858,color:white,stroke:#333,stroke-width:2px;
            classDef ModuleType fill:#855,color:white,stroke:#333,stroke-width:2px;
            classDef ComponentType fill:#588,color:white,stroke:#333,stroke-width:2px;
            classDef VendorType fill:#558,color:white,stroke:#333,stroke-width:2px;
            classDef Role fill:#875,color:white,stroke:#333,stroke-width:2px;
            classDef DataSetType fill:#837,color:white,stroke:#333,stroke-width:2px;
            classDef DataFieldType fill:#383,color:white,stroke:#333,stroke-width:2px;
                  `
            return output
          } else {
            let query = `${ns.sparql}
            select distinct * where {
              bind(${id} as ?s)
              ?s a ?sType .
              ?s Entity:name ?sLabel .
              ?sType sh:name ?sTypeLabel .
              optional {?s ?p1 ?o1.
                filter(!sameTerm(?p1,rdf:type)&&!sameTerm(?p1,Entity:name))
                ?p1 sh:nodeKind sh:IRI .
                ?p1 rdfs:subPropertyOf Entity:child .
                ?p1 rdfs:label ?p1Label .
              }              
              optional {
                ?s0 ?p0 ?s.
#                ?p0 sh:nodeKind sh:IRI .
                ?s0 a ?s0Type . 
                ?s0 Entity:name ?s0Label .
                ?s0Type sh:name ?s0TypeLabel .
                ?p0 rdfs:label ?p0Label .
              }
              optional {
                ?o1 ?p2 ?o2.
                ?p2 sh:nodeKind sh:IRI .
                ?p2 rdfs:label ?p2Label .
#                ?p2 rdfs:subPropertyOf Entity:child .
                ?o1 Entity:name ?o1Label .
                ?o1 a ?o1Type .
                ?o1Type sh:name ?o1TypeLabel .
                optional {
                  ?o2 Entity:name ?o2Label .
                  ?o2 a ?o2Type .
                  ?o2Type sh:name ?o2TypeLabel .
                  optional {
                    ?o2 ?p3 ?o3.
                    ?p3 sh:nodeKind sh:IRI .
#                    ?p3 rdfs:subPropertyOf Entity:child .
                    ?p3 rdfs:label ?p3Label .
                    ?o3 Entity:name ?o3Label .
                    ?o3 a ?o3Type .
                    ?o3Type sh:name ?o3TypeLabel .
                    }
                }
              }
            }`
            let result = this.executeSparql(query)
            result.query = query
            let statements = []
            result.forEach((item)=>{
              let block = `
 ${ns.curie(item.s)}["<b>${item.sTypeLabel}</b>:<br>  ${item.sLabel}"]${(item.sTypeLabel!="")?":::"+item.sTypeLabel:""}
 ${ns.curie(item.o1)}["<b>${item.o1TypeLabel}</b>:<br>  ${item.o1Label}"]${(item.o1TypeLabel!="")?":::"+item.o1TypeLabel:""}
 ${ns.curie(item.o2)}["<b>${item.o2TypeLabel}</b>:<br>  ${item.o2Label}"]${(item.o2TypeLabel!="")?":::"+item.o2TypeLabel:""}
 %% s0 ${ns.curie(item.s0)}
 %% s ${ns.curie(item.s)}
 ${(true)?`${ns.curie(item.s0)}["<b>${item.s0TypeLabel}</b>:<br>  ${item.s0Label}"]${(item.s0TypeLabel!="")?":::"+item.s0TypeLabel:""}`:''}
 ${(true)?`${ns.curie(item.s0)}-->|${ns.curie(item.p0)}| ${ns.curie(item.s)}`:''}
  ${ns.curie(item.o3)}["<b>${item.o3TypeLabel}</b>:<br>  ${item.o3Label}"]${(item.o3TypeLabel!="")?":::"+item.o3TypeLabel:""}
 ${ns.curie(item.s)}-->|${ns.curie(item.p1)}| ${ns.curie(item.o1)}
 ${ns.curie(item.o1)}-->|${ns.curie(item.p2)}| ${ns.curie(item.o2)}
 ${ns.curie(item.o2)}-->|${ns.curie(item.p3)}| ${ns.curie(item.o3)}
 ${(item.s0!="")?`click ${ns.curie(item.s0)} "diagram2.html?id=${ns.curie(item.s0)}" "View ${item.s0Label}"`:''}
click ${ns.curie(item.s)} "diagram2.html?id=${ns.curie(item.s)}" "View ${item.sLabel}"
 ${(item.o1!="")?`click ${ns.curie(item.o1)} "diagram2.html?id=${ns.curie(item.o1)}" "View ${item.o1Label}"`:''}
 ${(item.o2!="")?`click ${ns.curie(item.o2)} "diagram2.html?id=${ns.curie(item.o2)}" "View ${item.o2Label}"`:''}
 ${(item.o3!="")?`click ${ns.curie(item.o3)} "diagram2.html?id=${ns.curie(item.o3)}" "View ${item.o3Label}"`:''}

`

              let lines = block.split('\n')
              lines
                   .filter((line)=>line.trim().length != 0)
                   .filter((line)=>(!fn.contains(line,"undefined")) && !fn.contains(line,"<b></b>:<br>"))
                   .filter((line)=> (!fn.contains(line,"||")))
                   .forEach((line)=>statements.push(line))
            })

            let statementSet = [...new Set(statements)];
            let output = `%%{init: {"flowchart": {"defaultRenderer": "${renderer}"}} }%%
flowchart LR
            ${statementSet.join('\n')}
            classDef Platform fill:#ff9,stroke:#333,stroke-width:2px;
            classDef Application fill:#f9f,stroke:#333,stroke-width:2px;
            classDef Module fill:#fbb,stroke:#333,stroke-width:2px;
            classDef Component fill:#9ff,stroke:#333,stroke-width:2px;
            classDef Vendor fill:#abf,stroke:#333,stroke-width:2px;
            classDef Department fill:#fab,stroke:#333,stroke-width:2px;
            classDef Person fill:#fd9,stroke:#333,stroke-width:2px;
            classDef Role fill:#875,color:white,stroke:#333,stroke-width:2px;
            classDef Address fill:#4a7,color:white,stroke:#333,stroke-width:2px;
            classDef DataSet fill:#f6d,stroke:#333,stroke-width:2px;
            classDef DataField fill:#6fd,stroke:#333,stroke-width:2px;
            classDef PlatformType fill:#aa7,color:white,stroke:#333,stroke-width:2px;
            classDef ApplicationType fill:#858,color:white,stroke:#333,stroke-width:2px;
            classDef ModuleType fill:#855,color:white,stroke:#333,stroke-width:2px;
            classDef ComponentType fill:#588,color:white,stroke:#333,stroke-width:2px;
            classDef VendorType fill:#558,color:white,stroke:#333,stroke-width:2;
            style ${ns.curie(id)} stroke:#00f,stroke-width:4px;
            `
            return output
          }
    }
} 

module.exports = Graph