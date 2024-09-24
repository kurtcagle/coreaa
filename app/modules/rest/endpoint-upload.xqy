import module namespace rest = "http://marklogic.com/appservices/rest"
    at "/MarkLogic/appservices/utils/rest.xqy";
import module namespace requests =   "http://marklogic.com/appservices/requests" at "/rest/requests.xqy";
declare option xdmp:commit "explicit";
declare option xdmp:update "true";
let $request := $requests:options/rest:request
                  [@endpoint = "/rest/endpoint-upload.xqy"][1]
let $map  := rest:process-request($request)
let $map1 := map:new()
let $_ := for $key in map:keys($map) return map:put($map1,$key,fn:substring-after(map:get($map,$key),"/"))
return "invoked"
(: return xdmp:invoke("/scripts/childNodes.sjs",$map1):)

  (:fn:doc($play):)
    (:  xdmpinvoke:($play):)
  (:$play:)


