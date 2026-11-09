// Context frames for Choose and Type: article + adjective + noun phrases built from the vocabulary data.
(function(){
const ART=NOUNS.findIndex(w=>w.lemma==='ὁ');
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const CELLS=[]; for(const n of ['sg','pl']) for(const c of ['nom','gen','dat','acc','voc']) CELLS.push([c,n]);
function artForm(c,n,g){ if(c==='voc') return 'ὦ'; const r=NDATA.find(x=>x.ni===ART&&x.c===c&&x.n===n&&x.g===g); return r?r.f:null; }
function nounGenders(w){ const d=w.dict; if(/τό$/.test(d)) return ['n']; if(/ὁ\/ἡ$/.test(d)) return ['m','f']; if(/ἡ$/.test(d)) return ['f']; if(/ὁ$/.test(d)) return ['m']; return null; }
const NOUNIDX=NOUNS.map((w,i)=>i).filter(i=>!NOUNS[i].gendered&&NOUNS[i].grp!=='pers'&&nounGenders(NOUNS[i]));
const nForm=(ni,c,n)=>{ const r=NDATA.find(x=>x.ni===ni&&x.c===c&&x.n===n); return r?(r.f.endsWith('(ν)')?r.acc[0]:r.f):null; };
const aForm=(ai,c,n,g)=>{ const r=ADATA.find(x=>x.ni===ai&&x.c===c&&x.n===n&&x.g===g); return r?r.f:null; };
const slot=lemma=>({slot:lemma});
const toText=words=>words.map(w=>w.slot?`[${w.slot}]`:w).join(' ');
// an acute on the final syllable becomes grave when another word follows
function grave(w){ const d=w.normalize('NFD'); const i=d.lastIndexOf('\u0301'); if(i<0) return w; if(/[αεηιουω]/.test(d.slice(i+1))) return w; return (d.slice(0,i)+'\u0300'+d.slice(i+1)).normalize('NFC'); }
const finish=words=>words.map((w,i)=>(!w.slot&&i<words.length-1)?grave(w):w);

// a noun of gender g only (never ὁ/ἡ nouns, so the article settles the gender) with a form at (c,n)
function pickNoun(c,n,g,avoid){
  const ok=NOUNIDX.filter(i=>{ const gs=nounGenders(NOUNS[i]); return gs.length===1&&gs[0]===g&&NOUNS[i].lemma!==avoid&&nForm(i,c,n); });
  return ok.length?rnd(ok):null;
}
// cells (c,n,g) consistent with the visible article and context word
function cellsMatching(A,ctxForm,ctxAt){ const out=[]; for(const [c,n] of CELLS) for(const g of ['m','f','n']){ if(artForm(c,n,g)!==A) continue; if(ctxAt(c,n,g)!==ctxForm) continue; out.push([c,n,g]); } return out; }

// target noun record r (lemma w) -> article + adjective + [noun]
function nounFrame(r,w){
  const gs=nounGenders(w); if(!gs) return null;
  const g=r.c==='voc'&&gs.length>1?gs[0]:rnd(gs);
  const adjs=ADJS.map((a,i)=>i).filter(i=>ADJS[i].lemma!==w.lemma&&aForm(i,r.c,r.n,g)); if(!adjs.length) return null;
  const ai=rnd(adjs), A=artForm(r.c,r.n,g), AF=aForm(ai,r.c,r.n,g); if(!A||!AF) return null;
  const cells=cellsMatching(A,AF,(c,n,gg)=>aForm(ai,c,n,gg)).filter(([c,n,gg])=>gs.includes(gg));
  const words=finish([A,AF,slot(w.lemma)]);
  return {words,text:toText(words),cells:cells.map(([c,n])=>[c,n,null])};
}
// target gendered record r (adjective or participle) -> article + [word] + noun
function agreeFrame(r,lemma){
  const ni=pickNoun(r.c,r.n,r.g,lemma); if(ni==null) return null;
  const A=artForm(r.c,r.n,r.g), NF=nForm(ni,r.c,r.n); if(!A||!NF) return null;
  const gs=nounGenders(NOUNS[ni]);
  const cells=cellsMatching(A,NF,(c,n,g)=>gs.includes(g)?nForm(ni,c,n):null);
  const words=finish([A,slot(lemma),NF]);
  return {words,text:toText(words),cells};
}
function frameHTML(F){ return `<div class="qctx g">${F.words.map(w=>w.slot?`<span class="slot">${w.slot}</span>`:w).join(' ')}</div>`; }
function modeHTML(on){ return `<div class="pmode"><button class="pswitch" role="switch" aria-checked="${on}" aria-label="Ask with context instead of grammar terms" data-pm="${on?'terms':'ctx'}"><span class="pthumb" aria-hidden="true"></span><span class="plab">Grammar terms</span><span class="plab">Context</span></button></div>`; }
window.GVD_CTX={nounFrame,agreeFrame,frameHTML,modeHTML};
})();
