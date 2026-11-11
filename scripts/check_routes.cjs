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
