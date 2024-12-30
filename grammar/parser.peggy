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
    	(div:number {return {div: div}}) /
    	("#" sec:number {return {sec: sec}})
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
    { return {noteType:"tap", loc:loc, brk:deco?.brk??null, ex:deco?.ex??null, star:star}}
    
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
    
hold = 
	loc:buttonLoc hd:holdDecorators dur:lenHold {return{noteType:"hold", loc:loc,brk:hd?.brk??null,ex:hd?.ex??null,dur:dur}} 

// the entire slide ie. 5^5[4:5]
slide 
	= loc:buttonLoc style:$("@"/"?"/"!")? brk:$"b"? ex:$"x"? part:slideHead parts:("*" p:slideHead {return p})* 
    {
    	return {
        	noteType:"slide",
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
    	{return{type: st.type, verts:st.verts, len:len, brk:brk}}
      )+ {return {timing: "variable", segments:segments}}
    / segments:slideTail+ len:lenSlide brk:$"b"?
    	{return {timing: "constant", segments:segments, len:len, brk:brk}}
        
  
// eg. ^4 or V35
slideTail
	= type:slideType v1:buttonLoc {return {type:type, verts:[v1]}}
    / "V" v1:buttonLoc v2:buttonLoc {return {type:"V", verts:[v1,v2]}} // grand V
    
touch
	= l:touchLoc f:"f"? {return {noteType:"touch", loc: l, firework: f}}
    
touchHold
	= l:touchLoc f:$"f"? "h" len:lenHold {return {noteType:"touchHold", loc: l, firework: f, len:len}}
                       
slideType // does not include V type - this is processed separately
	= "pp"/"qq"/"p"/"q"/"-"/"<"/">"/"^"/"v"/"s"/"z"/"w"
       
lenSlide
	= "["
    	x:( r:ratio  {return {ratio:r}}
        / delay:number "##"bpm:number "##" r:ratio {return {delay:delay, bpm:bpm, ratio:r}}
        / delay:number "##" r:ratio {return {delay:delay, ratio:r}}
        / delay:number "##" len:number {return {delay:delay, len:len}}
		/ bpm:number "#" r:ratio {return {bpm:bpm, ratio:r}}
        / bpm:number "#" len:number {return {bpm:bpm, len:len}}
    )"]" {return x}
       
lenHold 
	= "[" x:(
    	 r:ratio {return {ratio: r}}			
        /bpm:number "#" r:ratio {return {bpm:bpm, ratio: r}}			
        /"#" s:number 		 {return {delay:s}}
      )"]" {return x}
      
    
// for the time being, we'll stick to only parsing integer ratios
ratio
	= d:integer ":" n:integer {return {div: d, num: n}}
    
touchLoc
	= f:[A-B|D-E] i:[1-8] {return {pos: i, frag: f}} / "C" i:[1-3]? {return {pos: i, frag:"C"}}
    
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
  