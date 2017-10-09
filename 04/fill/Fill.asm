// _start:
@24576
D=M
@6 // @fill
D;JNE
@28 // @empty
0;JMP

// fill:
@state
D=M
@0
D;JNE
@state
M=1
@16384
D=A
@i
M=D
// fillhlp:
@i
A=M
M=-1
@i
D=M+1
M=D
@24575
D=D-A
@16 // @fillhlp
D;JLE
@0
0;JMP

//empty:
@state
D=M
@0
D;JEQ
@state
M=0
@16384
D=A
@i
M=D
//mpthlp:
@i
A=M
M=0
@i
D=M+1
M=D
@24575
D=D-A
@38 // @mpthlp
D;JLE
@0
0;JMP
