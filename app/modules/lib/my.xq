module namespace my="my-namespace";
declare function my:lambda($expr as xs:string) {
     let $fn := xdmp:javascript-eval(fn:concat('(obj)=>`',$expr,'`'))
     return $fn
};

declare function my:object($json as xs:string){
  let $obj := xdmp:from-json(xdmp:unquote($json,("format-json")))
  return $obj
  };