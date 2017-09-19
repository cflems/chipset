print   'CHIP Inc16 {'
print   '    IN in[16];'
print   '    OUT out[16];'
print
print   '    PARTS:'
print   '    Not(in=in[0], out=nin);'
print   '    Or(a=in[0], b=nin, out=one);'
print   '    HalfAdder(a=in[0], b=one, sum=out[0], carry=c1);'


for i in range(1, 16):
  print '    HalfAdder(a=in[%d], b=c%d, sum=out[%d], carry=c%d);' % (i, i, i, i+1)

print   '}'
