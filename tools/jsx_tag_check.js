const fs = require('fs');
const s = fs.readFileSync('src/App.jsx', 'utf8');
let i = 0; const n = s.length;
let stack = [];
let inJS = 0; let inStr = null;
let line = 1, col = 1;
function posToLineCol(pos){ const txt = s.slice(0,pos); const lines = txt.split('\n'); return {line: lines.length, col: lines[lines.length-1].length+1}; }
while(i<n){ const ch = s[i]; if(inStr){ if(ch==='\\'&&i+1<n){ i+=2; continue;} if(ch===inStr){ inStr=null; i++; continue;} if(ch==='\n'){ line++; col=1; } else col++; i++; continue; }
 if(ch==='"' || ch==="'" || ch==='`'){ inStr=ch; i++; col++; continue; }
 if(ch==='{' ){ inJS++; i++; col++; continue; }
 if(ch==='}' ){ if(inJS>0) inJS--; i++; col++; continue; }
 if(inJS>0){ if(ch==='\n'){line++; col=1;} else col++; i++; continue; }
 if(ch==='<'){
   if(s.substr(i,4) === '<!--'){ const end = s.indexOf('-->', i+4); if(end===-1) break; const p = posToLineCol(i); i = end+3; const p2 = posToLineCol(i); continue; }
   const end = s.indexOf('>', i+1);
   if(end===-1) break;
   const token = s.slice(i+1, end).trim();
   const isClose = token[0]==='/' ;
   const isSelfClose = token.endsWith('/') ;
   const tagNameMatch = token.match(/^\/?\s*([A-Za-z0-9-_:]+)/);
   const tagName = tagNameMatch ? tagNameMatch[1] : null;
   const p = posToLineCol(i);
   if(!isClose && !isSelfClose && tagName && tagName!==">"){
     stack.push({tag:tagName, pos:i, line:p.line, col:p.col});
   } else if(isClose){
     const idx = stack.map(x=>x.tag).lastIndexOf(tagName);
     if(idx===-1){ console.log('Unmatched closing',tagName,'at',p); process.exit(0);} else { stack.splice(idx,1); }
   }
   const adv = s.slice(i, end+1).split('\n').length-1;
   if(adv>0){ const parts = s.slice(i, end+1).split('\n'); line += parts.length-1; col = parts[parts.length-1].length+1; } else { col += (end+1-i); }
   i = end+1; continue;
 }
 if(ch==='\n'){ line++; col=1; } else { col++; }
 i++; }
if(stack.length){ console.log('Unclosed tags count',stack.length); console.log('First unclosed:', stack[0]); console.log('Stack tail (last 10):', stack.slice(-10)); } else { console.log('No unclosed tags'); }
