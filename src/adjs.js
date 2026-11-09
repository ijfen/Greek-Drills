// ---- Greek adjective data (uses NE, decline12 from nouns.js) ----
// stem: masculine stem with * before the accented vowel; oxy: accented on the ultima
function adj(stem,fem,oxy,opts){
  opts=opts||{};
  const tag=(rows,g)=>rows.map(r=>Object.assign(r,{g}));
  const m=tag(decline12(stem,'t2',oxy,false),'m');
  const f=opts.two?tag(decline12(stem,'t2',oxy,false),'f'):tag(decline12(stem,fem==='a'?'t1a':'t1h',oxy,false),'f');
  const n=tag(decline12(stem,'t2n',oxy,false),'n');
  let all=m.concat(f,n);
  if(opts.neut){ for(const r of all) if(r.g==='n'&&r.n==='sg'&&r.c!=='gen'&&r.c!=='dat'){ r.f=opts.neut; r.acc=[opts.neut]; } }
  if(opts.noVoc) all=all.filter(r=>r.c!=='voc');
  return all;
}
const ADJS=[
 // Type 2-1-2, feminine in -η
 {lemma:'ἀγαθός',def:'good, virtuous, brave, noble',dict:'ἀγαθός, ἀγαθή, ἀγαθόν',grp:'a212',forms:()=>adj('ἀγαθ','h',true)},
 {lemma:'κακός',def:'bad, wicked, cowardly',dict:'κακός, κακή, κακόν',grp:'a212',forms:()=>adj('κακ','h',true)},
 {lemma:'καλός',def:'beautiful, noble, honorable',dict:'καλός, καλή, καλόν',grp:'a212',forms:()=>adj('καλ','h',true)},
 {lemma:'κοινός',def:'common, shared, mutual',dict:'κοινός, κοινή, κοινόν',grp:'a212',forms:()=>adj('κοιν','h',true)},
 {lemma:'ὀρθός',def:'upright, straight, true, regular',dict:'ὀρθός, ὀρθή, ὀρθόν',grp:'a212',forms:()=>adj('ὀρθ','h',true)},
 {lemma:'σοφός',def:'wise, clever, skilled',dict:'σοφός, σοφή, σοφόν',grp:'a212',forms:()=>adj('σοφ','h',true)},
 {lemma:'χαλεπός',def:'difficult, troublesome',dict:'χαλεπός, χαλεπή, χαλεπόν',grp:'a212',forms:()=>adj('χαλεπ','h',true)},
 {lemma:'ἄριστος',def:'best, noblest',dict:'ἄριστος, ἀρίστη, ἄριστον',grp:'a212',forms:()=>adj('*ἀριστ','h',false)},
 {lemma:'φίλος',def:'loved, beloved, dear; loving, friendly',dict:'φίλος, φίλη, φίλον',grp:'a212',forms:()=>adj('φ*ιλ','h',false)},
 {lemma:'ἴσος',def:'equal, the same as',dict:'ἴσος, ἴση, ἴσον',grp:'a212',forms:()=>adj('*ἰσ','h',false)},
 {lemma:'ἄλλος',def:'other, another',dict:'ἄλλος, ἄλλη, ἄλλο',grp:'a212',noVoc:true,note:'Neuter singular ἄλλο has no -ν. No vocative.',forms:()=>adj('*ἀλλ','h',false,{neut:'ἄλλο',noVoc:true})},
 // Type 2-1-2, feminine in -ᾱ
 {lemma:'δίκαιος',def:'right, just',dict:'δίκαιος, δικαία, δίκαιον',grp:'a212a',forms:()=>adj('δ*ικαι','a',false)},
 {lemma:'ἄξιος',def:'worthy, deserving',dict:'ἄξιος, ἀξία, ἄξιον',grp:'a212a',forms:()=>adj('*ἀξι','a',false)},
 {lemma:'αἰσχρός',def:'ugly, shameful, disgraceful',dict:'αἰσχρός, αἰσχρά, αἰσχρόν',grp:'a212a',forms:()=>adj('αἰσχρ','a',true)},
 {lemma:'νέος',def:'young, new, fresh',dict:'νέος, νέα, νέον',grp:'a212a',forms:()=>adj('ν*ε','a',false)},
 {lemma:'ῥᾴδιος',def:'easy',dict:'ῥᾴδιος, ῥᾳδία, ῥᾴδιον',grp:'a212a',forms:()=>adj('ῥ*ᾳδι','a',false)},
 {lemma:'ἀνδρεῖος',def:'brave, manly, courageous',dict:'ἀνδρεῖος, ἀνδρεία, ἀνδρεῖον',grp:'a212a',forms:()=>adj('ἀνδρ*ει','a',false)},
 // Type 2-2 (compound)
 {lemma:'ἄδικος',def:'unjust',dict:'ἄδικος, ἄδικον',grp:'a22',twoEnd:true,forms:()=>adj('*ἀδικ','',false,{two:true})},
 {lemma:'ἀθάνατος',def:'deathless, immortal',dict:'ἀθάνατος, ἀθάνατον',grp:'a22',twoEnd:true,forms:()=>adj('ἀθ*ανατ','',false,{two:true})},
 {lemma:'ἀνάξιος',def:'unworthy; undeserved',dict:'ἀνάξιος, ἀνάξιον',grp:'a22',twoEnd:true,forms:()=>adj('ἀν*αξι','',false,{two:true})},
];
ADJS.forEach(w=>{ w.gendered=true; });
const ADATA=[];
ADJS.forEach((w,ni)=>{ for(const r of w.forms()){ r.ni=ni; ADATA.push(r); } });
