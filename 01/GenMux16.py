print   'CHIP Mux16 {'
print   '    IN a[16], b[16], sel;'
print   '    OUT out[16];'
print
print   '    PARTS:'
 
for i in range(0, 16):
  print '    Mux(a=a[%d], b=b[%d], sel=sel, out=out[%d]);' % (i, i, i)

print   '}'
