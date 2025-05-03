start = _ markers? _ noteCol* _

markers = bpm _ timing / timing _ bpm

bpm = "(" number ")"

timing = "{" number "}"

noteCol = note ("/" note)*

note = hold / tap

tap = button decorators

hold = button decorators "h" decorators lenHold decorators

lenHold 
	= "[" x:(
    	 r:ratio {return {type: "ratio", ratio: r}}			
        /bpm:number "#" r:ratio {return {type: "bpmratio", bpm:bpm, ratio: r}}			
        /"#" s:number 		 {return {type: "delay", delay:s}}
      )"]" {return x}
      
ratio
	= d:number ":" n:number {return {div: d, num: n}}

decorators = ("b" / "x")*

number = [0-9]* ("." [0-9])*

button = "1"

_ "whitespace"
  = [ \t\n\r]*
