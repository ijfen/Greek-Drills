// ---- Greek noun & pronoun data (uses units/nuclei/render/put/persistent from engine.js) ----
const NCASES=['nom','gen','dat','acc','voc'];
const NE={
  t1a:{sg:['ᾱ','ᾱς','ᾳ','ᾱν','ᾱ'],pl:['αι','ων','αις','ᾱς','αι']},
  t1h:{sg:['η','ης','ῃ','ην','η'],pl:['αι','ων','αις','ᾱς','αι']},
  t1s:{sg:['α','ᾱς','ᾳ','αν','α'],pl:['αι','ων','αις','ᾱς','αι']},
  t1mas:{sg:['ᾱς','ου','ᾳ','ᾱν','ᾱ'],pl:['αι','ων','αις','ᾱς','αι']},
  t1mes:{sg:['ης','ου','ῃ','ην','α'],pl:['αι','ων','αις','ᾱς','αι']},
  t2:{sg:['ος','ου','ῳ','ον','ε'],pl:['οι','ων','οις','ους','οι']},
  t2n:{sg:['ον','ου','ῳ','ον','ον'],pl:['α','ων','οις','α','α']},
};

// stem: with * before the accented vowel. oxy: accent on the ultima in the nominative (types 1/2)
function decline12(stem,tbl,oxy,isT1){
  const out=[];
  for(const n of ['sg','pl']) NE[tbl][n].forEach((e,ci)=>{
    const c=NCASES[ci]; let w;
    if(isT1&&n==='pl'&&c==='gen') w=persistent(stem.replace('*','')+'*'+e,true);
    else if(oxy){
      const s=stem.replace('*','')+e;
      w=(c==='gen'||c==='dat')?fixedCirc(s):fixedAcuteUlt(s);
    } else w=persistent(stem+e,false);
    out.push({c,n,f:w,acc:[w]});
  });
  return out;
}
function fixedCirc(s){ const us=units(s), nu=nuclei(us,false); put(nu,0,'circ'); return render(us); }
function fixedAcuteUlt(s){ const us=units(s), nu=nuclei(us,false); put(nu,0,'acute'); return render(us); }

// Type 3: forms given explicitly (already accented)
function t3(list){ // [nom,gen,dat,acc,voc, nomPl,genPl,datPl,accPl,vocPl]
  return list.map((f,i)=>{ const c=NCASES[i%5], n=i<5?'sg':'pl';
    if(f==null) return null;
    const [a,alt]=f.split('/');
    const nu=a.endsWith('(ν)');
    const base=nu?a.slice(0,-3):a;
    const r={c,n,f:a,acc:nu?[base,base+'ν']:[a]};
    if(alt){ r.alt=alt; r.acc.push(alt); }
    return r; }).filter(Boolean);
}
// Gendered pronouns: rows = case (no voc), columns m f n, per number
function gp(sg,pl){ // sg/pl: arrays of 4 rows "m|f|n"
  const out=[];
  for(const [n,rows] of [['sg',sg],['pl',pl]]) rows.forEach((row,ci)=>{
    if(!row) return;
    row.split('|').forEach((cell,gi)=>{
      if(!cell||cell==='-') return;
      const g='mfn'[gi]; const [a,alt]=cell.split('/');
      const nu=a.endsWith('(ν)'); const base=nu?a.slice(0,-3):a;
      const r={c:NCASES[ci],n,g,f:a,acc:nu?[base,base+'ν']:[a]};
      if(alt){ r.alt=alt; r.acc.push(alt); }
      out.push(r);
    });
  });
  return out;
}
function pp(sg,pl){ // personal: 4 rows, no gender
  const out=[];
  for(const [n,rows] of [['sg',sg],['pl',pl]]) rows.forEach((cell,ci)=>{
    if(!cell) return; const [a,alt]=cell.split('/');
    const r={c:NCASES[ci],n,f:a,acc:[a]}; if(alt){r.alt=alt;r.acc.push(alt);} out.push(r);
  });
  return out;
}

const NOUNS=[
 // Type 1 feminine
 {lemma:'ψυχή',def:'breath, life, soul',gen:'f',dict:'ψυχή, ψυχῆς, ἡ',grp:'t1',forms:()=>decline12('ψυχ','t1h',true,true)},
 {lemma:'ἡδονή',def:'pleasure, enjoyment',gen:'f',dict:'ἡδονή, ἡδονῆς, ἡ',grp:'t1',forms:()=>decline12('ἡδον','t1h',true,true)},
 {lemma:'σοφία',def:'wisdom, skill',gen:'f',dict:'σοφία, σοφίας, ἡ',grp:'t1',forms:()=>decline12('σοφ*ι','t1a',false,true)},
 {lemma:'φιλοσοφία',def:'philosophy, love of wisdom',gen:'f',dict:'φιλοσοφία, φιλοσοφίας, ἡ',grp:'t1',forms:()=>decline12('φιλοσοφ*ι','t1a',false,true)},
 {lemma:'ἀνδρεία',def:'courage, manliness',gen:'f',dict:'ἀνδρεία, ἀνδρείας, ἡ',grp:'t1',forms:()=>decline12('ἀνδρ*ει','t1a',false,true)},
 {lemma:'ἀλήθεια',def:'truth',gen:'f',dict:'ἀλήθεια, ἀληθείας, ἡ',grp:'t1',forms:()=>decline12('ἀλ*ηθει','t1s',false,true)},
 {lemma:'γῆ',def:'earth, land, country',gen:'irr',dict:'γῆ, γῆς, ἡ',grp:'t1',forms:()=>t3(['γῆ','γῆς','γῇ','γῆν','γῆ'])},
 // Type 1 masculine
 {lemma:'νεανίας',def:'young man, youth',gen:'m',dict:'νεανίας, νεανίου, ὁ',grp:'t1',forms:()=>decline12('νεᾱν*ι','t1mas',false,true)},
 {lemma:'πολίτης',def:'citizen',gen:'m',dict:'πολίτης, πολίτου, ὁ',grp:'t1',forms:()=>decline12('πολ*ῑτ','t1mes',false,true)},
 {lemma:'ποιητής',def:'creator, poet',gen:'m',dict:'ποιητής, ποιητοῦ, ὁ',grp:'t1',forms:()=>decline12('ποιητ','t1mes',true,true)},
 // Type 2 masculine / feminine
 {lemma:'ἄνθρωπος',def:'human being',gen:'mf',dict:'ἄνθρωπος, ἀνθρώπου, ὁ/ἡ',grp:'t2',forms:()=>decline12('*ἀνθρωπ','t2',false)},
 {lemma:'θάνατος',def:'death',gen:'m',dict:'θάνατος, θανάτου, ὁ',grp:'t2',forms:()=>decline12('θ*ανατ','t2',false)},
 {lemma:'θεός',def:'god, goddess',gen:'mf',dict:'θεός, θεοῦ, ὁ/ἡ',grp:'t2',forms:()=>decline12('θε','t2',true),vocNom:true},
 {lemma:'ἰατρός',def:'physician, healer',gen:'m',dict:'ἰατρός, ἰατροῦ, ὁ',grp:'t2',forms:()=>decline12('ἰᾱτρ','t2',true)},
 {lemma:'λόγος',def:'word, speech, discourse; thought, reason, account',gen:'m',dict:'λόγος, λόγου, ὁ',grp:'t2',forms:()=>decline12('λ*ογ','t2',false)},
 {lemma:'νόμος',def:'custom, tradition, law',gen:'m',dict:'νόμος, νόμου, ὁ',grp:'t2',forms:()=>decline12('ν*ομ','t2',false)},
 {lemma:'ὁδός',def:'road, way, path',gen:'f',dict:'ὁδός, ὁδοῦ, ἡ',grp:'t2',forms:()=>decline12('ὁδ','t2',true)},
 {lemma:'οἶκος',def:'house, home, family',gen:'m',dict:'οἶκος, οἴκου, ὁ',grp:'t2',forms:()=>decline12('*οἰκ','t2',false)},
 {lemma:'πλοῦτος',def:'wealth, riches',gen:'m',dict:'πλοῦτος, πλούτου, ὁ',grp:'t2',forms:()=>decline12('πλ*ουτ','t2',false)},
 {lemma:'φίλος',def:'friend',gen:'m',dict:'φίλος, φίλου, ὁ',grp:'t2',forms:()=>decline12('φ*ιλ','t2',false)},
 {lemma:'χρόνος',def:'time',gen:'m',dict:'χρόνος, χρόνου, ὁ',grp:'t2',forms:()=>decline12('χρ*ον','t2',false)},
 {lemma:'χρυσός',def:'gold',gen:'m',dict:'χρυσός, χρυσοῦ, ὁ',grp:'t2',forms:()=>decline12('χρῡσ','t2',true)},
 {lemma:'βίος',def:'life',gen:'m',dict:'βίος, βίου, ὁ',grp:'t2',forms:()=>decline12('β*ι','t2',false)},
 {lemma:'μῦθος',def:'word, speech; story, tale',gen:'m',dict:'μῦθος, μύθου, ὁ',grp:'t2',forms:()=>decline12('μ*ῡθ','t2',false)},
 {lemma:'φιλόσοφος',def:'philosopher',gen:'m',dict:'φιλόσοφος, φιλοσόφου, ὁ',grp:'t2',forms:()=>decline12('φιλ*οσοφ','t2',false)},
 {lemma:'νοῦς',def:'mind, sense, intelligence',gen:'irr',dict:'νοῦς, νοῦ, ὁ',grp:'t2',forms:()=>t3(['νοῦς','νοῦ','νῷ','νοῦν','νοῦ'])},
 // Type 2 neuter
 {lemma:'δῶρον',def:'gift, present',gen:'n',dict:'δῶρον, δώρου, τό',grp:'t2',forms:()=>decline12('δ*ωρ','t2n',false)},
 {lemma:'ἔργον',def:'work, achievement, exploit',gen:'n',dict:'ἔργον, ἔργου, τό',grp:'t2',forms:()=>decline12('*ἐργ','t2n',false)},
 {lemma:'τέκνον',def:'child',gen:'n',dict:'τέκνον, τέκνου, τό',grp:'t2',forms:()=>decline12('τ*εκν','t2n',false)},
 // Type 3
 {lemma:'ἄρχων',def:'ruler, commander; archon',gen:'m',dict:'ἄρχων, ἄρχοντος, ὁ',grp:'t3',forms:()=>t3(['ἄρχων','ἄρχοντος','ἄρχοντι','ἄρχοντα','ἄρχων','ἄρχοντες','ἀρχόντων','ἄρχουσι(ν)','ἄρχοντας','ἄρχοντες'])},
 {lemma:'γέρων',def:'old man',gen:'m',dict:'γέρων, γέροντος, ὁ',grp:'t3',forms:()=>t3(['γέρων','γέροντος','γέροντι','γέροντα','γέρον','γέροντες','γερόντων','γέρουσι(ν)','γέροντας','γέροντες'])},
 {lemma:'δαίμων',def:'spirit, god, demon',gen:'mf',dict:'δαίμων, δαίμονος, ὁ/ἡ',grp:'t3',forms:()=>t3(['δαίμων','δαίμονος','δαίμονι','δαίμονα','δαῖμον','δαίμονες','δαιμόνων','δαίμοσι(ν)','δαίμονας','δαίμονες'])},
 {lemma:'κλώψ',def:'thief',gen:'m',dict:'κλώψ, κλωπός, ὁ',grp:'t3',forms:()=>t3(['κλώψ','κλωπός','κλωπί','κλῶπα','κλώψ','κλῶπες','κλωπῶν','κλωψί(ν)','κλῶπας','κλῶπες'])},
 {lemma:'φύλαξ',def:'guard, guardian, sentinel',gen:'m',dict:'φύλαξ, φύλακος, ὁ',grp:'t3',forms:()=>t3(['φύλαξ','φύλακος','φύλακι','φύλακα','φύλαξ','φύλακες','φυλάκων','φύλαξι(ν)','φύλακας','φύλακες'])},
 {lemma:'παῖς',def:'son, daughter, child; slave',gen:'mf',dict:'παῖς, παιδός, ὁ/ἡ',grp:'t3',forms:()=>t3(['παῖς','παιδός','παιδί','παῖδα','παῖ','παῖδες','παίδων','παισί(ν)','παῖδας','παῖδες'])},
 {lemma:'πατρίς',def:'fatherland',gen:'f',dict:'πατρίς, πατρίδος, ἡ',grp:'t3',forms:()=>t3(['πατρίς','πατρίδος','πατρίδι','πατρίδα','πατρίς','πατρίδες','πατρίδων','πατρίσι(ν)','πατρίδας','πατρίδες'])},
 // Type 3 neuter
 {lemma:'πρᾶγμα',def:'thing; (pl.) circumstances, affairs, business',gen:'n',dict:'πρᾶγμα, πράγματος, τό',grp:'t3',forms:()=>t3(['πρᾶγμα','πράγματος','πράγματι','πρᾶγμα','πρᾶγμα','πράγματα','πραγμάτων','πράγμασι(ν)','πράγματα','πράγματα'])},
 {lemma:'σῶμα',def:'body',gen:'n',dict:'σῶμα, σώματος, τό',grp:'t3',forms:()=>t3(['σῶμα','σώματος','σώματι','σῶμα','σῶμα','σώματα','σωμάτων','σώμασι(ν)','σώματα','σώματα'])},
 {lemma:'χρῆμα',def:'thing, matter; (pl.) goods, property, money',gen:'n',dict:'χρῆμα, χρήματος, τό',grp:'t3',forms:()=>t3(['χρῆμα','χρήματος','χρήματι','χρῆμα','χρῆμα','χρήματα','χρημάτων','χρήμασι(ν)','χρήματα','χρήματα'])},
 // Type 3 irregular
 {lemma:'ἀνήρ',def:'man, husband',gen:'irr',dict:'ἀνήρ, ἀνδρός, ὁ',grp:'t3',forms:()=>t3(['ἀνήρ','ἀνδρός','ἀνδρί','ἄνδρα','ἄνερ','ἄνδρες','ἀνδρῶν','ἀνδράσι(ν)','ἄνδρας','ἄνδρες'])},
 {lemma:'γυνή',def:'woman, wife',gen:'irr',dict:'γυνή, γυναικός, ἡ',grp:'t3',forms:()=>t3(['γυνή','γυναικός','γυναικί','γυναῖκα','γύναι','γυναῖκες','γυναικῶν','γυναιξί(ν)','γυναῖκας','γυναῖκες'])},
 // Name
 {lemma:'Ζεύς',def:'Zeus',gen:'irr',dict:'Ζεύς, Διός, ὁ',grp:'t3',forms:()=>t3(['Ζεύς','Διός','Διί','Δία','Ζεῦ'])},
 {lemma:'Σωκράτης',def:'Socrates',gen:'m',dict:'Σωκράτης, Σωκράτους, ὁ',grp:'t3',forms:()=>t3(['Σωκράτης','Σωκράτους','Σωκράτει','Σωκράτη/Σωκράτην','Σώκρατες'])},
 {lemma:'Ἑλλάς',def:'Greece',gen:'f',dict:'Ἑλλάς, Ἑλλάδος, ἡ',grp:'t3',forms:()=>t3(['Ἑλλάς','Ἑλλάδος','Ἑλλάδι','Ἑλλάδα','Ἑλλάς'])},
 // Pronouns
 {lemma:'ὁ',def:'the',dict:'ὁ, ἡ, τό',grp:'art',gendered:true,noVoc:true,forms:()=>gp(
   ['ὁ|ἡ|τό','τοῦ|τῆς|τοῦ','τῷ|τῇ|τῷ','τόν|τήν|τό'],['οἱ|αἱ|τά','τῶν|τῶν|τῶν','τοῖς|ταῖς|τοῖς','τούς|τάς|τά'])},
 {lemma:'ἐγώ',head:'ἐγώ, ἡμεῖς',def:'I; (pl.) we',dict:'ἐγώ, ἡμεῖς',grp:'pers',noVoc:true,forms:()=>pp(['ἐγώ','ἐμοῦ/μου','ἐμοί/μοι','ἐμέ/με'],['ἡμεῖς','ἡμῶν','ἡμῖν','ἡμᾶς'])},
 {lemma:'σύ',head:'σύ, ὑμεῖς',def:'you (sg.); (pl.) you',dict:'σύ, ὑμεῖς',grp:'pers',noVoc:true,forms:()=>pp(['σύ','σοῦ/σου','σοί/σοι','σέ/σε'],['ὑμεῖς','ὑμῶν','ὑμῖν','ὑμᾶς'])},
 {lemma:'αὐτός',def:'self, same; (oblique cases) him, her, it, them',dict:'αὐτός, αὐτή, αὐτό',grp:'pers',gendered:true,noVoc:true,forms:()=>gp(
   ['αὐτός|αὐτή|αὐτό','αὐτοῦ|αὐτῆς|αὐτοῦ','αὐτῷ|αὐτῇ|αὐτῷ','αὐτόν|αὐτήν|αὐτό'],['αὐτοί|αὐταί|αὐτά','αὐτῶν|αὐτῶν|αὐτῶν','αὐτοῖς|αὐταῖς|αὐτοῖς','αὐτούς|αὐτάς|αὐτά'])},
 {lemma:'ἐμαυτοῦ',def:'myself',dict:'ἐμαυτοῦ, ἐμαυτῆς',grp:'refl',gendered:true,noVoc:true,forms:()=>gp(
   [null,'ἐμαυτοῦ|ἐμαυτῆς|-','ἐμαυτῷ|ἐμαυτῇ|-','ἐμαυτόν|ἐμαυτήν|-'],[null,'ἡμῶν αὐτῶν|ἡμῶν αὐτῶν|-','ἡμῖν αὐτοῖς|ἡμῖν αὐταῖς|-','ἡμᾶς αὐτούς|ἡμᾶς αὐτάς|-'])},
 {lemma:'σεαυτοῦ',def:'yourself',dict:'σεαυτοῦ, σεαυτῆς',grp:'refl',gendered:true,noVoc:true,forms:()=>gp(
   [null,'σεαυτοῦ/σαυτοῦ|σεαυτῆς/σαυτῆς|-','σεαυτῷ/σαυτῷ|σεαυτῇ/σαυτῇ|-','σεαυτόν/σαυτόν|σεαυτήν/σαυτήν|-'],[null,'ὑμῶν αὐτῶν|ὑμῶν αὐτῶν|-','ὑμῖν αὐτοῖς|ὑμῖν αὐταῖς|-','ὑμᾶς αὐτούς|ὑμᾶς αὐτάς|-'])},
 {lemma:'ἑαυτοῦ',def:'himself, herself, itself, themselves',dict:'ἑαυτοῦ, ἑαυτῆς, ἑαυτοῦ',grp:'refl',gendered:true,noVoc:true,forms:()=>gp(
   [null,'ἑαυτοῦ/αὑτοῦ|ἑαυτῆς/αὑτῆς|ἑαυτοῦ/αὑτοῦ','ἑαυτῷ/αὑτῷ|ἑαυτῇ/αὑτῇ|ἑαυτῷ/αὑτῷ','ἑαυτόν/αὑτόν|ἑαυτήν/αὑτήν|ἑαυτό/αὑτό'],
   [null,'ἑαυτῶν/αὑτῶν|ἑαυτῶν/αὑτῶν|ἑαυτῶν/αὑτῶν','ἑαυτοῖς/αὑτοῖς|ἑαυταῖς/αὑταῖς|ἑαυτοῖς/αὑτοῖς','ἑαυτούς/αὑτούς|ἑαυτάς/αὑτάς|ἑαυτά/αὑτά'])},
 {lemma:'οὗτος',def:'this',dict:'οὗτος, αὕτη, τοῦτο',grp:'dem',gendered:true,noVoc:true,forms:()=>gp(
   ['οὗτος|αὕτη|τοῦτο','τούτου|ταύτης|τούτου','τούτῳ|ταύτῃ|τούτῳ','τοῦτον|ταύτην|τοῦτο'],['οὗτοι|αὗται|ταῦτα','τούτων|τούτων|τούτων','τούτοις|ταύταις|τούτοις','τούτους|ταύτας|ταῦτα'])},
 {lemma:'ἐκεῖνος',def:'that',dict:'ἐκεῖνος, ἐκείνη, ἐκεῖνο',grp:'dem',gendered:true,noVoc:true,forms:()=>gp(
   ['ἐκεῖνος|ἐκείνη|ἐκεῖνο','ἐκείνου|ἐκείνης|ἐκείνου','ἐκείνῳ|ἐκείνῃ|ἐκείνῳ','ἐκεῖνον|ἐκείνην|ἐκεῖνο'],['ἐκεῖνοι|ἐκεῖναι|ἐκεῖνα','ἐκείνων|ἐκείνων|ἐκείνων','ἐκείνοις|ἐκείναις|ἐκείνοις','ἐκείνους|ἐκείνας|ἐκεῖνα'])},
 {lemma:'ὅδε',def:'this (here)',dict:'ὅδε, ἥδε, τόδε',grp:'dem',gendered:true,noVoc:true,forms:()=>gp(
   ['ὅδε|ἥδε|τόδε','τοῦδε|τῆσδε|τοῦδε','τῷδε|τῇδε|τῷδε','τόνδε|τήνδε|τόδε'],['οἵδε|αἵδε|τάδε','τῶνδε|τῶνδε|τῶνδε','τοῖσδε|ταῖσδε|τοῖσδε','τούσδε|τάσδε|τάδε'])},
 {lemma:'ὅς',def:'who, which, that',dict:'ὅς, ἥ, ὅ',grp:'rel',gendered:true,noVoc:true,forms:()=>gp(
   ['ὅς|ἥ|ὅ','οὗ|ἧς|οὗ','ᾧ|ᾗ|ᾧ','ὅν|ἥν|ὅ'],['οἵ|αἵ|ἅ','ὧν|ὧν|ὧν','οἷς|αἷς|οἷς','οὕς|ἅς|ἅ'])},
 {lemma:'τίς',def:'who? what? which?',dict:'τίς, τί',grp:'rel',gendered:true,noVoc:true,mfSame:true,forms:()=>gp(
   ['τίς|τίς|τί','τίνος/τοῦ|τίνος/τοῦ|τίνος/τοῦ','τίνι/τῷ|τίνι/τῷ|τίνι/τῷ','τίνα|τίνα|τί'],['τίνες|τίνες|τίνα','τίνων|τίνων|τίνων','τίσι(ν)|τίσι(ν)|τίσι(ν)','τίνας|τίνας|τίνα'])},
 {lemma:'τις',def:'someone, something; a certain, any',dict:'τις, τι',grp:'rel',gendered:true,noVoc:true,mfSame:true,forms:()=>gp(
   ['τις|τις|τι','τινός/του|τινός/του|τινός/του','τινί/τῳ|τινί/τῳ|τινί/τῳ','τινά|τινά|τι'],['τινές|τινές|τινά','τινῶν|τινῶν|τινῶν','τισί(ν)|τισί(ν)|τισί(ν)','τινάς|τινάς|τινά'])},
 {lemma:'ὅστις',def:'whoever, whatever; anyone who',dict:'ὅστις, ἥτις, ὅ τι',grp:'rel',gendered:true,noVoc:true,forms:()=>gp(
   ['ὅστις|ἥτις|ὅ τι','οὗτινος/ὅτου|ἧστινος|οὗτινος/ὅτου','ᾧτινι/ὅτῳ|ᾗτινι|ᾧτινι/ὅτῳ','ὅντινα|ἥντινα|ὅ τι'],['οἵτινες|αἵτινες|ἅτινα','ὧντινων/ὅτων|ὧντινων|ὧντινων/ὅτων','οἷστισι(ν)/ὅτοις|αἷστισι(ν)|οἷστισι(ν)/ὅτοις','οὕστινας|ἅστινας|ἅτινα'])},
];
// θεός: vocative = nominative
const NDATA=[];
NOUNS.forEach((w,ni)=>{
  for(const r of w.forms()){
    if(w.vocNom&&r.c==='voc'){ const nom=w.forms().find(x=>x.c==='nom'&&x.n===r.n); r.f=nom.f; r.acc=[nom.f]; }
    // movable nu in alternate
    if(r.alt&&r.alt.endsWith('(ν)')){ const b=r.alt.slice(0,-3); r.acc=r.acc.filter(x=>x!==r.alt).concat([b,b+'ν']); }
    r.ni=ni; NDATA.push(r);
  }
});
if(typeof module!=='undefined') module.exports={NOUNS,NDATA};
