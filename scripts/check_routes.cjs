const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('dist/assets/app.js','utf8').replace(/navigate\(\);\s*$/,'');
const el={querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},classList:{toggle(){},add(){},remove(){}},style:{setProperty(){}},getAttribute:()=>null};
const context={console,URLSearchParams,innerWidth:1440,screen:{width:1920},location:{hash:''},sessionStorage:{getItem:()=> 'Motocicletas',setItem(){}},localStorage:{getItem:()=>null,setItem(){}},document:{body:el,querySelectorAll:()=>[],getElementById:()=>el,querySelector:()=>el,addEventListener(){}},window:{addEventListener(){},scrollTo(){}},MutationObserver:class{observe(){}},setTimeout(){},clearTimeout(){},requestAnimationFrame(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/assets/i18n.js','utf8'),context);
vm.runInContext(source,context);
vm.runInContext('render=()=>{}',context);
const run=code=>vm.runInContext(code,context);
const open=hash=>{context.location.hash=hash;run('navigate()');};
let checked=0;
for(const [category,slug] of Object.entries(run('courseSlugs'))){
 const hash=run(`courseRoute(${JSON.stringify(category)})`);assert(hash.endsWith(`?course=${slug}`));open(hash);assert.equal(run('selectedCourse()'),category);assert(run('redesignedCourseContent()').includes(category));checked++;
}
// A legacy course link is deterministic even when another course was stored.
open('#public/Detalle%20de%20curso');assert.equal(run('selectedCourse()'),'Automóviles');
for(const [page,type,mode] of [['Ficha del estudiante','Students','admin'],['Ficha del instructor','Instructors','admin'],['Detalle y grupos','Courses','admin'],['Ficha del vehículo','Vehicles','admin'],['Ficha y progreso','Students','instructor']]){
 const rows=run(`managementData.${type}.rows`);const hashes=new Set();
 rows.forEach((row,i)=>{const id=run(`recordId('${type}',${i})`);const hash=run(`route(${JSON.stringify(page)},'${mode}','${id}')`);hashes.add(hash);open(hash);assert.equal(run(`selectedRecord('${type}').row[0]`),row[0]);const html=run('privatePage()');assert(html.includes(row[0]),`${hash} lost the selected identity`);assert(html.includes(id),`${hash} lost its ID`);checked++;});
 assert.equal(hashes.size,rows.length);
 open(run(`route(${JSON.stringify(page)},'${mode}','MISSING')`));assert.equal(run('page'),'404');
}
for(const type of ['Students','Instructors','Courses','Vehicles']){
 open(`#admin/${type}`);const html=run('managementPage()');run(`managementData.${type}.rows`).forEach((_,i)=>assert(html.includes(`?id=${run(`recordId('${type}',${i})`)}`)));
}
open('#public/Cursos');const cards=run('courseCards()');for(const slug of Object.values(run('courseSlugs')))assert(cards.includes(`?course=${slug}`));
open('#public/Detalle%20de%20curso?course=missing');assert.equal(run('page'),'404');
open('#public/%E0%A4');assert.equal(run('page'),'404');
console.log(`PASS: ${checked} independent course/profile URLs, list links, deterministic legacy links and invalid-ID handling`);

// Public navigation fixes, direct FAQ entry and localized document titles.
open('#public/About');assert(run('publicPage()').includes('href="#public/Cursos"><button>Conoce nuestros cursos'));
assert(run('siteFooter()').includes('href="#public/Contact?section=faq"'));
let scrolled=false,focused=false;
context.requestAnimationFrame=callback=>callback();
context.document.getElementById=id=>id==='faq'?{scrollIntoView(){scrolled=true},focus(){focused=true}}:el;
open('#public/Contact?section=faq');assert(scrolled&&focused,'direct FAQ route must scroll and focus');
const contactHtml=run('publicPage()+siteFooter()');
for(const id of ['contact-social-status','footer-social-status'])assert.equal((contactHtml.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
context.document.documentElement={};context.emptyText={nodeType:3,nodeValue:'',parentElement:{closest:()=>false}};
const title=()=>run('localizeSite(emptyText);document.title');
for(const [hash,en,es] of [['#public/Home','Home | Nexo Drive','Inicio | Nexo Drive'],['#public/About','About | Nexo Drive','Nosotros | Nexo Drive'],['#public/Contact','Contact | Nexo Drive','Contacto | Nexo Drive'],['#public/Cursos','Courses | Nexo Drive','Cursos | Nexo Drive'],['#public/Detalle%20de%20curso?course=motorcycles','Motorcycles · Course details | Nexo Drive','Motocicletas · Detalle de curso | Nexo Drive']]){
 open(hash);run("siteLanguage='en'");assert.equal(title(),en);run("siteLanguage='es'");assert.equal(title(),es);
}
console.log('PASS: About course destination, FAQ deep link/focus, unique social status IDs and bilingual page/course titles');
