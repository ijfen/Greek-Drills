// Shared UI for nominal drills (nouns & pronouns, adjectives)
window.makeNominalDrill=function(cfg){
const P=cfg.prefix, WORDS=cfg.words, DATA=cfg.data;
const $=s=>document.querySelector(s);
const id=s=>'#'+P+'-'+s;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const I_CHECK='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const I_X='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const I_CARET='<svg class="caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5l4 3.5-4 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CL={nom:'nominative',gen:'genitive',dat:'dative',acc:'accusative',voc:'vocative'};
const GL={m:'masculine',f:'feminine',n:'neuter'};
const NL={sg:'singular',pl:'plural'};
const CASES=['nom','gen','dat','acc','voc'];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const GENDERS=[{k:'m',name:'Masculine'},{k:'f',name:'Feminine'},{k:'n',name:'Neuter'},{k:'irr',name:'Irregular'}];
const ALLGROUPS=cfg.sections.flatMap(s=>s.groups);

// ---------- indexes ----------
DATA.forEach((r,i)=>{ r._i=i; r.gd=!!WORDS[r.ni].gendered; });
const BYSTR=new Map();
DATA.forEach((r,i)=>{ for(const s of [r.f,r.alt]){ if(!s) continue; const k=r.gd+'|'+s; if(!BYSTR.has(k)) BYSTR.set(k,[]); if(!BYSTR.get(k).includes(i)) BYSTR.get(k).push(i);} });
const BYWORD=new Map(); DATA.forEach(r=>{ if(!BYWORD.has(r.ni)) BYWORD.set(r.ni,[]); BYWORD.get(r.ni).push(r); });
const cellsOf=new Map();
DATA.forEach(r=>{ if(!cellsOf.has(r.ni)) cellsOf.set(r.ni,new Set()); cellsOf.get(r.ni).add(r.n+'|'+r.c+'|'+(r.g||'')); });

// ---------- state ----------
const S={groups:new Set(cfg.defaults),genders:new Set(['m','f','n','irr']),nums:new Set(['sg','pl']),excl:new Set(),strict:false,ctx:false};
try{ const raw=localStorage.getItem(cfg.storage); if(raw){ const o=JSON.parse(raw); S.groups=new Set(o.groups||[]); if(o.genders) S.genders=new Set(o.genders); if(o.nums) S.nums=new Set(o.nums); if('ctx' in o) S.ctx=!!o.ctx; S.excl=new Set(o.excl||[]); if('strict2' in o) S.strict=o.strict2; } }catch(e){}
function save(){ try{ localStorage.setItem(cfg.storage,JSON.stringify({groups:[...S.groups],genders:[...S.genders],nums:[...S.nums],ctx:S.ctx,excl:[...S.excl],strict2:S.strict})); }catch(e){} }
function genderOk(w){ if(!cfg.genderRow||!w.gen) return true; if(w.gen==='mf') return S.genders.has('m')||S.genders.has('f'); return S.genders.has(w.gen); }
const wordOk=ni=>{ const w=WORDS[ni]; return S.groups.has(w.grp)&&genderOk(w); };

let SCOPE=[],PARSEPOOL=[],INSCOPE=new Set(),CTXOK=false;
const Q={parse:[],mc:[],type:[]}, CUR={parse:null,mc:null,type:null}, LAST={}, RES=[];
function recompute(){
  SCOPE=[]; DATA.forEach((r,i)=>{ if(wordOk(r.ni)&&S.nums.has(r.n)&&!S.excl.has(r.ni)) SCOPE.push(i); });
  INSCOPE=new Set(SCOPE);
  CTXOK=!!cfg.ctx&&(cfg.ctx!=='noun'||SCOPE.some(i=>{ const w=WORDS[DATA[i].ni]; return !w.gendered&&w.grp!=='pers'; }));
  const seen=new Set(); PARSEPOOL=[];
  for(const i of SCOPE){ const k=DATA[i].ni+'|'+DATA[i].f; if(!seen.has(k)){ seen.add(k); PARSEPOOL.push(i);} }
  Q.parse=[];Q.mc=[];Q.type=[]; CUR.parse=CUR.mc=CUR.type=null;
}

// ---------- set-up ----------
function groupCard(g){
  const words=WORDS.filter(w=>w.grp===g.k&&genderOk(w)).map(w=>w.lemma).join(', ');
  const rel=!g.off&&!!words;
  const on=rel&&S.groups.has(g.k);
  const why=g.off?'Not available yet.':(!words?'No words of the selected genders.':'');
  return `<button class="grp" data-grp="${g.k}" aria-pressed="${on}" ${rel?'':'disabled'}>
    <span class="mark" aria-hidden="true">${on?I_CHECK:''}</span>
    <span class="grp-h"><span class="grp-name">${g.name}</span>${g.alt?`<span class="grp-alt">${g.alt}</span>`:''}</span>
    <span class="grp-ex">${g.ex}</span>
    <span class="grp-desc">${g.desc}</span>
    ${words?`<span class="grp-verbs">${words}</span>`:''}
    ${why?`<span class="grp-why">${why}</span>`:''}
  </button>`;
}
function cellHTML(r){ if(!r) return '<td>–</td>'; return `<td>${esc(r.f)}${r.alt?`<span class="or">or ${esc(r.alt)}</span>`:''}</td>`; }
function paradigmHTML(ni,rows){
  const w=WORDS[ni]; const cases=CASES.filter(c=>rows.some(r=>r.c===c));
  if(!w.gendered){
    const hasPl=rows.some(r=>r.n==='pl');
    let h=`<div class="ptab-wrap"><table class="par"><thead><tr><th></th><th>Singular</th>${hasPl?'<th>Plural</th>':''}</tr></thead><tbody>`;
    for(const c of cases) h+=`<tr><th>${cap(CL[c])}</th>${cellHTML(rows.find(r=>r.c===c&&r.n==='sg'))}${hasPl?cellHTML(rows.find(r=>r.c===c&&r.n==='pl')):''}</tr>`;
    return h+'</tbody></table></div>';
  }
  let cols=['m','f','n'].filter(g=>rows.some(r=>r.g===g)).map(g=>({g,label:cap(GL[g])}));
  if(w.twoEnd) cols=[{g:'m',label:'Masculine and feminine'},{g:'n',label:'Neuter'}];
  let h='<div class="pgrid">';
  for(const n of ['sg','pl'].filter(n=>rows.some(r=>r.n===n))){
    h+=`<div class="ptab-wrap"><table class="par"><thead><tr><th>${cap(NL[n])}</th>${cols.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead><tbody>`;
    for(const c of cases) h+=`<tr><th>${cap(CL[c])}</th>`+cols.map(col=>cellHTML(rows.find(r=>r.c===c&&r.n===n&&r.g===col.g))).join('')+'</tr>';
    h+='</tbody></table></div>';
  }
  return h+'</div>';
}
function renderPreview(){
  const words=new Map();
  for(const i of SCOPE){ const r=DATA[i]; if(!words.has(r.ni)) words.set(r.ni,[]); words.get(r.ni).push(r); }
  const excl=WORDS.map((w,ni)=>ni).filter(ni=>S.excl.has(ni)&&wordOk(ni));
  const order=[...new Set([...words.keys(),...excl])].sort((a,b)=>a-b);
  $(id('count')).innerHTML=order.length?`<b>${SCOPE.length}</b> forms · <b>${words.size}</b> word${words.size===1?'':'s'}${excl.length?` · ${excl.length} excluded`:''}`:'';
  if(!order.length){ $(id('preview')).innerHTML=`<div class="empty">${cfg.emptyText}</div>`; return; }
  let h='<div class="vlist">', first=true;
  for(const ni of order){
    const w=WORDS[ni];
    const head=`<span class="vhead"><span class="vpp">${w.dict}</span><span class="vdef">${esc(w.def)}</span></span>`;
    if(S.excl.has(ni)){ h+=`<div class="vexcl">${head}<button class="vin" data-incl="${ni}">Include</button></div>`; continue; }
    const rows=words.get(ni);
    h+=`<details class="verb" ${first?'open':''}><summary>${I_CARET}${head}<span class="vmeta">${rows.length} forms</span><button class="vx" data-excl="${ni}" aria-label="Exclude ${w.lemma}" title="Exclude this word">${I_X}</button></summary><div class="vbody">${w.note?`<p class="vnote">${w.note}</p>`:''}${paradigmHTML(ni,rows)}</div></details>`;
    first=false;
  }
  $(id('preview')).innerHTML=h+'</div>';
}
function renderSetup(){
  let h='';
  const numBtns=[['sg','Singular'],['pl','Plural']].map(([k,nm])=>{ const on=S.nums.has(k); return `<button class="sq" data-num="${k}" aria-pressed="${on}">${on?I_CHECK:''}${nm}</button>`; }).join('');
  if(cfg.genderRow) h+=`<div class="block"><div><h2>${cfg.genderRow.title}</h2>${cfg.genderRow.help?`<p class="help">${cfg.genderRow.help}</p>`:''}</div><div class="sqs">${GENDERS.map(g=>{ const on=S.genders.has(g.k); return `<button class="sq" data-gen="${g.k}" aria-pressed="${on}">${on?I_CHECK:''}${g.name}</button>`; }).join('')}<span class="sqsep" aria-hidden="true"></span>${numBtns}</div></div>`;
  else h+=`<div class="block"><h2>Number</h2><div class="sqs">${numBtns}</div></div>`;
  for(const sec of cfg.sections) h+=`<div class="block"><div class="subhead"><h2>${sec.title}</h2>${sec.help?`<p class="help">${sec.help}</p>`:''}</div><div class="groups">${sec.groups.map(groupCard).join('')}</div></div>`;
  $(id('sections')).innerHTML=h;
  renderPreview();
}
function changed(){ S.excl.clear(); recompute(); save(); renderSetup(); }
$(id('sections')).addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b||b.disabled) return;
  if(b.dataset.grp){ const g=b.dataset.grp; S.groups.has(g)?S.groups.delete(g):S.groups.add(g); changed(); }
  else if(b.dataset.gen){ const g=b.dataset.gen; S.genders.has(g)?S.genders.delete(g):S.genders.add(g); changed(); }
  else if(b.dataset.num){ const g=b.dataset.num; S.nums.has(g)?S.nums.delete(g):S.nums.add(g); changed(); }
});
$(id('all')).addEventListener('click',()=>{ S.genders=new Set(GENDERS.map(g=>g.k)); S.nums=new Set(['sg','pl']); S.groups=new Set(ALLGROUPS.filter(g=>!g.off).map(g=>g.k)); changed(); });
$(id('none')).addEventListener('click',()=>{ S.genders.clear(); S.nums.clear(); S.groups.clear(); changed(); });
$(id('preview')).addEventListener('click',e=>{
  const x=e.target.closest('[data-excl]'), inc=e.target.closest('[data-incl]');
  if(x){ e.preventDefault(); e.stopPropagation(); S.excl.add(+x.dataset.excl); }
  else if(inc) S.excl.delete(+inc.dataset.incl);
  else return;
  recompute(); save(); renderPreview();
});

// ---------- quiz plumbing ----------
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function nextIdx(mode){
  const pool=mode==='parse'?PARSEPOOL:SCOPE; if(!pool.length) return null;
  if(!Q[mode].length){ Q[mode]=shuffle(pool.slice()); if(Q[mode].length>1&&Q[mode][0]===LAST[mode]) Q[mode].push(Q[mode].shift()); }
  const i=Q[mode].shift(); LAST[mode]=i; return i;
}
function requeue(mode,i){ const k=Math.min(Q[mode].length,3+Math.floor(Math.random()*4)); Q[mode].splice(k,0,i); }
function record(mode,ok,prompt,given,answer){ RES.unshift({mode,ok,prompt,given,answer}); window.GVD_refreshScore&&window.GVD_refreshScore(); }
const parseText=r=>`${r.g?GL[r.g]+' ':''}${CL[r.c]} ${NL[r.n]}`;
const userParseText=s=>`${s.g?GL[s.g]+' ':''}${CL[s.c]} ${NL[s.n]}`;
const headword=ni=>WORDS[ni].head||WORDS[ni].lemma;
function promptHTML(r){ return `<div class="qlemma">${headword(r.ni)}</div><div class="qdesc">${parseText(r)}</div>`; }
function fbHTML(ok,title,lines,nextId){
  return `<div class="fb ${ok?'ok':'no'}"><div class="fb-t"><strong class="${ok?'ok-t':'no-t'}">${title}</strong>${lines.map(l=>`<div>${l}</div>`).join('')}</div><button class="btn primary" id="${nextId}">Next</button></div>`;
}
const emptyView=()=>`<div class="empty">Nothing to test yet. Choose what to drill on the Set up page.<div style="margin-top:12px"><button class="btn primary" data-go="setup">Go to Set up</button></div></div>`;
function markOf(chosen,isRight,checked){
  if(!checked) return {cls:'',icon:''};
  if(chosen&&isRight) return {cls:' ok-c',icon:I_CHECK};
  if(chosen) return {cls:' no-c',icon:I_X};
  if(isRight) return {cls:' want-c',icon:I_CHECK};
  return {cls:'',icon:''};
}

// ---------- parse ----------
function validParses(i){ const r=DATA[i]; return (BYSTR.get(r.gd+'|'+r.f)||[]).map(j=>DATA[j]); }
const matches=(r,s)=>r.c===s.c&&r.n===s.n&&(r.g||'')===(s.g||'');
function newParse(){ const i=nextIdx('parse'); CUR.parse=i==null?null:{i,sel:{},checked:false,result:null}; }
function renderParse(){
  const el=$(id('parse'));
  if(!CUR.parse) newParse();
  const Pz=CUR.parse; if(!Pz){ el.innerHTML=emptyView(); return; }
  const r=DATA[Pz.i], w=WORDS[r.ni], s=Pz.sel, has=cellsOf.get(r.ni);
  const vp=validParses(Pz.i);
  let h=`<div class="qcard"><div class="qform">${esc(r.f)}</div>${Pz.checked?`<div class="qpp">${w.dict}</div>`:''}</div>`;
  if(Pz.checked){
    const uniq=[...new Set(vp.map(parseText))];
    const lines=[]; if(!Pz.result) lines.push(`<span class="gv">${userParseText(s)}</span>`);
    lines.push(...uniq.map(t=>(uniq.length>1?'· ':'')+t));
    h+=fbHTML(Pz.result,Pz.result?'Correct':(uniq.length>1?'Not quite. Valid parses:':'Not quite'),lines,P+'pnext');
  }
  const isRight=(n,c,g)=>Pz.checked&&(Pz.result?matches({n,c,g},s):vp.some(x=>matches(x,{n,c,g})));
  const cases=CASES.filter(c=>!(w.noVoc&&c==='voc'));
  const nums=['sg','pl'].filter(n=>S.nums.has(n)&&[...has].some(k=>k.startsWith(n+'|')));
  h+=`<div class="atile"><div class="grids${nums.length===1?' one':''}">`;
  for(const n of nums){
    if(w.gendered){
      h+=`<table class="pick"><thead><tr><th class="corner">${cap(NL[n])}</th><th>Masculine</th><th>Feminine</th><th>Neuter</th></tr></thead><tbody>`;
      for(const c of cases){
        h+=`<tr><th>${cap(CL[c])}</th>`+['m','f','n'].map(g=>{
          const exists=has.has(n+'|'+c+'|'+g); const on=s.n===n&&s.c===c&&s.g===g;
          const mk=markOf(on,isRight(n,c,g),Pz.checked);
          return `<td><button class="pc${mk.cls}${exists?'':' na'}" data-cell="${n}|${c}|${g}" aria-pressed="${!Pz.checked&&on}" aria-label="${GL[g]} ${CL[c]} ${NL[n]}" ${Pz.checked||!exists?'disabled':''}>${Pz.checked?mk.icon:''}</button></td>`; }).join('')+'</tr>';
      }
      h+='</tbody></table>';
    } else {
      h+=`<table class="pick pnum"><thead><tr><th class="corner">${cap(NL[n])}</th></tr></thead><tbody>`;
      for(const c of cases){
        const exists=has.has(n+'|'+c+'|'); const on=s.n===n&&s.c===c;
        const mk=markOf(on,isRight(n,c,''),Pz.checked);
        h+=`<tr><td><button class="pc${mk.cls}${exists?'':' na'}" data-cell="${n}|${c}|" aria-pressed="${!Pz.checked&&on}" ${Pz.checked||!exists?'disabled':''}>${mk.icon}${cap(CL[c])}</button></td></tr>`;
      }
      h+='</tbody></table>';
    }
  }
  el.innerHTML=h+'</div></div>';
}
$(id('parse')).addEventListener('click',e=>{
  const Pz=CUR.parse; if(!Pz) return; const b=e.target.closest('button'); if(!b||b.disabled) return;
  if(b.id===P+'pnext'){ newParse(); return renderParse(); }
  if(Pz.checked) return;
  if(b.dataset.cell){ const [n,c,g]=b.dataset.cell.split('|'); Pz.sel={n,c,g:g||undefined}; checkParse(); }
});
function checkParse(){
  const Pz=CUR.parse; if(!Pz||Pz.checked||!Pz.sel.c) return;
  const vp=validParses(Pz.i); const s=Pz.sel;
  Pz.result=vp.some(x=>matches(x,s)); Pz.checked=true;
  const r=DATA[Pz.i];
  if(!Pz.result) requeue('parse',Pz.i);
  record('parse',Pz.result,`<span class="g">${esc(r.f)}</span>`,Pz.result?'':userParseText(s),[...new Set(vp.map(parseText))].join('; '));
  renderParse();
}

// ---------- context frames ----------
function frameFor(r){
  if(!S.ctx||!cfg.ctx) return null;
  const w=WORDS[r.ni]; let F=null;
  if(cfg.ctx==='noun'){ if(w.gendered||w.grp==='pers') return null; F=GVD_CTX.nounFrame(r,w); }
  else F=GVD_CTX.agreeFrame(r,w.lemma);
  if(!F) return null;
  const recs=BYWORD.get(r.ni).filter(x=>F.cells.some(([c,n,g])=>x.c===c&&x.n===n&&(g==null||x.g===g)));
  if(!recs.some(x=>x===r)) recs.push(r);
  F.acc=[...new Set(recs.flatMap(x=>x.acc))];
  F.forms=[...new Set(recs.flatMap(x=>[x.f,x.alt].filter(Boolean)))];
  return F;
}
const askHTML=(r,F)=>F?GVD_CTX.frameHTML(F):promptHTML(r);
const termLine=r=>`<span class="fbterm">${parseText(r)}</span>`;
const answerHTML=(r,F)=>(F?F.forms:[r.f,r.alt].filter(Boolean)).map(f=>`<span class="g">${esc(f)}</span>`).join(' or ');
const promptText=(r,F)=>F?F.text:`${headword(r.ni)} · ${parseText(r)}`;
function modeClick(b,rerender){ const sw=b.closest('.pswitch'); if(!sw) return false; S.ctx=sw.dataset.pm==='ctx'; save(); CUR.mc=null; CUR.type=null; sw.setAttribute('aria-checked',S.ctx); setTimeout(rerender,190); return true; }

// ---------- multiple choice ----------
// Distractors are built in slots so each wrong option differs from the answer by one feature.
const G=x=>x.g||'';
function dist(a,b){ return (a.c!==b.c?1:0)+(a.n!==b.n?1:0)+(G(a)!==G(b)?1:0); }
function slotPick(r,pred,used){
  const c=BYWORD.get(r.ni).filter(x=>!used.has(x.f)&&S.nums.has(x.n)&&pred(x));
  if(!c.length) return null;
  const inS=c.filter(x=>INSCOPE.has(x._i)); const pool=inS.length?inS:c;
  return pool[Math.floor(Math.random()*pool.length)];
}
function nominalSlots(r){
  const slots=[
    [x=>x.c===r.c&&G(x)===G(r)&&x.n!==r.n],          // same case and gender, other number
    [x=>G(x)===G(r)&&x.n===r.n&&x.c!==r.c],          // same gender and number, other case
  ];
  const third=[];
  if(r.g&&Math.random()<0.5) third.push(x=>x.c===r.c&&x.n===r.n&&G(x)!==G(r)); // same case and number, other gender
  third.push(()=>true);                                // anything else
  slots.push(third);
  return slots;
}
function newMC(){
  const i=nextIdx('mc'); if(i==null){ CUR.mc=null; return; }
  const r=DATA[i]; const F=frameFor(r); const used=new Set([r.f,r.alt,...r.acc,...(F?F.acc.concat(F.forms):[])].filter(Boolean)); const picks=[];
  for(const slot of nominalSlots(r)) for(const pred of slot){ const x=slotPick(r,pred,used); if(x){ picks.push(x.f); used.add(x.f); break; } }
  if(picks.length<3){
    const c=BYWORD.get(r.ni).filter(x=>!used.has(x.f)&&S.nums.has(x.n)).map(x=>({f:x.f,d:dist(x,r)+Math.random()*1.2})).sort((a,b)=>a.d-b.d);
    for(const x of c){ if(picks.length>=3) break; if(!used.has(x.f)){ picks.push(x.f); used.add(x.f); } }
  }
  CUR.mc={i,F,opts:shuffle([r.f,...picks]),picked:null};
}
function renderMC(){
  const el=$(id('mc'));
  if(!CUR.mc) newMC();
  const M=CUR.mc; if(!M){ el.innerHTML=emptyView(); return; }
  const r=DATA[M.i], F=M.F;
  let h=(CTXOK?GVD_CTX.modeHTML(S.ctx):'')+`<div class="qcard">${askHTML(r,F)}</div>`;
  if(M.picked!=null){ const ok=M.opts[M.picked]===r.f;
    const lines=ok?(F?[termLine(r)]:(r.alt?[`Also <span class="g">${esc(r.alt)}</span>`]:[])):[`You chose <span class="g gv">${esc(M.opts[M.picked])}</span>. The answer is ${answerHTML(r,F)}.`].concat(F?[termLine(r)]:[]);
    h+=fbHTML(ok,ok?'Correct':'Not quite',lines,P+'mnext'); }
  h+='<div class="mc">';
  M.opts.forEach((f,k)=>{ let cls='mco', icon=''; if(M.picked!=null){ if(f===r.f){cls+=' ok';icon=I_CHECK;} else if(k===M.picked){cls+=' no';icon=I_X;} }
    h+=`<button class="${cls}" data-o="${k}" ${M.picked!=null?'disabled':''}><span class="n">${k+1}</span><span>${esc(f)}</span>${icon}</button>`; });
  el.innerHTML=h+'</div>';
}
function pickMC(k){ const M=CUR.mc; if(!M||M.picked!=null||!M.opts[k]) return; M.picked=k; const r=DATA[M.i]; const ok=M.opts[k]===r.f; if(!ok) requeue('mc',M.i);
  record('mc',ok,esc(promptText(r,M.F)),ok?'':M.opts[k],r.f+(r.alt?' or '+r.alt:'')); renderMC(); }
$(id('mc')).addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.disabled) return; if(modeClick(b,renderMC)) return; if(b.id===P+'mnext'){ newMC(); return renderMC(); } if(b.dataset.o!=null) pickMC(+b.dataset.o); });

// ---------- type ----------
const STRIP=/[̀́͂̓̔̄̆]/g;
function norm(s){ return s.normalize('NFC').toLowerCase().trim().replace(/\s+/g,' ').replace(/\(ν\)$/,'').replace(/σ(?=$|\s)/g,'ς').normalize('NFC'); }
const loose=s=>s.normalize('NFD').replace(STRIP,'').normalize('NFC');
function newType(){ const i=nextIdx('type'); CUR.type=i==null?null:{i,F:frameFor(DATA[i]),given:'',state:null}; }
function renderType(){
  const el=$(id('type'));
  if(!CUR.type) newType();
  const T=CUR.type; if(!T){ el.innerHTML=emptyView(); return; }
  const r=DATA[T.i], F=T.F;
  let h=(CTXOK?GVD_CTX.modeHTML(S.ctx):'')+`<div class="qcard">${askHTML(r,F)}</div>`;
  if(T.state){ const ok=T.state==='ok';
    const ans=answerHTML(r,F); const multi=F?F.forms.length>1:!!r.alt;
    let lines=ok?(norm(T.given)===norm(r.f)&&!multi?[]:[`Listed as ${ans}`]):[`You typed <span class="g gv">${esc(T.given)}</span>. The answer is ${ans}.`];
    if(F) lines=lines.concat([termLine(r)]);
    h+=fbHTML(ok,ok?'Correct':(T.state==='accent'?'Right letters; check the accents and breathings':'Not quite'),lines,P+'tnext');
  }
  h+=`<div class="atile"><input class="tin ${T.state==='ok'?'ok':T.state?'no':''}" id="${P}tin" lang="grc" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type Greek or Latin characters" value="${esc(T.given)}" ${T.state?'readonly':''} aria-label="Your answer">`;
  h+=`<div class="actions"><label class="toggle"><input type="checkbox" id="${P}tstrict" ${S.strict?'checked':''}> Accents and breathings must match</label>${T.state?'':`<button class="btn primary" id="${P}tcheck">Check</button>`}</div>${window.LKEY_HTML}</div>`;
  el.innerHTML=h;
  if(!T.state){ const inp=$('#'+P+'tin'); inp.focus({preventScroll:true}); inp.setSelectionRange(inp.value.length,inp.value.length); }
}
function checkType(){
  const T=CUR.type; if(!T||T.state) return; const g=$('#'+P+'tin').value; if(!g.trim()) return; T.given=g;
  const r=DATA[T.i]; const ans=(T.F?T.F.acc:r.acc).map(norm); const n=norm(g);
  let ok=ans.includes(n); const looseOk=ans.map(loose).includes(loose(n));
  if(!ok&&!S.strict&&looseOk) ok=true;
  T.state=ok?'ok':(looseOk?'accent':'no');
  if(!ok) requeue('type',T.i);
  record('type',ok,esc(promptText(r,T.F)),ok?'':g,r.f+(r.alt?' or '+r.alt:''));
  renderType();
}
$(id('type')).addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(modeClick(b,renderType)) return; if(b.id===P+'tcheck') checkType(); if(b.id===P+'tnext'){ newType(); renderType(); } });
$(id('type')).addEventListener('change',e=>{ if(e.target.id===P+'tstrict'){ S.strict=e.target.checked; save(); } });
$(id('type')).addEventListener('input',e=>{ if(e.target.id===P+'tin'&&CUR.type){ if(!e.isComposing) GVD_translitInput(e.target); CUR.type.given=e.target.value; } });

// ---------- results ----------
function renderResults(){
  const el=$(id('results'));
  const by=m=>{ const a=RES.filter(r=>r.mode===m); return `${a.filter(r=>r.ok).length}/${a.length}`; };
  let h=`<div class="rsum"><div class="rs"><div class="k">Parse</div><div class="v">${by('parse')}</div></div><div class="rs"><div class="k">Choose</div><div class="v">${by('mc')}</div></div><div class="rs"><div class="k">Type</div><div class="v">${by('type')}</div></div></div>`;
  if(!RES.length) h+='<div class="empty">No answers yet this session.</div>';
  else {
    h+='<div class="rlist">'+RES.map(x=>`<div class="ri"><span class="s ${x.ok?'ok':'no'}" aria-label="${x.ok?'correct':'wrong'}"></span><span class="m">${x.mode==='mc'?'Choose':cap(x.mode)}</span><div class="d"><div>${x.prompt}</div><div>${x.given?`<span class="${x.mode==='parse'?'':'g '}gv">${esc(x.given)}</span> → `:''}<span class="${x.mode==='parse'?'':'g'}">${esc(x.answer)}</span></div></div></div>`).join('')+'</div>';
    h+=`<div class="actions"><button class="btn" id="${P}rclear">Clear results</button></div>`;
  }
  el.innerHTML=h;
}
$(id('results')).addEventListener('click',e=>{ if(e.target.id===P+'rclear'){ RES.length=0; window.GVD_refreshScore&&window.GVD_refreshScore(); renderResults(); } });

recompute();
return {
  prefix:P,
  preset(p){ S.groups=new Set(p.groups||[]); S.genders=new Set(p.genders||['m','f','n','irr']); S.nums=new Set(p.nums&&p.nums.length?p.nums:['sg','pl']); S.excl.clear(); recompute(); save(); },
  views:{setup:renderSetup,parse:renderParse,mc:renderMC,type:renderType,results:renderResults},
  leave(){ if(CUR.parse&&CUR.parse.checked) CUR.parse=null; if(CUR.mc&&CUR.mc.picked!=null) CUR.mc=null; if(CUR.type&&CUR.type.state) CUR.type=null; },
  score(){ return RES.filter(r=>r.ok).length+'/'+RES.length; },
  key(e,tab){
    if(tab==='parse'&&e.key==='Enter'){ e.preventDefault(); const Pz=CUR.parse; if(Pz&&Pz.checked){ newParse(); renderParse(); } }
    else if(tab==='mc'){ const M=CUR.mc; if(!M) return; if(e.key==='Enter'&&M.picked!=null){ e.preventDefault(); newMC(); renderMC(); } else if(/^[1-4]$/.test(e.key)) pickMC(+e.key-1); }
    else if(tab==='type'&&e.key==='Enter'){ e.preventDefault(); const T=CUR.type; if(!T) return; if(T.state){ newType(); renderType(); } else checkType(); }
  }
};
};
