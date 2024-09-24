export function main(){
    const endpointUrl = 'http://localhost:3030/coreaa/sparql'
    const query = `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
    prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    prefix xsd: <http://www.w3.org/2001/XMLSchema#> 
    prefix text: <http://jena.apache.org/text#> 
    prefix Entity: <http://ns.coreaa.ai/Entity#> 
    prefix Carrier: <http://ns.coreaa.ai/Carrier#> 
    prefix PlanType: <http://ns.coreaa.ai/PlanType#> 
    prefix IntgnTemplate: <http://ns.coreaa.ai/IntgnTemplate#> 
    prefix sh: <http://www.w3.org/ns/shacl#> 
    prefix owl: <http://www.w3.org/2002/07/owl#> 
    prefix Connection: <http://ns.coreaa.ai/Connection#> 
    prefix DataFormat: <http://ns.coreaa.ai/DataFormat#> 
    prefix Group: <http://ns.coreaa.ai/Group#> 
    prefix Category: <http://ns.coreaa.ai/Category#> 
    prefix Platform: <http://ns.coreaa.ai/Platform#> 
    prefix PlatformType: <http://ns.coreaa.ai/PlatformType#> 
    prefix Org: <http://ns.coreaa.ai/Org#> 
    prefix Company: <http://ns.coreaa.ai/Company#> 
    prefix CompanyType: <http://ns.coreaa.ai/CompanyType#> 
    prefix Vendor: <http://ns.coreaa.ai/Vendor#> 
    prefix Person: <http://ns.coreaa.ai/Person#> 
    prefix Address: <http://ns.coreaa.ai/Address#> 
    prefix Department: <http://ns.coreaa.ai/Department#> 
    prefix DepartmentType: <http://ns.coreaa.ai/DepartmentType#> 
    prefix Division: <http://ns.coreaa.ai/Division#> 
    prefix Application: <http://ns.coreaa.ai/Application#> 
    prefix ApplicationType: <http://ns.coreaa.ai/ApplicationType#> 
    prefix Module: <http://ns.coreaa.ai/Module#> 
    prefix ModuleType: <http://ns.coreaa.ai/ModuleType#> 
    prefix Component: <http://ns.coreaa.ai/Component#> 
    prefix ComponentType: <http://ns.coreaa.ai/ComponentType#> 
    prefix WorkFlow: <http://ns.coreaa.ai/WorkFlow#> 
    prefix WorkFlowType: <http://ns.coreaa.ai/WorkFlowType#> 
    prefix DataSet: <http://ns.coreaa.ai/DataSet#> 
    prefix DataSetType: <http://ns.coreaa.ai/DataSetType#> 
    prefix DataField: <http://ns.coreaa.ai/DataField#> 
    prefix DataFieldType: <http://ns.coreaa.ai/DataFieldType#> 
    prefix coreaa: <http://ns.coreaa.ai/> 

    SELECT * where {
    ?s a Application: .
    ?s Entity:name ?label .
    }`
    const headers = {}
//    const client = new SparqlClient({endpointUrl})
//    const stream = client.query.select(query)

/*    stream.on('data', row => {
    for (const [key, value] of Object.entries(row)) {
        console.log(`${key}: ${value.value} (${value.termType})`)
    }
    })

    stream.on('error', err => {
    console.error(err)
    }) */
    fetch(endpointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/sparql-query',
            'Accept': 'application/json',
        },
        body: query
        })
        .then(response => response.json())
        .then(data => console.log(JSON.stringify(data)))
        .catch(err => console.log(err))
}