// reset @2
@2
M=0

// copy @0 and @1
@0
D=M
@i
M=D
@1
D=M
@j
M=D


// Swap i and j if i < j
@i
D=M
@j
D=D-M
@25
D;JGE
@j
D=M
@i
D=D+M
@j
M=D-M
D=D-M
@i
M=D

// i holds the big one
@j
D=M
@36 // the end
D;JLE
@i
D=M
@2
M=M+D
@j
M=M-1
@25 // the comment
0;JMP
