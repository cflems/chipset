print   'CHIP Add16 {'
print   '    IN a[16], b[16];'
print   '    OUT out[16];'
print
print   '    PARTS:'
print   '    HalfAdder(a=a[0], b=b[0], sum=out[0], carry=c0);'


for i in range(1, 16):
  print '    FullAdder(a=a[%d], b=b[%d], c=c%d, sum=out[%d], carry=c%d);' % (i, i, i-1, i, i)

print   '}'
