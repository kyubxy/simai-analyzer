{{
	function joinlst(lst) {
    	return lst.join("")
    }
}}

start 
	= chart:chart? ("E"/!.) { return chart }
    
chart
	= c:(_ head:elem _ "," _ { return head })* {return {chart: c}}

elem
	= bpm:bpmDef? _ len:lenDef? _ noteCol:noteCol? {
    	return { bpm:bpm, len:len, noteCol: noteCol }
    }

bpmDef "BPM definition"
	= "(" bpm:number ")" { return bpm }

lenDef "length divider definition"
	= "{" len:(
    	(div:number {return {type: "div", val: div}}) /
    	("#" sec:number {return {type: "sec", val: sec}})
      ) "}" {return len}

// TODO: for the time being, we'll ignore the semantics of the ` operator
noteCol "note collection"
	= n:note ns:(("/"/"`") ns:note {return ns})* {return [n, ...ns]}

note
    = h:hold {return h} /
      th:touchHold {return th} /
	  s:slide {return s} /
      tc:touch {return tc} /
      t:tap {return t}
    
// with note types, we will explicitly specify
// the type to avoid ambiguities with parsing later on
    
decorators = brk:$"b" ex:$"x"? { return {brk:brk, ex:ex} } / ex:$"x" brk:$"b"? { return {brk:brk, ex:ex} }
tap 
	= loc:buttonLoc star:$"$"|..2| deco:decorators? 
    { return {type:"tap", loc:loc, brk:deco?.brk??null, ex:deco?.ex??null, star:star}}
    
holdDecorators = 
	"h" ex:$"x" brk:$"b"? { return {brk:brk, ex:ex} } / 
	brk:$"b" "h" ex:$"x"? { return {brk:brk, ex:ex} } / 
	"h" brk:$"b" ex:$"x"? { return {brk:brk, ex:ex} } /
	brk:$"b" ex:$"x"? "h"  { return {brk:brk, ex:ex} } / 
	ex:$"x" "h" brk:$"b"? { return {brk:brk, ex:ex} } /
	ex:$"x" brk:$"b"? "h"  { return {brk:brk, ex:ex} } /    
	"h" ex:$"x"  { return {brk:undefined, ex:ex} } / 
	"h" brk:$"b" { return {brk:brk, ex:undefined} } /
	"h" {return {brk:undefined, ex:undefined}}
    
// for the time being, we'll cheat and accept a superset of the correct syntaxes
// eg. 4h[4:1]xbx is acceptable. TODO: look for another grammar generator or come up
// with a better grammar
hold = 
	loc:buttonLoc "h" dur:lenHold ex:"x"? brk:"b"? ex2:"x"? {return{type:"hold", loc:loc,brk:brk??null,ex:ex??ex2??null,dur:dur}} /
	loc:buttonLoc hd:holdDecorators dur:lenHold {return{type:"hold", loc:loc,brk:hd?.brk??null,ex:hd?.ex??null,dur:dur}} 
    

// the entire slide ie. 5^5[4:5]
slide 
	= loc:buttonLoc style:$("@"/"?"/"!")? brk:$"b"? ex:$"x"? part:slideHead parts:("*" p:slideHead {return p})* 
    {
    	return {
        	type:"slide",
            brk: brk,
            ex: ex,
            loc: loc,
            style: style,
            slidePaths: [part, ...parts]
        }
    }
    
            
// eg. ^4[4:5]b or V35[3##3##3] 
slideHead
	= segments:(st:slideTail len:lenSlide brk:$"b"? // although we "allow" adding breaks to individual slide segments, in reality the break effect will be applied to all segments in the path 
    	{return{slideType: st.slideType, verts:st.verts, len:len, brk:brk}}
      )+ {return {type: "variable", segments:segments}}
    / segments:slideTail+ len:lenSlide brk:$"b"?
    	{return {type: "constant", segments:segments, len:len, brk:brk}}
        
  
// eg. ^4 or V35
slideTail
	= type:slideType v1:buttonLoc {return {slideType:type, verts:[v1]}}
    / "V" v1:buttonLoc v2:buttonLoc {return {slideType:"V", verts:[v1,v2]}} // grand V
    
touch
	= l:touchLoc f:"f"? {return {type:"touch", loc: l, firework: f}}
    
touchHold
	= l:touchLoc f:$"f"? "h" len:lenHold {return {type:"touchHold", loc: l, firework: f, len:len}}
                       
slideType // does not include V type - this is processed separately
	= "pp"/"qq"/"p"/"q"/"-"/"<"/">"/"^"/"v"/"s"/"z"/"w"
       
lenSlide
	= "["
    	x:( r:ratio  {return {type: "ratio", ratio:r}}
        / delay:number "##"bpm:number "##" r:ratio {return {type: "delay-bpm-ratio", delay:delay, bpm:bpm, ratio:r}}
        / delay:number "##" r:ratio {return {type: "delay-ratio", delay:delay, ratio:r}}
        / delay:number "##" len:number {return {type: "delay-len", delay:delay, len:len}}
		/ bpm:number "#" r:ratio {return {type: "bpm-ratio", bpm:bpm, ratio:r}}
        / bpm:number "#" len:number {return {type: "bpm-len", bpm:bpm, len:len}}
    )"]" {return x}
       
lenHold 
	= "[" x:(
    	 r:ratio {return {type: "ratio", ratio: r}}			
        /bpm:number "#" r:ratio {return {type: "bpmratio", bpm:bpm, ratio: r}}			
        /"#" s:number 		 {return {type: "delay", delay:s}}
      )"]" {return x}
      
    
// for the time being, we'll stick to only parsing integer ratios
ratio
	= d:integer ":" n:integer {return {div: d, num: n}}
    
touchLoc
	= f:[A-B|D-E] i:[1-8] {return {pos: i, frag: f}} / "C" i:[1-3]? "x"? {return {pos: i, frag:"C"}}
    
buttonLoc
	= l:[1-8] {return {button: parseInt(l)}}
    
number 
	= d:decimal / i:integer{return i}

integer
	= digits:[0-9]+ { return parseInt(joinlst(digits)); }
    
decimal
	= w:[0-9]* "." f:[0-9]* { return parseFloat(joinlst(w)+"."+joinlst(f)); } 

_ "whitespace"
  = [ \t\n\r]*
  