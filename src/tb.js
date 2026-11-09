(function(){
// Columns: n = nouns, a = adjectives, p = pronouns/article, v = finite verbs, x = participles/infinitives
const BOOKS = {
mollin:{
  name:"Mollin & Williamson", unit:"Lesson",
  full:"Mollin & Williamson, An Introduction to Ancient Greek",
  rows:[
   ["1",{syntax:true,label:"Alphabet, sound, syllables, accent, punctuation"}],
   ["2",{n:["Type 2 (omicron-stem) nouns"]}],
   ["3",{n:["Type 1 (alpha/eta-stem) nouns"],a:["2-1-2 adjectives"],p:["Definite article"]}],
   ["4",{syntax:true,label:"Predication, the Greek verb, synopsis (concepts)"}],
   ["5",{v:["Progressive indicative, active and mid./pass. (present and past)","Progressive subjunctive","Progressive optative","Progressive imperative"]}],
   ["6",{v:["Future indicative","Root aorists"]}],
   ["7",{n:["Type 3 consonant-stem nouns"]}],
   ["8",{x:["Infinitive: all tenses and voices","Participle: all tenses and voices"]}],
   ["9",{a:["3-1-3 adjectives"],v:["Contracted verbs"]}],
   ["10",{p:["Personal pronouns","αὐτός","Reflexive","Demonstrative","Relative","Interrogative and indefinite","Indefinite relative"]}],
   ["11",{a:["Comparative and superlative adjectives"]}],
   ["12",{v:["Sigmatic (first) aorist","More future forms"]}],
   ["13",{n:["Type 3: πόλις, βασιλεύς"]}],
   ["14",{n:["Type 3 nouns in -ες/-ος"],a:["3-1-3: ἡδύς"]}],
   ["15",{v:["Aorist passive","Future passive"]}],
   ["16",{a:["3-3 adjectives in -εσ-"],v:["φημί","δύναμαι"]}],
   ["17",{v:["Non-thematic verbs: progressive system","εἰμί","δεῖ, χρή"]}],
   ["18",{v:["Non-thematic aorists","Irregular second aorists"]}],
   ["19",{a:["Possessive adjectives","Contracted 2-1-2 adjectives, ε- and ο-stems (ἁπλοῦς)","ε-stems with root in ρ: fem. sg. in -ᾱ (ἀργυρέ-)"],v:["Future optative"]}],
   ["20",{v:["Perfect active, middle, passive","Irregular second perfects (ἕστηκα, οἶδα)"],x:["Verbal adjectives in -τός/-τέος"]}]
  ],
  tok:{
   "2":{n:"g:t2"},
   "3":{n:"g:t1",a:"g:a212 a212a a22",p:"g:art"},
   "5":{v:"c:pres:act pres:mid pres:pass impf:act impf:mid impf:pass|m:ind subj opt imp|g:them dep"},
   "6":{v:"c:fut:act fut:mid aor:act aor:mid|m:ind subj opt imp|g:them dep root"},
   "7":{n:"g:t3"},
   "8":{x:"m:inf ptc|g:them dep root eimi"},
   "10":{p:"g:pers refl dem rel"},
   "17":{v:"g:eimi"}
  }
},
athenaze:{
  name:"Athenaze", unit:"Chapter",
  full:"Balme, Lawall & Morwood, Athenaze: An Introduction to Ancient Greek",
  rows:[
   ["1",{v:["Present indicative: stems and endings (3rd sg.)"]}],
   ["2",{n:["Singular, all cases"],a:["2-1-2, singular"],p:["Article, singular"],v:["Present indic. 1st, 2nd, 3rd sg.","Imperative (sg.)"]}],
   ["3",{n:["Plural, all cases"],a:["2-1-2, plural"],p:["Article, plural"],v:["Present 3rd pl.","Imperative (pl.)"],x:["Present infinitive"]}],
   ["4",{n:["1st decl. feminine","1st decl. masculine","2nd decl. feminine (ἡ ὁδός)"],a:["1st/2nd decl. adjectives","μέγας, πολύς"],v:["Present indicative active, all persons"]}],
   ["5",{a:["Possessive adjectives"],p:["Personal pronouns","αὐτός, -ή, -ό"],v:["Contract verbs in -άω"]}],
   ["6",{v:["Middle voice: present","Deponents","πλέω"]}],
   ["7",{n:["3rd decl. consonant stems: velar, dental","Nasal stems","Labial and liquid stems"],a:["3rd decl.: σώφρων, σῶφρον"],p:["Reflexive pronouns","Interrogative τίς, τί","Indefinite τις, τι"]}],
   ["8",{n:["3rd decl. ρ-stems (πατήρ, μήτηρ, ἀνήρ)","γυνή, χείρ"],a:["πᾶς, πᾶσα, πᾶν","Numbers"],x:["Present middle participle"]}],
   ["9",{n:["3rd decl. -ντ- stems","πόλις, ἄστυ","βασιλεύς, ναῦς, βοῦς"],x:["Present active participle"]}],
   ["10",{v:["Future: sigmatic","Contract future (-ίζω; liquid and nasal stems)","Future of contract verbs","Deponent futures","εἶμι"],x:["Future participle"]}],
   ["11",{v:["Aorist: thematic 2nd aorist","2nd aorist imperatives","2nd aorists from unrelated stems"],x:["2nd aorist active and middle participles"]}],
   ["12",{v:["1st (sigmatic) aorist","Asigmatic aorist: liquid and nasal stems","Irregular 1st aorists"],x:["1st aorist active and middle participles"]}],
   ["13",{n:["3rd decl. -εσ- stems"],a:["3rd decl. -εσ- adjectives","1st/3rd decl. -υ/-ε stems (ταχύς)"],p:["Relative pronoun"],v:["Imperfect"]}],
   ["14",{a:["Comparison, regular","Comparison, irregular"],p:["Demonstratives (οὗτος, ὅδε, ἐκεῖνος)","Interrogative and indefinite pronouns and adjectives"]}],
   ["15",{n:["More -εσ- stems","2nd decl. contract nouns (νοῦς)"],a:["More numbers"],v:["Athematic 2nd aorists (ἔβην, ἔγνων)","Contract verbs in -όω"]}],
   ["16",{v:["Passive voice (present, imperfect)","Athematic deponents: δύναμαι, κεῖμαι, ἐπίσταμαι"]}],
   ["17",{v:["Aorist passive (-θη-, -η-)","Future passive (-θη-, -η-)","Aorist of deponents"]}],
   ["18",{v:["δίδωμι","τίθημι"]}],
   ["19",{v:["ἵστημι: formation and forms","καθίστημι, ἀφίσταμαι"]}],
   ["20",{v:["δείκνυμι","ἵημι"]}],
   ["21",{v:["Subjunctive: forms","Subjunctive of -μι verbs"]}],
   ["22",{syntax:true}],
   ["23",{v:["φημί"]}],
   ["24",{a:["More irregular comparatives and superlatives","Declension of comparatives in -ων"]}],
   ["25",{v:["Optative: forms","Optative of -μι verbs"]}],
   ["26",{x:["Verbal adjective in -τέος"]}],
   ["27",{v:["Perfect middle/passive: indic., subj., opt., impv.","Pluperfect middle/passive","Perfect middle/passive of consonant stems"],x:["Perfect middle/passive participle and infinitive"]}],
   ["28",{v:["Perfect active (-κα 1st, -α 2nd)","Pluperfect active","οἶδα"],x:["Perfect active participle and infinitive"]}],
   ["29",{syntax:true}],
   ["30",{syntax:true}]
  ],
  tok:{
   "1":{v:"c:pres:act|m:ind|g:them"},
   "2":{n:"g:t1 t2|num:sg",a:"g:a212 a212a|num:sg",p:"g:art|num:sg",v:"c:pres:act|m:ind imp"},
   "3":{n:"g:t1 t2|num:pl",a:"g:a212 a212a|num:pl",p:"g:art|num:pl",v:"c:pres:act|m:ind imp",x:"c:pres:act|m:inf"},
   "4":{n:"g:t1 t2",a:"g:a212 a212a a22",v:"c:pres:act|m:ind"},
   "5":{p:"g:pers"},
   "6":{v:"c:pres:mid|g:them dep"},
   "7":{n:"g:t3",p:"g:refl rel"},
   "8":{n:"g:t3",x:"c:pres:mid|m:ptc"},
   "9":{n:"g:t3",x:"c:pres:act|m:ptc"},
   "10":{v:"c:fut:act fut:mid|m:ind|g:them dep",x:"c:fut:act fut:mid|m:ptc"},
   "11":{v:"c:aor:act aor:mid|m:ind imp|g:root",x:"c:aor:act aor:mid|m:ptc|g:root"},
   "13":{n:"g:t3",p:"g:rel",v:"c:impf:act impf:mid|m:ind"},
   "14":{p:"g:dem rel"},
   "15":{n:"g:t2"},
   "16":{v:"c:pres:pass impf:pass|m:ind"},
   "21":{v:"m:subj"},
   "25":{v:"m:opt"}
  }
},
hq:{
  name:"Hansen & Quinn", unit:"Unit",
  full:"Hansen & Quinn, Greek: An Intensive Course",
  rows:[
   ["Intro",{syntax:true,label:"Alphabet, accent"}],
   ["1",{n:["1st decl. (nom. in -η or -α)","2nd decl."],p:["Article"]}],
   ["2",{v:["Present indic. active","Imperfect indic. active","Future indic. active","Aorist indic. active"],x:["Infinitives (pres., fut., aor. active)"]}],
   ["3",{v:["Perfect indic. active","Pluperfect indic. active","Present and aorist subjunctive active","Present and aorist optative active"],x:["Perfect infinitive active"]}],
   ["4",{n:["1st decl. concluded (masc. -ης/-ας; short α)"],a:["1st/2nd decl. adjectives"]}],
   ["5",{v:["Passive voice (tenses learned so far)"]}],
   ["6",{n:["3rd decl. consonant stems"],p:["Relative pronoun"]}],
   ["7",{p:["ἐκεῖνος"],v:["Middle voice","2nd aorist active and middle"]}],
   ["8",{a:["πᾶς, πᾶσα, πᾶν"],x:["Participles: all active, middle, passive forms"]}],
   ["9",{p:["ὅδε","οὗτος"],v:["Contract verbs in -άω","Contract verbs in -έω"]}],
   ["10",{n:["More 3rd decl."],a:["3rd decl. adjectives"],v:["Contract verbs in -όω","Contracted futures"]}],
   ["11",{p:["αὐτός"],v:["Imperative mood","Deponents: middle, passive, partial"]}],
   ["12",{v:["-μι verbs: present system"]}],
   ["13",{v:["-μι verbs continued"]}],
   ["14",{v:["δείκνυμι"],x:["Participles of δίδωμι, τίθημι, ἵστημι (pres., 2nd aor.)","Perfect participle of ἵστημι"]}],
   ["15",{p:["Interrogative τίς","Indefinite τις","Personal pronouns","Reflexive pronouns"],v:["εἰμί (full)"]}],
   ["16",{n:["ναῦς"],a:["πολύς"],v:["φημί","γιγνώσκω","Future optative"],x:["Future infinitive"]}],
   ["17",{a:["μέγας","ἡδύς type","Comparison of adjectives","Numerals"],p:["Negative pronouns/adjectives (οὐδείς)"],v:["εἶμι"]}],
   ["18",{p:["Indefinite relative (ὅστις)","Indirect interrogatives"],v:["ἵημι"]}],
   ["19",{a:["Irregular comparison of adjectives"],v:["οἶδα"]}],
   ["20",{n:["2nd decl. contract (νοῦς)","ἄστυ"],v:["κεῖμαι"],x:["Verbal adjectives in -τέος"]}]
  ],
  tok:{
   "1":{n:"g:t1 t2",p:"g:art"},
   "2":{v:"c:pres:act impf:act fut:act aor:act|m:ind|g:them",x:"c:pres:act fut:act aor:act|m:inf"},
   "3":{v:"c:pres:act aor:act|m:subj opt"},
   "4":{n:"g:t1",a:"g:a212 a212a a22"},
   "5":{v:"c:pres:pass impf:pass"},
   "6":{n:"g:t3",p:"g:rel"},
   "7":{p:"g:dem",v:"c:pres:mid impf:mid fut:mid aor:mid|g:them root"},
   "8":{x:"m:ptc"},
   "9":{p:"g:dem"},
   "10":{n:"g:t3"},
   "11":{p:"g:pers",v:"m:imp|g:them root dep"},
   "15":{p:"g:rel pers refl",v:"g:eimi"},
   "16":{x:"c:fut:act fut:mid|m:inf"},
   "18":{p:"g:rel"},
   "20":{n:"g:t2"}
  }
},
mastronarde:{
  name:"Mastronarde", unit:"Unit",
  full:"Mastronarde, Introduction to Attic Greek",
  rows:[
   ["1–2",{syntax:true,label:"Alphabet, accentuation"}],
   ["3",{n:["O-declension (2nd decl.)"]}],
   ["4",{n:["A-declension I (1st decl.)"],p:["Article"]}],
   ["5",{v:["Present active indicative, ω-verbs"]}],
   ["6",{n:["A-declension II (1st decl.)"]}],
   ["7",{a:["Vowel-declension (2-1-2) adjectives"]}],
   ["8",{p:["Relative pronoun"],v:["2nd person imperative"]}],
   ["9",{a:["Two-ending adjectives"],x:["Present infinitive"]}],
   ["10",{v:["Present of εἰμί"]}],
   ["11",{v:["Present middle/passive indicative"]}],
   ["12",{p:["αὐτός"]}],
   ["13",{p:["Demonstratives"],v:["Contract verbs in -έω"]}],
   ["14",{n:["Consonant declension I"]}],
   ["15",{n:["Consonant declension II"],p:["Interrogative τίς"]}],
   ["16",{v:["Imperfect indicative"]}],
   ["17",{p:["Indefinite τις"]}],
   ["18",{v:["Future active and middle indicative"]}],
   ["19",{v:["Aorist active and middle indicative and imperative"]}],
   ["20",{syntax:true,label:"Tense and aspect; indirect discourse"}],
   ["21",{n:["Consonant declension III"],p:["Personal pronouns"]}],
   ["22",{a:["Consonant-declension adjectives"]}],
   ["23",{v:["Present system of -μι verbs"]}],
   ["24",{v:["Athematic aorists"]}],
   ["25",{a:["Adjectives with variant stems (πολύς, μέγας)","Numerals"],p:["Reflexive and reciprocal pronouns"]}],
   ["26",{x:["Participles: all tenses and voices, formation and declension"]}],
   ["27",{syntax:true,label:"Uses of the participle I"}],
   ["28",{v:["οἶδα"]}],
   ["29",{v:["Aorist passive","Future passive"]}],
   ["30",{v:["Contract verbs in -άω and -όω"]}],
   ["31",{a:["Comparison of adjectives"]}],
   ["32",{v:["Subjunctive"]}],
   ["33",{v:["Optative: formation"]}],
   ["34",{syntax:true,label:"Uses of the optative; indirect questions"}],
   ["35",{syntax:true,label:"Conditions"}],
   ["36",{p:["Correlatives"]}],
   ["37",{v:["Perfect system active"]}],
   ["38",{n:["A-contract nouns"],v:["Perfect system middle/passive"]}],
   ["39",{v:["3rd person imperatives","Athematic perfects"]}],
   ["40",{n:["O-contract nouns"],x:["Verbal adjectives in -τός and -τέος"]}],
   ["41",{syntax:true,label:"Temporal clauses; πρίν; attraction"}],
   ["42",{n:["Attic declension"],a:["Contract vowel-declension adjectives"]}]
  ],
  tok:{
   "3":{n:"g:t2"},
   "4":{n:"g:t1",p:"g:art"},
   "5":{v:"c:pres:act|m:ind|g:them"},
   "6":{n:"g:t1"},
   "7":{a:"g:a212 a212a"},
   "8":{p:"g:rel",v:"m:imp"},
   "9":{a:"g:a22",x:"c:pres:act|m:inf"},
   "10":{v:"g:eimi"},
   "11":{v:"c:pres:mid pres:pass|g:them dep"},
   "12":{p:"g:pers"},
   "13":{p:"g:dem"},
   "14":{n:"g:t3"},
   "15":{n:"g:t3",p:"g:rel"},
   "16":{v:"c:impf:act impf:mid impf:pass"},
   "17":{p:"g:rel"},
   "18":{v:"c:fut:act fut:mid"},
   "19":{v:"c:aor:act aor:mid|m:ind imp|g:root"},
   "21":{n:"g:t3",p:"g:pers"},
   "25":{p:"g:refl"},
   "26":{x:"m:ptc"},
   "32":{v:"m:subj"},
   "33":{v:"m:opt"}
  }
},
jact:{
  name:"Reading Greek (JACT)", unit:"Section",
  full:"JACT, Reading Greek",
  rows:[
   ["1",{n:["1G: 2nd decl. (ἄνθρωπος 2a, ἔργον 2b)"],a:["1A–B: καλός, -ή, -όν","1G: ἡμέτερος (ε/ι/ρ → -ᾱ)"],p:["1A–B: article"],v:["1C–D: present indic. active; imperative","1E–F: contract verbs -άω, -έω, -όω (present, impv.)","1H–J: εἰμί, οἶδα"]}],
   ["2",{n:["1st decl.: βοή 1a, ἀπορία 1b, θάλαττα/τόλμα 1c, ναύτης/νεανίας 1d"],v:["Middle voice, present (incl. contracts), indic. and impv."]}],
   ["3",{n:["3rd decl. 3a (λιμήν, νύξ, λαμπάς, ἀνήρ)","ναῦς, Ζεύς"],a:["πολύς, μέγας"],p:["Personal pronouns ἐγώ, σύ, ἡμεῖς, ὑμεῖς","οὗτος, ἐκεῖνος"]}],
   ["4",{n:["3b πρᾶγμα, 3c πλῆθος, 3e πόλις/πρέσβυς, 3f ἄστυ, 3g βασιλεύς"],a:["3rd decl.: εὔφρων"],p:["τις, τίς, οὐδείς"],x:["Present participle active and middle (incl. contracts); ὤν"]}],
   ["5",{n:["3d τριήρης, Σωκράτης, Περικλῆς","πατήρ, μήτηρ, θυγάτηρ"],v:["Imperfect active and middle (incl. contracts, ἦ/ἦν)","Future active and middle (incl. contracts, ἔσομαι, εἶμι)"]}],
   ["6",{n:["3h ὀφρῦς"],v:["1st aorist active and middle","2nd aorist active and middle"]}],
   ["7",{a:["Comparatives and superlatives"],p:["αὐτός, ὁ αὐτός","Reflexives ἐμαυτόν, σεαυτόν, ἑαυτόν"],v:["Past of εἶμι, οἶδα","φημί","δύναμαι"],x:["Present infinitive active and middle (εἶναι, ἰέναι, εἰδέναι)","1st and 2nd aorist participles"]}],
   ["8",{a:["More comparatives (εὐφρονέστερος; βελτίων, χείρων)"],v:["Present optative active and middle","ἀνίσταμαι"]}],
   ["9",{a:["πᾶς, πᾶσα, πᾶν"],v:["Aorist imperatives","Root aorists ἔβην, ἔγνων","3rd person imperatives","Optatives δυναίμην, ἀνισταίμην","ἐπίσταμαι"],x:["Aorist infinitives","Future infinitive"]}],
   ["10",{a:["ἀμελής, γλυκύς"],v:["Aorist optative active and middle","δίδωμι, γιγνώσκω"]}],
   ["11",{a:["Two-termination adjectives"],v:["Present and imperfect passive","Optative of φημί"]}],
   ["12",{v:["12A–D: aorist passive","12A–D: ἵστημι, καθίστημι"],flag:"12E onward not confirmed"}],
   ["13",{v:["13E: perfect indicative active","13F: aorist optative passive; future optative","13G–I: perfect indic. middle/passive; irregular perfects"],x:["13A–B: aorist infinitive passive","13A–B: future participles active, middle, passive","13G–I: perfect infinitive and participle"]}],
   ["14",{v:["Subjunctive: present, aorist, perfect"]}],
   ["15",{v:["Future perfect"]}],
   ["16",{v:["16F: ἁλίσκομαι"],flag:"16A–C not confirmed; 16D, E, H are syntax"}],
   ["17",{a:["17C: numerals"],v:["17E: χράομαι"],p:["17E: correlatives"],flag:"17A, 17D not confirmed; 17B is syntax"}],
   ["18",{syntax:true,label:"Ionic dialect (Herodotus)"}],
   ["19",{syntax:true,label:"Ionic dialect (Herodotus)"}],
   ["20",{syntax:true,label:"Homeric dialect"}]
  ],
  tok:{
   "1":{n:"g:t2",a:"g:a212 a212a",p:"g:art",v:"c:pres:act|m:ind imp|g:them eimi"},
   "2":{n:"g:t1",v:"c:pres:mid|m:ind imp|g:them dep"},
   "3":{n:"g:t3",p:"g:pers dem"},
   "4":{n:"g:t3",p:"g:rel",x:"c:pres:act pres:mid|m:ptc|g:them dep eimi"},
   "5":{n:"g:t3",v:"c:impf:act impf:mid fut:act fut:mid|m:ind"},
   "6":{v:"c:aor:act aor:mid|m:ind|g:root"},
   "7":{p:"g:pers refl",x:"c:pres:act pres:mid aor:act aor:mid|m:inf ptc"},
   "8":{v:"c:pres:act pres:mid|m:opt"},
   "9":{v:"c:aor:act aor:mid|m:imp",x:"c:aor:act aor:mid fut:act fut:mid|m:inf"},
   "10":{v:"c:aor:act aor:mid|m:opt"},
   "11":{a:"g:a22",v:"c:pres:pass impf:pass"},
   "14":{v:"m:subj"}
  }
}};
const ORDER=["mollin","athenaze","hq","mastronarde","jact"];
const COLS=[{k:"n",label:"Nouns",drill:"noun"},{k:"a",label:"Adjectives",drill:"adj"},{k:"p",label:"Pronouns and article",drill:"noun"},{k:"v",label:"Verbs",drill:"verb"},{k:"x",label:"Participles and infinitives",drill:"verb"}];
const DRILL_OF={n:"noun",p:"noun",a:"adj",v:"verb",x:"verb"};
const DRILL_NAME={noun:"Greek Nouns",adj:"Greek Adjectives",verb:"Greek Verbs"};
const DIMS={noun:{g:"groups",num:"nums"},adj:{g:"groups",num:"nums"},verb:{c:"cells",m:"moods",g:"groups"}};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function parseTok(str,drill){ // "g:t1 t2|num:sg" -> {groups:[..],nums:[..]}
  const out={}; if(!str) return out;
  for(const part of str.split('|')){ const i=part.indexOf(':'); const key=DIMS[drill][part.slice(0,i)]; if(key) out[key]=part.slice(i+1).trim().split(/\s+/); }
  return out;
}
function merge(a,b){ for(const k of Object.keys(b)){ a[k]=[...new Set([...(a[k]||[]),...b[k]])]; } return a; }
function cumulative(book,rowIdx,drill){
  const B=BOOKS[book], acc={};
  for(let i=0;i<=rowIdx;i++){ const ch=B.rows[i][0], t=B.tok[ch]; if(!t) continue;
    for(const col of Object.keys(t)) if(DRILL_OF[col]===drill) merge(acc,parseTok(t[col],drill)); }
  return acc;
}
function presetFor(book,rowIdx,col,only){
  const drill=DRILL_OF[col]; const cum=cumulative(book,rowIdx,drill);
  if(!only) return {drill,preset:cum};
  const ch=BOOKS[book].rows[rowIdx][0]; const own=parseTok((BOOKS[book].tok[ch]||{})[col],drill);
  return {drill,preset:Object.assign({},cum,own)}; // dimensions the cell doesn't name: everything taught so far
}

const T={book:'mollin',mode:'through'};
try{ const o=JSON.parse(localStorage.getItem('gd-textbook')||'null'); if(o&&BOOKS[o.book]) T.book=o.book; if(o&&o.mode) T.mode=o.mode; }catch(e){}
function save(){ try{ localStorage.setItem('gd-textbook',JSON.stringify(T)); }catch(e){} }

function render(){
  const B=BOOKS[T.book];
  $('#t-books').innerHTML=ORDER.map(k=>`<button class="opt" data-book="${k}" aria-pressed="${k===T.book}">${BOOKS[k].name}</button>`).join('');
  $('#t-mode').innerHTML=[['through','Everything through that '+B.unit.toLowerCase()],['only','That '+B.unit.toLowerCase()+' only']].map(([k,l])=>`<button class="opt" data-mode="${k}" aria-pressed="${k===T.mode}">${l}</button>`).join('');
  $('#t-title').textContent=B.full;
  let h=`<div class="trow thead"><div class="tch">${B.unit}</div>${COLS.map(c=>`<div class="tcell">${c.label}</div>`).join('')}</div>`;
  B.rows.forEach(([ch,r],ri)=>{
    const sub=r.label?`<small>${esc(r.label)}</small>`:'';
    const flag=r.flag?`<small class="tflag">${esc(r.flag)}</small>`:'';
    if(r.syntax){ h+=`<div class="trow syntax"><div class="tch"><span class="tunit">${B.unit} </span>${ch}</div><div class="tcell span">${r.label?`<b>${esc(r.label)}</b> · `:''}No new paradigms</div></div>`; return; }
    const tok=B.tok[ch]||{};
    h+=`<div class="trow"><div class="tch"><span class="tunit">${B.unit} </span>${ch}${sub}${flag}</div>`+COLS.map(c=>{
      const items=r[c.k];
      if(!items||!items.length) return `<button class="tcell empty" data-row="${ri}" data-col="${c.k}" aria-label="${c.label} through ${B.unit} ${ch}"><span class="none">—</span></button>`;
      const nodata=!tok[c.k];
      return `<button class="tcell${nodata?' nodata':''}" data-row="${ri}" data-col="${c.k}" title="${nodata?'Not in the drills yet':''}"><span class="tlab">${c.label}</span><ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></button>`;
    }).join('')+'</div>';
  });
  $('#t-grid').innerHTML=h;
}
function go(btn,only){
  const ri=+btn.dataset.row, col=btn.dataset.col, B=BOOKS[T.book], ch=B.rows[ri][0];
  if(only&&!(B.tok[ch]||{})[col]){ toast(`${B.unit} ${ch} has nothing new in the drills for this column yet.`); return; }
  const {drill,preset}=presetFor(T.book,ri,col,only);
  window.GVD_openPreset(drill,preset);
  toast(`${DRILL_NAME[drill]} set to ${only?'only':'everything through'} ${B.name} ${B.unit.toLowerCase()} ${ch}.`);
}
let toastT=null;
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{ el.hidden=true; },3200); }
$('#t-books').addEventListener('click',e=>{ const b=e.target.closest('[data-book]'); if(!b) return; T.book=b.dataset.book; save(); render(); });
$('#t-mode').addEventListener('click',e=>{ const b=e.target.closest('[data-mode]'); if(!b) return; T.mode=b.dataset.mode; save(); render(); });
$('#t-grid').addEventListener('click',e=>{ const b=e.target.closest('button.tcell'); if(!b) return; go(b,T.mode==='only'); });
$('#t-grid').addEventListener('contextmenu',e=>{ const b=e.target.closest('button.tcell'); if(!b) return; e.preventDefault(); go(b,T.mode!=='only'); });

window.GVD_BOOK={prefix:'t',views:{page:render},leave(){},score(){return '';},key(){},_presetFor:presetFor};
})();
