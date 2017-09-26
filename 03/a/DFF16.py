print   'CHIP DFF16 {'
print   '  IN in[16];'
print   '  OUT out[16];'
print
print   '  PARTS:'
for i in range(0, 16):
  print '  DFF(in=in[%d], out=out[%d]);' % (i, i)
print   '}'
