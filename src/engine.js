// ---- Greek verb morphology engine (accent rules + endings) ----
const ACU='́', CIRC='͂', MAC='̄', ISUB='ͅ', DIA='̈';
const VOW='αεηιουω';
const COMB=/[̀-ͯ]/;

function units(s){
  const out=[]; let home=false;
  for(const c of s.normalize('NFD')){
    if(c==='*'){home=true;continue;}
    if(COMB.test(c)){ out[out.length-1].marks.push(c); }
    else { out.push({ch:c,marks:[],home}); home=false; }
  }
  return out;
}
function nuclei(us,opt){
  const nu=[];
  for(let i=0;i<us.length;i++){
    const u=us[i]; if(!VOW.includes(u.ch)) continue;
    const nx=us[i+1];
    let diph=false;
    if(nx && VOW.includes(nx.ch) && !nx.marks.includes(DIA) && !u.marks.includes(ISUB) && !nx.home){
      if(nx.ch==='ι' && 'αεου'.includes(u.ch)) diph=true;
      if(nx.ch==='υ' && 'αεοη'.includes(u.ch)) diph=true;
    }
    if(diph){
      let long=true;
      const isFinal=(i+1===us.length-1);
      if(isFinal && nx.ch==='ι' && 'αο'.includes(u.ch) && !opt) long=false;
      nu.push({target:nx,long,home:u.home}); i++;
    } else {
      let long='ηω'.includes(u.ch) || u.marks.includes(MAC) || u.marks.includes(ISUB);
      nu.push({target:u,long,home:u.home});
    }
  }
  return nu;
}
function render(us){ return us.map(u=>u.ch+u.marks.filter(m=>m!==MAC).join('')).join('').normalize('NFC'); }
function put(nu,fromEnd,kind){ nu[nu.length-1-fromEnd].target.marks.push(kind==='circ'?CIRC:ACU); }

function recessive(s,opt){
  const us=units(s), nu=nuclei(us,opt), n=nu.length, ult=nu[n-1].long;
  if(n===1) put(nu,0,'acute');
  else if(n>=3 && !ult) put(nu,2,'acute');
  else put(nu,1,(nu[n-2].long && !ult)?'circ':'acute');
  return render(us);
}
function persistent(s,femGenPl){
  const us=units(s), nu=nuclei(us,false), n=nu.length, ult=nu[n-1].long;
  if(femGenPl){ put(nu,0,'circ'); return render(us); }
  let hi=nu.findIndex(x=>x.home); if(hi<0) throw new Error('no home in '+s);
  let pos=n-1-hi; const max=ult?1:2; if(pos>max) pos=max;
  put(nu,pos,(pos===1 && nu[n-2].long && !ult)?'circ':'acute');
  return render(us);
}
function fixed(s,fromEnd,kind){
  const us=units(s), nu=nuclei(us,false); put(nu,fromEnd,kind); return render(us);
}

// ---- endings ----
const PN=[[1,'sg'],[2,'sg'],[3,'sg'],[1,'pl'],[2,'pl'],[3,'pl']];
const IMP_PN=[[2,'sg'],[3,'sg'],[2,'pl'],[3,'pl']];
const E={
  pres_act_ind:['ω','εις','ει','ομεν','ετε','ουσι|ν'],
  pres_mp_ind:['ομαι','ῃ/ει','εται','ομεθα','εσθε','ονται'],
  past_act_ind:['ον','ες','ε|ν','ομεν','ετε','ον'],
  past_mp_ind:['ομην','ου','ετο','ομεθα','εσθε','οντο'],
  act_subj:['ω','ῃς','ῃ','ωμεν','ητε','ωσι|ν'],
  mp_subj:['ωμαι','ῃ','ηται','ωμεθα','ησθε','ωνται'],
  act_opt:['οιμι','οις','οι','οιμεν','οιτε','οιεν'],
  mp_opt:['οιμην','οιο','οιτο','οιμεθα','οισθε','οιντο'],
  act_imp:['ε','ετω','ετε','οντων'],
  mp_imp:['ου','εσθω','εσθε','εσθων'],
};
const CASES=['nom','gen','dat','acc','voc'];
const GEN=['m','f','n'];
// [gender][number] -> 5 case endings
const PTC_ACT={
  m:{sg:['ων','οντος','οντι','οντα','ων'],pl:['οντες','οντων','ουσι|ν','οντας','οντες']},
  f:{sg:['ουσα','ουσης','ουσῃ','ουσαν','ουσα'],pl:['ουσαι','ουσων','ουσαις','ουσᾱς','ουσαι']},
  n:{sg:['ον','οντος','οντι','ον','ον'],pl:['οντα','οντων','ουσι|ν','οντα','οντα']},
};
const PTC_MID={
  m:{sg:['ομενος','ομενου','ομενῳ','ομενον','ομενε'],pl:['ομενοι','ομενων','ομενοις','ομενους','ομενοι']},
  f:{sg:['ομενη','ομενης','ομενῃ','ομενην','ομενη'],pl:['ομεναι','ομενων','ομεναις','ομενᾱς','ομεναι']},
  n:{sg:['ομενον','ομενου','ομενῳ','ομενον','ομενον'],pl:['ομενα','ομενων','ομενοις','ομενα','ομενα']},
};

// build a form record; ending may contain "|ν" (movable nu) or "a/b" (alternate endings)
function mk(stem,ending,accentFn){
  const [primE,altE]=ending.split('/');
  const one=(e)=>{
    const [base,nu]=e.split('|');
    const w=accentFn(stem,base);
    return nu ? {f:w+'(ν)',acc:[w,w+'ν']} : {f:w,acc:[w]};
  };
  const p=one(primE);
  if(altE){ const a=one(altE); p.alt=a.f; p.acc=p.acc.concat(a.acc); }
  return p;
}
const REC=(st,e)=>recessive(st+e,false);
const REC_OPT=(st,e)=>recessive(st+e,true);

function finite(out,vi,t,vo,m,stem,endings,pnList,accFn,overrides){
  endings.forEach((e,i)=>{
    const [p,n]=pnList[i];
    let rec;
    const key=p+n;
    if(overrides && overrides[key]) rec=overrides[key];
    else rec=mk(stem,e,accFn);
    out.push(Object.assign({vi,t,vo,m,p,n},rec));
  });
}
function participle(out,vi,t,vo,stem,table,mode){
  // mode 'stem': home = last nucleus of stem ; 'theme': home = thematic vowel (first vowel of ending)
  for(const g of GEN) for(const n of ['sg','pl']) table[g][n].forEach((e,ci)=>{
    const c=CASES[ci];
    const [base,nu]=e.split('|');
    let s;
    if(mode==='stem'){
      // insert * before last nucleus of stem
      s=markLastNucleus(stem)+base;
    } else s=stem+'*'+base;
    const femGenPl=(table===PTC_ACT && g==='f' && n==='pl' && c==='gen');
    const w=persistent(s,femGenPl);
    const rec=nu?{f:w+'(ν)',acc:[w,w+'ν']}:{f:w,acc:[w]};
    out.push(Object.assign({vi,t,vo,m:'ptc',c,g,n},rec));
  });
}
function markLastNucleus(stem){
  const d=Array.from(stem.normalize('NFD'));
  // find last vowel; if it is second element of diphthong, step back
  let i=d.length-1;
  while(i>=0 && !VOW.includes(d[i])) i--;
  // skip combining marks back to base handled since we only test bases
  let j=i-1; while(j>=0 && COMB.test(d[j])) j--;
  if(j>=0 && VOW.includes(d[j]) && ((d[i]==='ι'&&'αεου'.includes(d[j]))||(d[i]==='υ'&&'αεοη'.includes(d[j])))) i=j;
  d.splice(i,0,'*');
  return d.join('');
}

// ---- verbs ----
// p: present stem, ip: imperfect (augmented) stem, f: future stem, fv: 'act' (future active+middle) | 'mid' (middle-only future)
// a: root aorist unaugmented stem, ai: augmented, amid: has aorist middle, dep: deponent present
const VERBS=[
 // Thematic verbs (aorist not yet / irregular)
 {lemma:'λύω',def:'loosen, unbind, release; repeal',pp:'λύω, λύσω',grp:'them',p:'λῡ',ip:'ἐλῡ',f:'λῡσ',fv:'act'},
 {lemma:'παιδεύω',def:'train, teach, educate',pp:'παιδεύω, παιδεύσω',grp:'them',p:'παιδευ',ip:'ἐπαιδευ',f:'παιδευσ',fv:'act'},
 {lemma:'πείθω',def:'persuade; (mid.) trust in, obey',pp:'πείθω, πείσω',grp:'them',p:'πειθ',ip:'ἐπειθ',f:'πεισ',fv:'act'},
 {lemma:'πράττω',def:'do, bring about, accomplish; act',pp:'πράττω, πράξω',grp:'them',p:'πρᾱττ',ip:'ἐπρᾱττ',f:'πρᾱξ',fv:'act'},
 {lemma:'λέγω',def:'gather, select; count; tell, recount; say, speak',pp:'λέγω, λέξω',grp:'them',p:'λεγ',ip:'ἐλεγ',f:'λεξ',fv:'act'},
 {lemma:'ἔχω',def:'have, hold; (mid.) hold for oneself, cling to',pp:'ἔχω, ἕξω',grp:'them',p:'ἐχ',ip:'εἰχ',f:'ἑξ',fv:'act',note:'Aorist ἔσχον is irregular and not included.',noteT:'aor'},
 {lemma:'ἄρχω',def:'begin; lead, rule, govern',pp:'ἄρχω, ἄρξω',grp:'them',p:'ἀρχ',ip:'ἠρχ',f:'ἀρξ',fv:'act'},
 {lemma:'κλέπτω',def:'steal',pp:'κλέπτω, κλέψω',grp:'them',p:'κλεπτ',ip:'ἐκλεπτ',f:'κλεψ',fv:'act'},
 {lemma:'κολάζω',def:'punish, chastise',pp:'κολάζω, κολάσω',grp:'them',p:'κολαζ',ip:'ἐκολαζ',f:'κολασ',fv:'act'},
 {lemma:'παύω',def:'stop, put an end to; (mid.) cease',pp:'παύω, παύσω',grp:'them',p:'παυ',ip:'ἐπαυ',f:'παυσ',fv:'act'},
 {lemma:'φέρω',def:'carry, bring, fetch; carry off or away',pp:'φέρω, οἴσω',grp:'them',p:'φερ',ip:'ἐφερ',f:'οἰσ',fv:'act'},
 {lemma:'χαίρω',def:'be happy, rejoice at, take joy in',pp:'χαίρω, χαιρήσω',grp:'them',p:'χαιρ',ip:'ἐχαιρ',f:'χαιρησ',fv:'act',noMid:true},
 {lemma:'νομίζω',def:'think, believe that; hold as a custom, be accustomed to',pp:'νομίζω',grp:'them',p:'νομιζ',ip:'ἐνομιζ',note:'Future νομιῶ is contracted and not included.',noteT:'fut'},
 {lemma:'φαίνω',def:'bring to light, make appear, make clear; (pass.) appear',pp:'φαίνω',grp:'them',p:'φαιν',ip:'ἐφαιν',note:'Future φανῶ is contracted and not included.',noteT:'fut'},
 {lemma:'γιγνώσκω',def:'come to know, learn; judge, think, determine that',pp:'γιγνώσκω, γνώσομαι',grp:'them',p:'γιγνωσκ',ip:'ἐγιγνωσκ',f:'γνωσ',fv:'mid',note:'Aorist ἔγνων is athematic and not included.',noteT:'aor'},
 // Root aorists
 {lemma:'λείπω',def:'leave, leave behind; abandon, desert',pp:'λείπω, λείψω, ἔλιπον',grp:'root',p:'λειπ',ip:'ἐλειπ',f:'λειψ',fv:'act',a:'λιπ',ai:'ἐλιπ',amid:true},
 {lemma:'λαμβάνω',def:'take; seize; apprehend, comprehend; receive',pp:'λαμβάνω, λήψομαι, ἔλαβον',grp:'root',p:'λαμβαν',ip:'ἐλαμβαν',f:'ληψ',fv:'mid',a:'λαβ',ai:'ἐλαβ',amid:true,labe:true},
 {lemma:'φεύγω',def:'flee, escape; be accused or prosecuted',pp:'φεύγω, φεύξομαι, ἔφυγον',grp:'root',p:'φευγ',ip:'ἐφευγ',f:'φευξ',fv:'mid',a:'φυγ',ai:'ἐφυγ'},
 {lemma:'πάσχω',def:'have done to one, suffer, be affected',pp:'πάσχω, πείσομαι, ἔπαθον',grp:'root',p:'πασχ',ip:'ἐπασχ',f:'πεισ',fv:'mid',a:'παθ',ai:'ἐπαθ',noMid:true},
 {lemma:'μανθάνω',def:'learn, ascertain',pp:'μανθάνω, μαθήσομαι, ἔμαθον',grp:'root',p:'μανθαν',ip:'ἐμανθαν',f:'μαθησ',fv:'mid',a:'μαθ',ai:'ἐμαθ'},
 {lemma:'τυγχάνω',def:'hit, light upon, meet by chance; reach, gain, obtain; happen to be',pp:'τυγχάνω, τεύξομαι, ἔτυχον',grp:'root',p:'τυγχαν',ip:'ἐτυγχαν',f:'τευξ',fv:'mid',a:'τυχ',ai:'ἐτυχ'},
 {lemma:'λανθάνω',def:'escape the notice of, be unknown; (mid. and pass.) forget',pp:'λανθάνω, λήσω, ἔλαθον',grp:'root',p:'λανθαν',ip:'ἐλανθαν',f:'λησ',fv:'act',a:'λαθ',ai:'ἐλαθ',amid:true},
 {lemma:'ἄγω',def:'lead, carry, bring; pass (time)',pp:'ἄγω, ἄξω, ἤγαγον',grp:'root',p:'ἀγ',ip:'ἠγ',f:'ἀξ',fv:'act',a:'ἀγαγ',ai:'ἠγαγ',amid:true},
 // Deponents
 {lemma:'βούλομαι',def:'will, wish (to); be willing (to)',pp:'βούλομαι, βουλήσομαι',grp:'dep',dep:true,p:'βουλ',ip:'ἐβουλ',ipAlt:'ἠβουλ',f:'βουλησ',fv:'mid',ei2:true},
 {lemma:'οἴομαι',def:'think, suppose, imagine',pp:'οἴομαι or οἶμαι, οἰήσομαι',grp:'dep',dep:true,p:'οἰ',ip:'ᾠ',f:'οἰησ',fv:'mid',ei2:true,oiomai:true},
 {lemma:'γίγνομαι',def:'come into being, be born, become',pp:'γίγνομαι, γενήσομαι, ἐγενόμην',grp:'dep',dep:true,p:'γιγν',ip:'ἐγιγν',f:'γενησ',fv:'mid',a:'γεν',ai:'ἐγεν',amid:true},
 // εἰμί
 {lemma:'εἰμί',def:'be, exist',pp:'εἰμί, ἔσομαι, ἦν',grp:'eimi',eimi:true},
];

// present-system class and aorist type
VERBS.forEach(v=>{ v.cls=v.grp==='root'?'them':v.grp; v.aorType=v.a?'root':null; });

function genVerb(vi){
  const v=VERBS[vi], out=[];
  if(v.eimi){ genEimi(vi,out); return out; }
  // present
  if(!v.dep){
    finite(out,vi,'pres','act','ind',v.p,E.pres_act_ind,PN,REC);
    finite(out,vi,'pres','act','subj',v.p,E.act_subj,PN,REC);
    finite(out,vi,'pres','act','opt',v.p,E.act_opt,PN,REC_OPT);
    finite(out,vi,'pres','act','imp',v.p,E.act_imp,IMP_PN,REC);
    out.push(Object.assign({vi,t:'pres',vo:'act',m:'inf'},mk(v.p,'ειν',REC)));
    participle(out,vi,'pres','act',v.p,PTC_ACT,'stem');
  }
  if(!v.noMid){
  const mp2 = v.ei2 ? 'ει' : 'ῃ/ει';
  const presMp=E.pres_mp_ind.slice(); presMp[1]=mp2;
  const ov={};
  if(v.oiomai){ const a=mk(v.p,'ομαι',REC); a.alt='οἶμαι'; a.acc.push('οἶμαι'); ov['1sg']=a; }
  finite(out,vi,'pres','mp','ind',v.p,presMp,PN,REC,ov);
  finite(out,vi,'pres','mp','subj',v.p,E.mp_subj,PN,REC);
  finite(out,vi,'pres','mp','opt',v.p,E.mp_opt,PN,REC_OPT);
  finite(out,vi,'pres','mp','imp',v.p,E.mp_imp,IMP_PN,REC);
  out.push(Object.assign({vi,t:'pres',vo:'mp',m:'inf'},mk(v.p,'εσθαι',REC)));
  participle(out,vi,'pres','mp',v.p,PTC_MID,'theme');
  }
  // imperfect
  if(!v.dep) finite(out,vi,'impf','act','ind',v.ip,E.past_act_ind,PN,REC);
  if(!v.noMid){
  const ovi={};
  if(v.oiomai){ const a=mk(v.ip,'ομην',REC); a.alt='ᾤμην'; a.acc.push('ᾤμην'); ovi['1sg']=a; }
  const before=out.length;
  finite(out,vi,'impf','mp','ind',v.ip,E.past_mp_ind,PN,REC,ovi);
  if(v.ipAlt){ for(let k=before;k<out.length;k++){ const r=out[k]; const e=E.past_mp_ind[k-before]; const a=mk(v.ipAlt,e,REC); r.alt=a.f; r.acc=r.acc.concat(a.acc);} }
  }
  // future
  if(v.f){
    if(v.fv==='act'){
      finite(out,vi,'fut','act','ind',v.f,E.pres_act_ind,PN,REC);
      out.push(Object.assign({vi,t:'fut',vo:'act',m:'inf'},mk(v.f,'ειν',REC)));
      participle(out,vi,'fut','act',v.f,PTC_ACT,'stem');
    }
    if(!(v.noMid && v.fv==='act')){
    finite(out,vi,'fut','mid','ind',v.f,E.pres_mp_ind,PN,REC);
    out.push(Object.assign({vi,t:'fut',vo:'mid',m:'inf'},mk(v.f,'εσθαι',REC)));
    participle(out,vi,'fut','mid',v.f,PTC_MID,'theme');
    }
  }
  // root aorist
  if(v.a){
    if(!v.dep){
      finite(out,vi,'aor','act','ind',v.ai,E.past_act_ind,PN,REC);
      finite(out,vi,'aor','act','subj',v.a,E.act_subj,PN,REC);
      finite(out,vi,'aor','act','opt',v.a,E.act_opt,PN,REC_OPT);
      const ovA={};
      if(v.labe){ const w=fixed(v.a+'ε',0,'acute'); ovA['2sg']={f:w,acc:[w]}; }
      finite(out,vi,'aor','act','imp',v.a,E.act_imp,IMP_PN,REC,ovA);
      out.push(Object.assign({vi,t:'aor',vo:'act',m:'inf'},(()=>{const w=fixed(v.a+'ειν',0,'circ');return{f:w,acc:[w]};})()));
      participle(out,vi,'aor','act',v.a,PTC_ACT,'theme');
    }
    if(v.amid){
      finite(out,vi,'aor','mid','ind',v.ai,E.past_mp_ind,PN,REC);
      finite(out,vi,'aor','mid','subj',v.a,E.mp_subj,PN,REC);
      finite(out,vi,'aor','mid','opt',v.a,E.mp_opt,PN,REC_OPT);
      const w2=fixed(v.a+'ου',0,'circ');
      finite(out,vi,'aor','mid','imp',v.a,E.mp_imp,IMP_PN,REC,{'2sg':{f:w2,acc:[w2]}});
      const wi=fixed(v.a+'εσθαι',1,'acute');
      out.push({vi,t:'aor',vo:'mid',m:'inf',f:wi,acc:[wi]});
      participle(out,vi,'aor','mid',v.a,PTC_MID,'theme');
    }
  }
  return out;
}
function lit(f,alt){ const r={f,acc:[f]}; if(alt){r.alt=alt;r.acc.push(alt);} return r; }
function litNu(base){ return {f:base+'(ν)',acc:[base,base+'ν']}; }
function genEimi(vi,out){
  const pres=[lit('εἰμί'),lit('εἶ'),litNu('ἐστί'),lit('ἐσμέν'),lit('ἐστέ'),litNu('εἰσί')];
  pres.forEach((r,i)=>out.push(Object.assign({vi,t:'pres',vo:'act',m:'ind',p:PN[i][0],n:PN[i][1]},r)));
  out.push(Object.assign({vi,t:'pres',vo:'act',m:'inf'},lit('εἶναι')));
  // participle ὤν οὖσα ὄν: root-aorist pattern on empty stem, smooth breathing on first vowel
  for(const g of GEN) for(const n of ['sg','pl']) PTC_ACT[g][n].forEach((e,ci)=>{
    const c=CASES[ci]; const [base,nu]=e.split('|');
    const femGenPl=(g==='f'&&n==='pl'&&c==='gen');
    let w=persistent('*'+base,femGenPl);
    w=addSmooth(w);
    out.push(Object.assign({vi,t:'pres',vo:'act',m:'ptc',c,g,n},nu?{f:w+'(ν)',acc:[w,w+'ν']}:{f:w,acc:[w]}));
  });
  const impf=[lit('ἦ','ἦν'),lit('ἦσθα'),lit('ἦν'),lit('ἦμεν'),lit('ἦτε'),lit('ἦσαν')];
  impf.forEach((r,i)=>out.push(Object.assign({vi,t:'impf',vo:'act',m:'ind',p:PN[i][0],n:PN[i][1]},r)));
  const fut=[lit('ἔσομαι'),lit('ἔσῃ','ἔσει'),lit('ἔσται'),lit('ἐσόμεθα'),lit('ἔσεσθε'),lit('ἔσονται')];
  fut.forEach((r,i)=>out.push(Object.assign({vi,t:'fut',vo:'mid',m:'ind',p:PN[i][0],n:PN[i][1]},r)));
  out.push(Object.assign({vi,t:'fut',vo:'mid',m:'inf'},lit('ἔσεσθαι')));
  participle(out,vi,'fut','mid','ἐσ',PTC_MID,'theme');
}
function addSmooth(w){
  const d=Array.from(w.normalize('NFD'));
  let i=d.findIndex(c=>VOW.includes(c));
  if(VOW.includes(d[i+1]) && ((d[i+1]==='υ'&&'αεοη'.includes(d[i]))||(d[i+1]==='ι'&&'αεου'.includes(d[i])))) i=i+1;
  d.splice(i+1,0,'̓');
  return d.join('').normalize('NFC');
}

const DATA=[]; VERBS.forEach((v,vi)=>{ for(const r of genVerb(vi)) DATA.push(r); });

if(typeof module!=='undefined') module.exports={VERBS,DATA,recessive,persistent};
