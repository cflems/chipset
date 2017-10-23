const fs = require('fs');
const path = require('path');

function quit (message) {
  console.error('[Error] '+message);
  process.exit(1);
}

function makebinstr (num) {
  if (num < 0 || num > 32767) quit('Integer out of bounds: '+num
    +'. Literals must be unsigned and are constrained to 15 bits.');
  let binstr = num.toString(2);
  while (binstr.length < 16) binstr = '0'+binstr;
  return binstr;
}

function isLabel (ln) {
  return ln.endsWith(':') || (ln.startsWith('(') && ln.endsWith(')'));
}

function labelName (ln) {
  if (!isLabel(ln)) return ln;
  else if (ln.endsWith(':')) return ln.substr(0, ln.length-1); // label:
  else return ln.substr(1, ln.length-2); // (label)
}

if (process.argv.length < 3) {
  console.log('Usage: '+path.basename(process.argv[0])+' '+path.basename(process.argv[1])+' <file.asm>');
  quit('A file input was expected.');
}
if (!process.argv[2].endsWith('.asm'))
  quit('Only .asm files are accepted.');

let basefile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.asm')),
    infile = basefile + '.asm',
    outfile = basefile + '.hack';

let inputs = fs.readFileSync(infile, 'utf-8')
               .split('\n')
               .map(ln => ln.replace(/\/\/.*/g, '').trim());

let symbolT = {
  'SP': 0x0,
  'LCL': 0x1,
  'ARG': 0x2,
  'THIS': 0x3,
  'THAT': 0x4,
  'SCREEN': 0x4000,
  'KBD': 0x6000,
  'R0': 0x0,
  'R1': 0x1,
  'R2': 0x2,
  'R3': 0x3,
  'R4': 0x4,
  'R5': 0x5,
  'R6': 0x6,
  'R7': 0x7,
  'R8': 0x8,
  'R9': 0x9,
  'R10': 0xa,
  'R11': 0xb,
  'R12': 0xc,
  'R13': 0xd,
  'R14': 0xe,
  'R15': 0xf,
};

let varcounter = 16;
let outputs = [];

// input labels to the table
for (let i = 0, pc = 0; i < inputs.length; i++) {
  if (inputs[i].length < 1) continue;
  if (isLabel(inputs[i]) && !inputs[i].startsWith('@')) {
    let label = labelName(inputs[i]);
    if (label in symbolT) quit('Redaclaration of label '
                                +label+' in line '+(i+1)+'.');
    symbolT[label] = pc;
  } else pc++;
}

// instruction processing
for (let i = 0; i < inputs.length; i++) {
  if (inputs[i].length < 1) continue;

  if (inputs[i].startsWith('@')) {
    let varsymbol = inputs[i].substr(1).trim();
    let varidx = parseInt(varsymbol);
    if (isNaN(varidx)) {
      if (varsymbol in symbolT) {
        outputs.push(makebinstr(symbolT[varsymbol]));
      } else {
        console.log('New variable: '+varsymbol);
        symbolT[varsymbol] = varcounter;
        outputs.push(makebinstr(varcounter++));
      }
    } else outputs.push(makebinstr(varidx));
  } else {
    // label
    if (isLabel(inputs[i])) continue;

    // c-inst
    let working = ['1','1','1','0','0','0','0','0','0','0','0','0','0','0','0','0'];
    if (inputs[i].indexOf(';') != -1) {
      let jstmt = inputs[i].substr(inputs[i].indexOf(';')+1)
                  .trim().toUpperCase();
      if (['JLT', 'JLE', 'JNE', 'JMP'].indexOf(jstmt) != -1) working[13] = '1';
      if (['JEQ', 'JLE', 'JGE', 'JMP'].indexOf(jstmt) != -1) working[14] = '1';
      if (['JGT', 'JGE', 'JNE', 'JMP'].indexOf(jstmt) != -1) working[15] = '1';
      if (working[13] == '0' && working[14] == '0'
          && working[15] == '0' && jstmt.length > 0)
        quit('Invalid syntax in "'+inputs[i]+'": '
             +jstmt+' is not a valid jump command.');
    }

    // jumps are handled. use command before semicolon
    let leftcmd = inputs[i].split(';')[0].trim();

    // TODO: work = commands format: MD=alushit
    // setter commands
    if (leftcmd.indexOf('=') > -1) {
      let assign = leftcmd.substr(0, leftcmd.indexOf('='))
                   .replace(/\s/g, '').toUpperCase();
      if (assign.length > 3)
        quit('(Line '+(i+1)+'): '
             +'There are a maximum of 3 things to be assigned.');
      for (let j = 0; j < assign.length; j++) {
        if (['A', 'D', 'M'].indexOf(assign[j]) < 0)
          quit('(Line '+(i+1)+'): '
                +'You cannot assign nonexistant register '+assign[j]+'.');
        if (assign[j] == 'A' && working[10] == '0') working[10] = '1';
        else if (assign[j] == 'D' && working[11] == '0') working[11] = '1';
        else if (assign[j] == 'M' && working[12] == '0') working[12] = '1';
        else quit('Duplicate assignment in line '+(i+1)+'.');
      }
    }

    // a-bit processing
    let alucmd = leftcmd.substr(leftcmd.indexOf('=')+1).trim().toUpperCase();
    if (alucmd.indexOf('A') > -1 && alucmd.indexOf('M') > -1)
      quit('(Line '+(i+1)+'):'
            +' You can\'t use both A and M in your input to the ALU.');
    else if (alucmd.indexOf('M') > -1) working[3] = '1';
    alucmd = alucmd.replace(/A|M/g, 'X').replace(/\s/g, '');

    // TODO: process ALU commands
    switch (alucmd) {
      case '0':
        working[4]=working[6]=working[8]='1';
        break;
      case '1':
        working[4]=working[5]=working[6]=working[7]=working[8]=working[9]='1';
        break;
      case '-1':
        working[4]=working[5]=working[6]=working[8]='1';
        break;
      case 'D':
        working[6]=working[7]='1';
        break;
      case 'X':
        working[4]=working[5]='1';
        break;
      case '!D':
        working[6]=working[7]=working[9]='1';
        break;
      case '!X':
        working[4]=working[5]=working[9]='1';
        break;
      case '-D':
        working[6]=working[7]=working[8]=working[9]='1';
        break;
      case '-X':
        working[4]=working[5]=working[8]=working[9]='1';
        break;
      case 'D+1':
        working[5]=working[6]=working[7]=working[8]=working[9]='1';
        break;
      case 'X+1':
        working[4]=working[5]=working[7]=working[8]=working[9]='1';
        break;
      case 'D-1':
        working[6]=working[7]=working[8]='1';
        break;
      case 'X-1':
        working[4]=working[5]=working[8]='1';
        break;
      case 'D+X':
      case 'X+D':
        working[8]='1';
        break;
      case 'D-X':
        working[5]=working[8]=working[9]='1';
        break;
      case 'X-D':
        working[7]=working[8]=working[9]='1';
        break;
      case 'D&X':
      case 'X&D':
        break;
      case 'D|X':
      case 'X|D':
        working[5]=working[7]=working[9]='1';
        break;
      default:
        quit('(Line '+(i+1)+'): "'
             +alucmd+'" is not a valid command to the ALU.');
    }

    // push the line
    outputs.push(working.join(''));
  }
}

fs.writeFileSync(outfile,
                 outputs.join('\n')+'\n',
                 {encoding: 'utf-8', mode: 0o644, flag: 'w'});
