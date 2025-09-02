const fs = require('fs');
const s = fs.readFileSync('src/App.jsx','utf8');
let i = 0, line = 1;
const stack = [];
let inSingle=false, inDouble=false, inTemplate=false, inExpr=0;
function isNameChar(c){ return /[A-Za-z0-9_:\-\.]/.test(c); }
while(i<s.length){ const ch = s[i];
  if(ch==='\n'){ line++; i++; continue; }
  if(inSingle){ if(ch==='\\'){ i+=2; continue;} if(ch==="'") inSingle=false; i++; continue; }
  if(inDouble){ if(ch==='\\'){ i+=2; continue;} if(ch==='"') inDouble=false; i++; continue; }
  if(inTemplate){ if(ch==='\\'){ i+=2; continue;} if(ch==='`') inTemplate=false; i++; continue; }
  if(ch==="'") { inSingle=true; i++; continue; }
  if(ch==='"') { inDouble=true; i++; continue; }
  if(ch==='`') { inTemplate=true; i++; continue; }
  if(ch==='{'){ inExpr++; i++; continue; }
  if(ch==='}'){ if(inExpr>0) inExpr--; i++; continue; }
  if(inExpr>0){ i++; continue; }
  if(ch==='<' ){
    if(s.substr(i,4)==='<!--'){ i+=4; while(i<s.length && s.substr(i,3)!=='-->'){ if(s[i]==='\n') line++; i++; } i+=3; continue; }
    let j=i+1; while(j<s.length && /\s/.test(s[j])) j++;
    let closing=false; if(s[j]==='/'){ closing=true; j++; }
    let tag=''; while(j<s.length && isNameChar(s[j])){ tag+=s[j]; j++; }
    if(!tag){ i++; continue; }
    let self=false; let k=j; while(k<s.length && s[k] !== '>'){ if(s[k]==='/' && s[k+1]==='>'){ self=true; k+=2; break;} k++; }
    if(k>=s.length) break;
    if(!closing && !self){ stack.push({tag, line, pos:i}); }
    if(closing){ const last = stack.pop(); if(!last || last.tag !== tag){ console.log(JSON.stringify({type:'mismatch', tag, line, expected: last?last.tag:null})); process.exit(0); } }
    i = k+1; continue;
  }
  i++; }
if(stack.length) console.log(JSON.stringify({type:'unclosed', item: stack[stack.length-1]})); else console.log(JSON.stringify({type:'ok'}));
