xquery version "1.0-ml";
import module namespace rest = "http://marklogic.com/appservices/rest"
    at "/MarkLogic/appservices/utils/rest.xqy";
import module namespace requests =   "http://marklogic.com/appservices/requests" at "/rest/requests.xqy";
let $request := $requests:options/rest:request
                  [@endpoint = "/rest/endpoint.xqy"][1]
let $map  := rest:process-request($request)
let $curie := map:get($map,"curie")
let $mode := map:get($map,"mode")
let $q := map:get($map,"q")
(:let $map1 := map:new()
let $_ := for $key in map:keys($map) return map:put($map1,$key,fn:substring-after(map:get($map,$key),"/")):)
return xdmp:invoke("/scripts/childNodes.sjs",$map)
(:return $map:)
  (:fn:doc($play):)
    (:  xdmpinvoke:($play):)
  (:$play:)


