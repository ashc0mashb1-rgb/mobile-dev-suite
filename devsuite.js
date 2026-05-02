(function(){
if(window.__MDS)return;window.__MDS=1;

// ---------- STATE ----------
const S = JSON.parse(localStorage.__MDS||"{}");

// ---------- FLOAT BUTTON ----------
const btn=document.createElement('div');
btn.innerHTML=S.stealth?'':'👹';
Object.assign(btn.style,{ 
 position:'fixed',bottom:'100px',right:'20px',
 width:'60px',height:'60px',borderRadius:'50%',
 background:'#000',color:'#fff',display:'flex',
 alignItems:'center',justifyContent:'center',
 fontSize:'22px',zIndex:999999,opacity:S.stealth?0.2:0.9
});
document.body.appendChild(btn);
let open = false;

btn.style.touchAction = "none";
  open = !open;
  sheet.style.bottom = open ? '0' : '-100%';
};
// drag
let open = false;
let pressTimer = null;
let lastTap = 0;
let dragging = false;
let dx, dy;

btn.addEventListener('touchstart', (e) => {
  const now = Date.now();

  pressTimer = setTimeout(() => {
    dragging = true;
  }, 450);

  if (now - lastTap < 300) {
    clearTimeout(pressTimer);
    dragging = false;

    if (typeof startInspect === "function") {
      startInspect();
    }
  }

  lastTap = now;

  const t = e.touches[0];
  dx = t.clientX - btn.offsetLeft;
  dy = t.clientY - btn.offsetTop;
});

btn.addEventListener('touchmove', (e) => {
  if (!dragging) return;

  const t = e.touches[0];
  btn.style.left = (t.clientX - dx) + 'px';
  btn.style.top = (t.clientY - dy) + 'px';

  btn.style.right = 'auto';
  btn.style.bottom = 'auto';
});

btn.addEventListener('touchend', () => {
  clearTimeout(pressTimer);

  if (!dragging) {
    open = !open;
    sheet.style.bottom = open ? '0' : '-100%';
  }

  dragging = false;
});
window.ontouchend=()=>d=false;

// ---------- PANEL ----------
const sheet=document.createElement('div');
Object.assign(sheet.style,{ 
 position:'fixed',left:0,bottom:'-100%',
 width:'100%',height:'65%',
 background:'#111',color:'#fff',
 zIndex:999999,transition:'0.3s',
 borderTopLeftRadius:'16px',borderTopRightRadius:'16px',
 display:'flex',flexDirection:'column'
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

btn.onclick=()=>sheet.style.bottom='0';
sheet.querySelector('#close').onclick=()=>sheet.style.bottom='-100%';

const view=sheet.querySelector('#view');

// ---------- INSPECT ----------
let inspecting=false,selectedEl,hl;

function startInspect(){
 inspecting=true;
 hl=document.createElement('div');
 Object.assign(hl.style,{ 
  position:'fixed',border:'2px solid #00ffc3',
  background:'rgba(0,255,200,0.15)',
  zIndex:999998,pointerEvents:'none'
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
 const el=e.target;
 selectedEl=el;
 const r=el.getBoundingClientRect();
 Object.assign(hl.style,{ 
  top:r.top+'px',left:r.left+'px',
  width:r.width+'px',height:r.height+'px'
 });
 e.preventDefault();e.stopPropagation();
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
  <button id="parent">Parent</button>
 `;
 view.querySelector('#applyDom').onclick=()=>{
  const tmp=document.createElement('div');
  tmp.innerHTML=view.querySelector('#domEdit').value;
  selectedEl.replaceWith(tmp.firstElementChild);
 };
 view.querySelector('#parent').onclick=()=>{
  if(selectedEl.parentElement){
   selectedEl=selectedEl.parentElement;
   renderDOM();
  }
 };
}

// ---------- CSS ----------
function renderCSS(){
 if(!selectedEl)return;
 view.innerHTML=`
  <input id="style" placeholder="color:red;" style="width:100%"/>
  <button id="applyCss">Apply</button>
 `;
 view.querySelector('#applyCss').onclick=()=>{
  selectedEl.style.cssText+=view.querySelector('#style').value;
 };
}

// ---------- JS ----------
function renderJS(){
 view.innerHTML=`
  <textarea id="js" style="width:100%;height:70%"></textarea>
  <button id="run">Run</button>
 `;
 view.querySelector('#run').onclick=()=>{
  try{eval(view.querySelector('#js').value);}catch(e){console.error(e);}
 };
}

// ---------- NET ----------
function renderNet(){
 view.innerHTML=`<div id="log"></div>`;
}

// ---------- TOOLS ----------
function renderTools(){
 view.innerHTML=`
  <button id="stealth">Stealth</button>
  <input id="find" placeholder="find"/>
  <input id="rep" placeholder="replace"/>
  <button id="fr">Replace</button>
 `;
 view.querySelector('#stealth').onclick=()=>{
  S.stealth=!S.stealth;
  localStorage.__MDS=JSON.stringify(S);
  btn.style.opacity=S.stealth?0.2:0.9;
 };
 view.querySelector('#fr').onclick=()=>{
  let f=view.querySelector('#find').value;
  let r=view.querySelector('#rep').value;
  document.body.innerHTML=document.body.innerHTML.replaceAll(f,r);
 };
}

// ---------- NAV ----------
sheet.querySelectorAll('#tabs button').forEach(b=>{
 b.onclick=()=>{
  if(b.dataset=='inspect') startInspect();
  if(b.dataset=='dom') renderDOM();
  if(b.dataset=='css') renderCSS();
  if(b.dataset=='js') renderJS();
  if(b.dataset=='net') renderNet();
  if(b.dataset=='tools') renderTools();
 };
});

// ---------- FREEZE ----------
let frozen=false;
sheet.querySelector('#freeze').onclick=()=>{
 frozen=!frozen;
 document.body.style.pointerEvents=frozen?'none':'auto';
 sheet.style.pointerEvents='auto';
};

// ---------- RELOAD ----------
sheet.querySelector('#reload').onclick=()=>location.reload();

// ---------- SAVE ----------
sheet.querySelector('#save').onclick=()=>{
 localStorage.__MDS_PRESET=view.innerHTML;
};

// ---------- NETWORK ----------
const f=window.fetch;
window.fetch=async(...a)=>{
 const r=await f(...a);
 log(a[0],r.status);
 return r;
};

const xo=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,u){
 this.addEventListener('load',()=>log(u,this.status));
 return xo.apply(this,arguments);
};

function log(u,s){
 const l=sheet.querySelector('#log');
 if(l) l.innerHTML+=`<div>${s} - ${u}</div>`;
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
