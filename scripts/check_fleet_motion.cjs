const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('dist/assets/app.js','utf8');
const start=app.indexOf('function initFleetMotion(){'),end=app.indexOf('\n\n\nlet learningMotionContext',start);
for(const [width,height] of [[320,568],[487,867],[768,1024],[1024,768],[1440,900]]){
 const compact=width<=1024, calls=[];let options,cleanup;
 const rowHeight=Math.min(384,width*.65,height*.55),contentHeight=rowHeight+112;
 const spacer={classList:{contains:c=>c==='pin-spacer'},style:{}};
 const copy={querySelector:()=>({})};
 const source={src:'truck.jpg',getBoundingClientRect:()=>({left:width*.3,top:20,width:width*.4,height:rowHeight})};
 const mosaic={getBoundingClientRect:()=>({height:contentHeight})};
 const section={parentElement:spacer,clientWidth:width,clientHeight:compact?contentHeight+40:height,querySelector:s=>s==='.fleet-mosaic'?mosaic:s==='.fleet-center img'?source:copy,querySelectorAll:s=>s==='img'?[]:Array.from({length:7},()=>({})),appendChild(){},getBoundingClientRect:()=>({left:0,top:0})};
 const timeline={fromTo(target,from,to){calls.push({target,from,to});return this},to(){return this}};
 const gsap={registerPlugin(){},matchMedia:()=>({add(conditions,callback){assert(conditions.compact.includes('1024'));cleanup=callback({conditions:{compact,motion:true}})},revert(){}}),timeline(config){options=config.scrollTrigger;return timeline}};
 const context={document:{querySelector:()=>section,documentElement:{clientHeight:height},createElement:()=>({style:{},setAttribute(){},appendChild(){},remove(){}})},window:{gsap,ScrollTrigger:{},visualViewport:{height}},gsap,ScrollTrigger:{refresh(){}},innerHeight:height,requestAnimationFrame(){},getComputedStyle:el=>el===section?{paddingTop:'20px',paddingBottom:'20px'}:{objectPosition:'72% center'}};
 vm.createContext(context);vm.runInContext('let fleetMotionContext;'+app.slice(start,end)+';initFleetMotion()',context);
 assert(options.pin&&options.pinSpacing);assert.equal(options.end(),'+'+'='+Math.max(compact?contentHeight+40:0,height));
 if(compact){const grow=calls.find(c=>c.target===section);assert(grow);assert.equal(grow.from.height(),Math.ceil(contentHeight+40));assert.equal(grow.to.height(),height);assert(grow.from.height()<grow.to.height());options.onRefresh({start:200,end:200+height});assert.equal(spacer.style.height,height*2+'px');}
 else assert(!calls.some(c=>c.target===section),'desktop must not gain the compact height tween');
 const image=calls.find(c=>c.target!==section);assert.equal(image.to.width(),width);assert.equal(image.to.height(),height);cleanup();
}
console.log('PASS: compact content height, full viewport expansion, reserved scroll height and unchanged desktop path at 320/487/768/1024/1440 widths (mock GSAP/DOM)');
