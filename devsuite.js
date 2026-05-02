(function(){
if(window.__MDS)return;window.__MDS=1;

// ---------- STATE ----------
const S = JSON.parse(localStorage.__MDS||"{}");

// ---------- PANEL ----------
const sheet=document.createElement('div');
Object.assign(sheet.style,{ 
 position:'fixed',left:0,bottom:'-100%',
 width:'100%',height:'65%',
 background:'#111',color:'#fff',
 zIndex:999999,transition:'0.3s',
 borderTopLeftRadius:'16px',
 borderTopRightRadius:'16px',
 display:'flex',
 flexDirection:'column'
});

sheet.innerHTML=`
<div style="padding:10px;background:#222;text-align:center">DEV SUITE</div>
<div id="tabs" style="display:flex;gap:6px;padding:6px;overflow:auto">
 <button data="inspect">Inspect</button>
 <button data="dom">DOM</button>
 <button data="css">CSS</button>
 <button data="js">JS</button>
 <button data="net">Net</button>
 <button data="tools">Tools</button>
</div>
<div id="view" style="flex:1;overflow:auto;padding:10px"></div>
<div style="display:flex;gap:6px;padding:10px">
 <button id="freeze">Freeze</button>
 <button id="reload">Reload</button>
 <button id="save">Save</button>
 <button id="close">Close</button>
</div>
`;

document.body.appendChild(sheet);

// ---------- FLOAT BUTTON ----------
const btn=document.createElement('div');
btn.innerHTML=S.stealth?'':'👹';

Object.assign(btn.style,{ 
 position:'fixed',
 bottom:'100px',
 right:'20px',
 width:'60px',
 height:'60px',
 borderRadius:'50%',
 background:'#000',
 color:'#fff',
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 fontSize:'22px',
 zIndex:999999,
 opacity:S.stealth?0.2:0.9,
 touchAction:'none'
});

document.body.appendChild(btn);

// ---------- PANEL CONTROL ----------
let open=false;
btn.onclick=()=>{};

// ---------- GESTURE SYSTEM ----------
let pressTimer=null;
let lastTap=0;
let dragging=false;
let dx,dy;

// TOUCH START
btn.addEventListener('touchstart',(e)=>{
 const now=Date.now();

 pressTimer=setTimeout(()=>{
  dragging=true;
 },450);

 // double tap = inspect
 if(now-lastTap<300){
  clearTimeout(pressTimer);
  dragging=false;
  if(typeof startInspect==="function") startInspect();
 }

 lastTap=now;

 const t=e.touches[0];
 dx=t.clientX-btn.offsetLeft;
 dy=t.clientY-btn.offsetTop;
});

// TOUCH MOVE
btn.addEventListener('touchmove',(e)=>{
 if(!dragging)return;

 const t=e.touches[0];
 btn.style.left=(t.clientX-dx)+'px';
 btn.style.top=(t.clientY-dy)+'px';
 btn.style.right='auto';
 btn.style.bottom='auto';
});

// TOUCH END
btn.addEventListener('touchend',()=>{
 clearTimeout(pressTimer);

 if(!dragging){
  open=!open;
  sheet.style.bottom=open?'0':'-100%';
 }

 dragging=false;
});

// ---------- CLOSE BUTTON ----------
sheet.querySelector('#close').onclick=()=>{
 sheet.style.bottom='-100%';
 open=false;
};

const view=sheet.querySelector('#view');

// ---------- INSPECT ----------
let inspecting=false,selectedEl,hl;

function startInspect(){
 inspecting=true;
 hl=document.createElement('div');
 Object.assign(hl.style,{ 
  position:'fixed',
  border:'2px solid #00ffc3',
  background:'rgba(0,255,200,0.15)',
  zIndex:999998,
  pointerEvents:'none'
 });
 document.body.appendChild(hl);
 document.addEventListener('touchstart',pick,true);
}

function stopInspect(){
 inspecting=false;
 hl?.remove();
 document.removeEventListener('touchstart',pick,true);
}

function pick(e){
 if(!inspecting)return;
 selectedEl=e.target;

 const r=selectedEl.getBoundingClientRect();

 Object.assign(hl.style,{
  top:r.top+'px',
  left:r.left+'px',
  width:r.width+'px',
  height:r.height+'px'
 });

 e.preventDefault();
 e.stopPropagation();

 stopInspect();
 renderDOM();
}

// ---------- DOM ----------
function renderDOM(){
 if(!selectedEl)return;

 view.innerHTML=`
  <div>Path: ${getPath(selectedEl)}</div>
  <textarea id="domEdit" style="width:100%;height:60%">${esc(selectedEl.outerHTML)}</textarea>
  <button id="applyDom">Apply</button>
 `;

 view.querySelector('#applyDom').onclick=()=>{
  const tmp=document.createElement('div');
  tmp.innerHTML=view.querySelector('#domEdit').value;
  selectedEl.replaceWith(tmp.firstElementChild);
 };
}

// ---------- UTILS ----------
function esc(s){
 return s.replace(/[&<>'"]/g,t=>(
  {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]
 ));
}

function getPath(el){
 let p=[];
 while(el.parentElement){
  p.unshift(el.tagName.toLowerCase());
  el=el.parentElement;
 }
 return p.join(' > ');
}

})();
