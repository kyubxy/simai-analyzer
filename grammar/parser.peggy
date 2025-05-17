{{
	function joinlst(lst) {
    	return lst.join("")
    }
    
    const findFirstDuplicate = (list) =>
  		list.find((item, index) => list.indexOf(item) !== index);
}}

cell = (c:(bpm:bpm {return {bpm}} / div:div {return {div}} / noteCol:noteCol {return {noteCol}})* {
	const allKeys = c.flatMap(obj => Object.keys(obj));
    const dup = findFirstDuplicate(allKeys);
    if (dup !== undefined) 
    	error(`${dup} defined multiple times in the cell`);
	return c.reduce((acc, val) => ({...acc, ...val}), {})
})

bpm = '(' bpm:number ')' {return bpm}

div = '{' div:number '}' {return div}

// TODO: support for `
noteCol = n:note ns:(('/'/'`') ns:note {return ns})* {return [n, ...ns]}

note = slide / touchHold / hold / touch / tap

// the entire slide ie. 5^5[4:5]
slide 
	= loc:buttonLoc style:$("@"/"?"/"!")? d:decorators part:slideHead parts:("*" p:slideHead {return p})* 
    {
    	return {
        	type:"slide",
            decorators: d,
            loc: loc,
            style: style,
            slidePaths: [part, ...parts]
        }
    }
            
// eg. ^4[4:5]b or V35[3##3##3] 
slideHead
  // although we "allow" adding breaks to individual slide segments, in reality the break effect will be applied to all segments in the path
    = segments:(st:slideTail brk1:$"b"? len:lenSlide brk2:$"b"?
    	{return{slideType:st.slideType, tailVerts:st.tailVerts, len, brk:brk1||brk2}}
      )+ {return {joinType: "variable", segments:segments}}
    / segments:slideTail+ brk1:$"b"? len:lenSlide brk2:$"b"?
    	{return {joinType: "constant", segments:segments, len, brk:brk1||brk2}}
  
// eg. ^4 or V35
slideTail
	= type:slideType v1:buttonLoc {return {slideType:type, tailVerts:[v1]}}
    / "V" v1:buttonLoc v2:buttonLoc {return {slideType:"V", tailVerts:[v1,v2]}} // grand V

slideType // does not include V type - this is processed separately
	= "pp"/"qq"/"p"/"q"/"-"/"<"/">"/"^"/"v"/"s"/"z"/"w"

touchHold = l:touchLoc d:touchHoldDecorators len:lenHold {
  return {
    type: "touchHold",
    location: l,
    decorators: d,
    length: len
  }
}

touchHoldDecorators = d1:$"f"? "h" d2:$"f"? {
  return [(d1||d2)]
}

hold = l:buttonLoc  d:holdDecorators len:lenHold {
  return {
    type: "hold",
    location: l,
    decorators: d,
    length: len
  }
}

holdDecorators = d1:decorators "h" d2:decorators {
  return [...new Set([...d1, ...d2])]
}


tap = b:buttonLoc d:decorators {return {type: "tap", location: b, decorators: d}}

touch = l:touchLoc f:"f"? {return {type: "touch", decorators: [f].filter((x) => x), location: l}}

decorators = ds:("b" / "x")* {return [...new Set(ds)]}

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

ratio
	= d:number ":" n:number {return {div: d, num: n}}

touchLoc
	= f:[A-B|D-E] i:[1-8] {return {pos: i, frag: f}} / "C" i:[1-3]? "x"? {return {pos: i, frag:"C"}}
    
buttonLoc
	= l:[1-8] {return parseInt(l)}
    
number = float / integer

integer
	= digits:[0-9]+ { return parseInt(joinlst(digits)); }
    
float
	= w:[0-9]* "." f:[0-9]* { return parseFloat(joinlst(w)+"."+joinlst(f)); } 

  