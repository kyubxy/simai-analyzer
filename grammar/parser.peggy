{{
	function joinlst(lst) {
    	return lst.join("")
    }
}}

start
	= chart:chart? ("E"/!.) { return chart }
    
chart
	= c:(_ head:elem _ "," _ { return head })* {return {label: "chart", chart: c}}

elem
	= bpm:bpmDef? _ len:lenDef? _ noteCol:noteCol? {
    	return { label: "elem", bpm:bpm, len:len, noteCol: noteCol }
    }

bpmDef "BPM definition"
	= "(" bpm:number ")" { return bpm }

lenDef "length divider definition"
	= "{" len:(
    	(div:number {return {label: "lenDef", info: "div", div: div}}) 
    	/ ("#" sec:number {return {label:"lenDef", info: "sec", sec: sec}})
      ) "}" {return len}

// TODO: for the time being, we'll ignore the semantics of the ` operator
noteCol "note collection"
	= n:note ns:(("/"/"`") ns:note {return ns})* {return [n, ...ns]}

note
	= s:slide {return s}
    / th:touchHold {return th}
    / tc:touch {return tc}
    / h:hold {return h}
    / t:tap {return t}
    
tap 
	= loc:buttonLoc star:$"$"|..2| brk:$"b"? ex:$"x"? { return {label: "tap",loc:loc, brk:brk, ex:ex, star:star}}
    
hold
	= loc:buttonLoc brk:$"b"? "h"? ex:$"x"? dur:lenHold {return{label:"hold",loc:loc,brk:brk,ex:ex,dur:dur}} 

// the entire slide ie. 5^5[4:5]
slide 
	= loc:buttonLoc style:$("@"/"?"/"!")? part:slidePartial parts:("*" p:slidePartial {return p})* 
    {
    	return {
        	label:"slide",
            loc: loc,
            style: style,
            slidePaths: [part, ...parts]
        }
    }
    
            
// eg. ^4[4:5]b or V35[3##3##3] 
slidePartial
	= segments:(sps:slidePartialSecond len:lenSlide brk:$"b"? // although we "allow" adding breaks to individual slide segments, in reality the break effect will be applied to all segments in the path 
    	{return{info: "variableLen", type: sps.type, verts:sps.verts, len:len, brk:brk}}
      )+ {return segments}
    / segments:slidePartialSecond+ len:lenSlide brk:$"b"?
    	{return {info: "constantLen", segments:segments, len:len, brk:brk}}
        
  
// eg. ^4 or V35
slidePartialSecond
	= type:slideType v1:buttonLoc {return {type:type, verts:[v1]}}
    / "V" v1:buttonLoc v2:buttonLoc {return {type:"V", verts:[v1,v2]}}
    
touch
	= l:touchLoc f:"f"? {return {label:"touch", loc: l, firework: f}}
    
touchHold
	= l:touchLoc f:$"f"? "h" len:lenHold {return {label:"touchHold", loc: l, firework: f, len:len}}
                       
slideType // does not include V type - this is processed separately
	= "pp"/"qq"/"p"/"q"/"-"/"<"/">"/"^"/"v"/"s"/"z"/"w"
       
lenSlide
	= "["
    	x:( r:ratio  {return {label:"lenSlide", info:"ratio", ratio:r}}
        / bpm:number "#" r:ratio {return {label: "lenSlide", info: "bpmratio", bpm:bpm, ratio:r}}
        / bpm:number "#" len:number {return {label: "lenSlide", info:"bpmlen", bpm:bpm, len:len}}
        / delay:number "##" len:number {return {label: "lenSlide", info:"delaylen", delay:delay, len:len}}
        / delay:number "##" r:ratio {return {label:"lenSlide", info:"delayratio", delay:delay, ratio:r}}
        / delay:number "##"bpm:number "##" r:ratio {return {label:"lenSlide", info:"delaybpmratio", delay:delay, bpm:bpm, ratio:r}}
    )"]" {return x}
       
lenHold 
	= "[" x:(
    	 r:ratio {return {label: "lenHold", info:"ratio", ratio: r}}			
        /bpm:number "#" r:ratio {return {label: "lenHold", info:"bpmratio", bpm:bpm, ratio: r}}			
        /"#" s:number 		 {return {label: "lenHold", info:"delay", delay:s}}
      )"]" {return x}
      
    
// for the time being, we'll stick to only parsing integer ratios
ratio
	= d:integer ":" n:integer {return {div: d, num: n}}
    
touchLoc
	= f:[A-E] i:[1-8] {return {pos: i, frag: f}}
    
buttonLoc
	= l:[1-8] {return l}
    
number 
	= d:decimal / i:integer{return i}

integer
	= digits:[0-9]+ { return parseInt(joinlst(digits)); }
    
decimal
	= w:[0-9]* "." f:[0-9]* { return parseFloat(joinlst(w)+"."+joinlst(f)); } 

_ "whitespace"
  = [ \t\n\r]*
  