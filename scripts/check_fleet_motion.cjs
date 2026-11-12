const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('dist/assets/app.js','utf8');
const start=app.indexOf('function initFleetMotion(){'),end=app.indexOf('let learningMotionContext',start);
for(const [width,height] of [[320,568],[487,867],[768,1024],[1024,768],[1440,900]]){
 const compact=width<=1024,calls=[];let options,cleanup;
 const rowHeight=Math.min(384,width*.65,height*.55);
 const spacer={style:{height:'unchanged'}};
 const copy={offsetTop:rowHeight+12,offsetHeight:100,querySelector:()=>({})};
 const source={src:'truck.jpg',getBoundingClientRect:()=>({left:width*.3,top:20,width:width*.4,height:rowHeight})};
 const mosaic={offsetTop:20};
 const section={parentElement:spacer,clientWidth:width,clientHeight:height,querySelector:s=>s==='.fleet-mosaic'?mosaic:s==='.fleet-center img'?source:copy,querySelectorAll:s=>s==='img'?[]:Array.from({length:7},()=>({})),appendChild(){},getBoundingClientRect:()=>({left:0,top:0})};
 const timeline={fromTo(target,from,to){calls.push({target,from,to});return this},to(target,to){calls.push({target,to});return this}};
 const gsap={registerPlugin(){},matchMedia:()=>({add(conditions,callback){cleanup=callback({conditions:{compact,motion:true}})},revert(){}}),timeline(config){options=config.scrollTrigger;return timeline}};
 const context={document:{querySelector:()=>section,createElement:()=>({style:{},setAttribute(){},appendChild(){},remove(){}})},window:{gsap,ScrollTrigger:{},visualViewport:{height:height/2}},gsap,ScrollTrigger:{refresh(){}},innerHeight:height,requestAnimationFrame(){},getComputedStyle:el=>el===section?{paddingBottom:'20px'}:{objectPosition:'72% center'}};
 vm.createContext(context);vm.runInContext('let fleetMotionContext;'+app.slice(start,end)+';initFleetMotion()',context);
 assert(options.pin&&options.pinSpacing);assert.equal(options.end(),'+='+height);
 assert(!calls.some(c=>c.target===section),'never animate dimensions of the pin target');
 assert.equal(options.onRefresh,undefined,'do not overwrite ScrollTrigger spacer geometry');
 assert.equal(spacer.style.height,'unchanged');
 const expansion=calls.find(c=>c.from&&c.target!==copy);
 assert.equal(expansion.to.width(),width);assert.equal(expansion.to.height(),height,'use the clipping container height even when visualViewport differs');
 if(compact){const caption=calls.find(c=>c.target===copy&&c.from);const bottom=mosaic.offsetTop+copy.offsetTop+copy.offsetHeight+caption.to.y();assert.equal(bottom,height-20);}
 else assert(!calls.some(c=>c.target===copy&&c.from),'desktop caption placement unchanged');
 cleanup();
}
console.log('PASS: stable pin ownership, no spacer overrides, full-container image and caption bounds at 320/487/768/1024/1440 widths (mock GSAP/DOM)');
