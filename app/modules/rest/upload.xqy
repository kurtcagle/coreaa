xquery version "1.0-ml";
import module namespace rest="http://marklogic.com/appservices/rest"
       at "/MarkLogic/appservices/utils/rest.xqy";
import module namespace requests =
  "http://marklogic.com/appservices/requests" at "requests.xqy";
(: Process requests to be handled by this endpoint module. :)
let $request := $requests:options/rest:request
                  [@endpoint = "/rest/endpoint-upload.xqy"][1]
(: Get parameter/value map from request. :)
let $params  := rest:process-request($request)
let $posturi := map:get($params, "_ml_post_")
let $type    := xdmp:get-request-header('Content-Type')
(: Obtain the format of the content. :)
let $format := 
  if ($type = 'application/xml' or ends-with($type, '+xml'))
  then
    "xml"
  else
  if ($type = 'application/json' or ends-with($type, '+json'))
    then "json"
    else
    if (contains($type, "text/"))
    then "text"
    else "binary"
(: Insert the content of the request body into the database. :)
let $body := xdmp:get-request-body($format)
return
  (xdmp:document-insert($posturi, $body),
  concat("Successfully uploaded: ", $posturi, "&#10;"))