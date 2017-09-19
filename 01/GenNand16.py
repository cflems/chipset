print   'CHIP Nand16 {'
print   '    IN a[16], b[16];'
print   '    OUT out[16];'
print
print   '    PARTS:'
 
for i in range(0, 16):
  print '    Nand(a=a[%d], b=b[%d], out=out[%d]);' % (i, i, i)

print   '}'
