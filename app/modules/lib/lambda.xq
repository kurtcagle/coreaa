module namespace lambda="https://thecaglereport.com/ns/lambda";

declare function lambda:template($expr as xs:string) {
     let $fn := xdmp:javascript-eval(fn:concat('(me)=>`',$expr,'`'))
     return $fn
};

declare function lambda:object($json as xs:string){
  let $obj := xdmp:from-json(xdmp:unquote($json,("format-json")))
  return $obj
  };

declare function lambda:formatJSON($expr as xs:string,$json as xs:string){
    let $fn := lambda:template($expr)
    let $obj := lambda:object($json)
    return $fn($obj)
    };

declare function lambda:format($expr as xs:string,$obj as map:map){
    let $fn := lambda:template($expr)
    return $fn($obj)
    };    