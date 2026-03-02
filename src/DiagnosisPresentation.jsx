import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ─── Audio ─── */
let _ac = null;
function getCtx() {
  try {
    if (!_ac) { const A = window.AudioContext||window.webkitAudioContext; if(!A) return null; _ac=new A(); }
    if (_ac.state==="suspended") _ac.resume();
    return _ac;
  } catch(_){ return null; }
}
function beep(freq,type,dur,vol){
  try {
    const ctx=getCtx(); if(!ctx) return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type=type||"sine"; o.frequency.setValueAtTime(freq||440,ctx.currentTime);
    g.gain.setValueAtTime(vol||0.05,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(dur||0.1));
    o.start(); o.stop(ctx.currentTime+(dur||0.1));
  } catch(_){}
}
const sfxClick  = ()=>beep(700,"sine",0.05,0.04);
const sfxCheck  = ()=>{ beep(520,"sine",0.08,0.06); setTimeout(()=>beep(780,"sine",0.12,0.04),90); };
const sfxUncheck= ()=>beep(300,"sine",0.06,0.04);
const sfxHover  = ()=>beep(1100,"sine",0.03,0.012);
const sfxOpen   = ()=>beep(600,"sine",0.07,0.05);
const sfxWhoosh = ()=>[150,280,460].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.1,0.04),i*55));
const sfxBoot   = ()=>[220,330,440,550,660,880].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.18,0.06),i*100));
const sfxChime  = ()=>[440,554,659,880].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.35,0.07),i*100));

/* ─── Swipe ─── */
function useSwipe(onLeft,onRight){
  const sx=useRef(null),sy=useRef(null);
  return {
    onTouchStart:e=>{sx.current=e.touches[0].clientX;sy.current=e.touches[0].clientY;},
    onTouchEnd:e=>{
      if(sx.current===null) return;
      const dx=e.changedTouches[0].clientX-sx.current;
      const dy=e.changedTouches[0].clientY-sy.current;
      if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){dx<0?onLeft():onRight();}
      sx.current=null; sy.current=null;
    },
  };
}

/* ─────────────────────────────────
   COLOR TOKENS  (light theme)
───────────────────────────────── */
const C   = "'Share Tech Mono',monospace";
const F   = "'Inter','Noto Sans JP',sans-serif";
const BG  = "#f3f6f2";          /* warm off-white background */
const TX  = "#1a2e20";          /* near-black text */
const TX2 = "#4b6b55";          /* secondary text */
const TX3 = "#8a9e8e";          /* muted text */
const BD  = "rgba(0,0,0,.09)";  /* border */
const SF  = "#ffffff";          /* surface / card bg */
const SFT = "#f8faf8";          /* tinted surface */
const GN  = "#059669";          /* green accent */
const BL  = "#0284c7";          /* blue */
const AM  = "#d97706";          /* amber */
const RD  = "#dc2626";          /* red */
const CY  = "#0891b2";          /* cyan */
const PU  = "#7c3aed";          /* purple */
const HDR = "rgba(243,246,242,.94)"; /* header/footer bg */

/* ─── BgCanvas (light, subtle) ─── */
function BgCanvas(){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    let W=canvas.width=window.innerWidth, H=canvas.height=window.innerHeight;
    const dots=Array.from({length:28},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.5+.5}));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      dots.forEach((a,i)=>dots.forEach((b,j)=>{
        if(j<=i) return;
        const d=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
        if(d<130){ctx.strokeStyle=`rgba(5,150,105,${(1-d/130)*0.07})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }));
      dots.forEach(d=>{
        ctx.fillStyle="rgba(5,150,105,0.18)";
        ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
        d.x+=d.vx;d.y+=d.vy;
        if(d.x<0||d.x>W)d.vx*=-1;
        if(d.y<0||d.y>H)d.vy*=-1;
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const onR=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;};
    window.addEventListener("resize",onR);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onR);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.6}}/>;
}

/* ─── Shell ─── */
function Shell({children}){
  return (
    <div style={{height:"100%",width:"100%",overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",boxSizing:"border-box"}}>
      <div style={{minHeight:"100%",width:"100%",maxWidth:"780px",margin:"0 auto",padding:"clamp(1rem,2.5vw,1.6rem) clamp(1.5rem,4vw,3rem)",display:"flex",flexDirection:"column",justifyContent:"center",boxSizing:"border-box"}}>
        {children}
      </div>
    </div>
  );
}

/* ─── SLabel ─── */
function SLabel({children,color}){
  const c=color||GN;
  return (
    <div style={{fontFamily:C,color:c,fontSize:".68rem",letterSpacing:".2em",marginBottom:".7rem",display:"flex",alignItems:"center",gap:".6rem",fontWeight:400}}>
      <span style={{opacity:.7}}>{children}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${c}35,transparent)`}}/>
    </div>
  );
}

/* ─── ProgressDots ─── */
function ProgressDots({cur,total}){
  return (
    <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{width:i<cur?14:5,height:3,background:i<cur?GN:"rgba(5,150,105,.2)",boxShadow:i<cur?`0 0 4px ${GN}70`:"none",transition:"all .3s",borderRadius:2}}/>
      ))}
    </div>
  );
}

/* ─── HoverCard (light) ─── */
function HoverCard({children,color,style={},onClick}){
  const [hov,setHov]=useState(false);
  const c=color||GN;
  return (
    <div onMouseEnter={()=>{setHov(true);sfxHover();}} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{...style,cursor:onClick?"pointer":"default",
        transform:hov?"translateY(-2px) scale(1.008)":"translateY(0) scale(1)",
        boxShadow:hov?`0 6px 24px ${c}22,0 0 0 1.5px ${c}45`:style.boxShadow||`0 1px 4px rgba(0,0,0,.06)`,
        transition:"transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s"}}>
      {children}
    </div>
  );
}

/* ─── Accordion ─── */
function Accordion({title,sub,icon,color,children,defaultOpen=false}){
  const [open,setOpen]=useState(defaultOpen);
  const c=color||GN;
  return (
    <div style={{border:`1px solid ${open?c+"40":BD}`,borderRadius:8,overflow:"hidden",transition:"border-color .2s",boxShadow:open?`0 2px 12px ${c}15`:`0 1px 3px rgba(0,0,0,.05)`}}>
      {/* Header row */}
      <button onClick={()=>{setOpen(p=>!p);open?sfxUncheck():sfxOpen();}}
        style={{width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:12,padding:"clamp(.75rem,2.5vw,.95rem) clamp(.9rem,3vw,1.2rem)",background:open?`${c}08`:SF,border:"none",cursor:"pointer",transition:"background .2s",WebkitTapHighlightColor:"transparent"}}>
        {icon&&<div style={{fontSize:"1.3rem",flexShrink:0,filter:open?"none":"grayscale(.4)"}}>{icon}</div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:F,fontWeight:700,fontSize:"clamp(.95rem,3vw,1.05rem)",color:open?TX:TX2,lineHeight:1.25,transition:"color .2s"}}>{title}</div>
          {sub&&<div style={{fontFamily:F,fontSize:".75rem",color:TX3,marginTop:2}}>{sub}</div>}
        </div>
        <div style={{fontFamily:C,fontSize:".7rem",color:open?c:TX3,flexShrink:0,transition:"transform .25s,color .2s",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</div>
      </button>
      {/* Body */}
      {open&&(
        <div style={{padding:"clamp(.7rem,2.5vw,.9rem) clamp(.9rem,3vw,1.2rem)",borderTop:`1px solid ${c}25`,background:SFT,animation:"accOpen .2s ease"}}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Badge (小タグ) ─── */
function Badge({children,color}){
  const c=color||GN;
  return (
    <span style={{fontFamily:C,fontSize:".62rem",padding:"2px 8px",background:`${c}15`,border:`1px solid ${c}40`,color:c,borderRadius:3,letterSpacing:".06em",whiteSpace:"nowrap"}}>
      {children}
    </span>
  );
}

/* ─── StatRow ─── */
function StatRow({label,before,after,color}){
  const c=color||GN;
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid rgba(0,0,0,.05)`}}>
      <span style={{fontFamily:F,fontSize:".82rem",color:TX2}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontFamily:C,fontSize:".78rem",color:TX3,textDecoration:"line-through"}}>{before}</span>
        <span style={{color:TX3,fontSize:".7rem"}}>→</span>
        <span style={{fontFamily:C,fontSize:".82rem",color:c,fontWeight:700}}>{after}</span>
      </div>
    </div>
  );
}

/* ─── CheckToggle ─── */
function CheckToggle({checked,label,sub,color=GN,onChange}){
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>{onChange();checked?sfxUncheck():sfxCheck();}}
      style={{
        display:"flex",alignItems:"flex-start",gap:12,
        padding:"clamp(.7rem,2vw,.85rem) clamp(.8rem,2.5vw,1rem)",
        border:`1px solid ${checked?color+"50":BD}`,
        background:checked?`${color}0e`:SF,
        borderRadius:6,cursor:"pointer",
        transform:hov?"translateX(4px)":"translateX(0)",
        boxShadow:hov?`0 3px 12px ${color}20`:"0 1px 3px rgba(0,0,0,.04)",
        transition:"all .18s cubic-bezier(.34,1.56,.64,1)",
      }}>
      <div style={{width:20,height:20,flexShrink:0,border:`1.5px solid ${checked?color:"rgba(0,0,0,.2)"}`,borderRadius:4,background:checked?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,transition:"all .2s",boxShadow:checked?`0 0 8px ${color}50`:"none"}}>
        {checked&&<span style={{color:"#fff",fontSize:".65rem",fontWeight:900}}>✓</span>}
      </div>
      <div>
        <div style={{fontFamily:F,fontWeight:600,fontSize:".9rem",color:checked?TX:TX2,transition:"color .2s"}}>{label}</div>
        {sub&&<div style={{fontFamily:F,fontSize:".75rem",color:TX3,marginTop:2}}>{sub}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   THREE.JS: 3D SMARTPHONE (dark screen on light page)
══════════════════════════════════ */
function PhoneScene3D(){
  const mountRef=useRef(null);
  useEffect(()=>{
    const el=mountRef.current; if(!el) return;
    const W=el.clientWidth, H=el.clientHeight;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0xe8ece5); /* match light bg */
    const camera=new THREE.PerspectiveCamera(45,W/H,0.1,100);
    camera.position.set(0,0,9);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(W,H);
    renderer.shadowMap.enabled=true;
    el.appendChild(renderer.domElement);
    scene.fog=new THREE.Fog(0xe8ece5,12,20);

    // Lights for light scene
    scene.add(new THREE.AmbientLight(0xffffff,0.9));
    const key=new THREE.DirectionalLight(0xffffff,0.8); key.position.set(3,5,6); scene.add(key);
    const fill=new THREE.PointLight(0x059669,4,18); fill.position.set(-3,1,4); scene.add(fill);
    const rim=new THREE.PointLight(0x0284c7,2,12); rim.position.set(4,-2,-2); scene.add(rim);

    const phoneGroup=new THREE.Group();

    // Body — dark phone frame
    const bodyMat=new THREE.MeshPhongMaterial({color:0x1a1a2e,shininess:150,specular:0x4ade80});
    const body=new THREE.Mesh(new THREE.BoxGeometry(2.2,4.4,0.22),bodyMat);
    phoneGroup.add(body);

    // Screen bezel
    const bezel=new THREE.Mesh(new THREE.BoxGeometry(2.0,4.1,0.12),new THREE.MeshPhongMaterial({color:0x0d1117,shininess:40}));
    bezel.position.z=0.06; phoneGroup.add(bezel);

    // Screen bg
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.7,3.6),new THREE.MeshBasicMaterial({color:0x080f1c}));
    screen.position.z=0.12; phoneGroup.add(screen);

    // Screen UI cells
    const cells=[
      {x:-.55,y:1.2,w:1.1,h:.45,c:0x059669},{x:-.55,y:.6,w:1.1,h:.35,c:0x0284c7},
      {x:-.55,y:.1,w:.5,h:.5,c:0xd97706},{x:.1,y:.1,w:.5,h:.5,c:0x7c3aed},
      {x:-.55,y:-.55,w:1.1,h:.75,c:0x0891b2},{x:-.55,y:-1.3,w:.5,h:.35,c:0x059669},{x:.1,y:-1.3,w:.5,h:.35,c:0xdc2626},
    ];
    cells.forEach(c=>{
      const m=new THREE.Mesh(new THREE.PlaneGeometry(c.w,c.h),new THREE.MeshBasicMaterial({color:c.c,transparent:true,opacity:.15}));
      m.position.set(c.x+c.w/2,c.y,.13); phoneGroup.add(m);
      const bar=new THREE.Mesh(new THREE.PlaneGeometry(c.w,.04),new THREE.MeshBasicMaterial({color:c.c,transparent:true,opacity:.9}));
      bar.position.set(c.x+c.w/2,c.y+c.h/2-.02,.131); phoneGroup.add(bar);
    });

    // Home bar
    const home=new THREE.Mesh(new THREE.PlaneGeometry(.5,.05),new THREE.MeshBasicMaterial({color:0x059669,transparent:true,opacity:.6}));
    home.position.set(0,-1.75,.13); phoneGroup.add(home);

    // Notch
    const notch=new THREE.Mesh(new THREE.SphereGeometry(.06,16,16),new THREE.MeshBasicMaterial({color:0x1a1a2e}));
    notch.position.set(0,1.98,.14); notch.scale.set(1,1,.3); phoneGroup.add(notch);

    // Buttons
    [1.65,1.2,.75].forEach(y=>{
      const btn=new THREE.Mesh(new THREE.BoxGeometry(.06,.3,.1),new THREE.MeshPhongMaterial({color:0x2a2a3e,shininess:60}));
      btn.position.set(1.14,y,0); phoneGroup.add(btn);
    });
    [-.6,-1.15].forEach(y=>{
      const v=new THREE.Mesh(new THREE.BoxGeometry(.06,.45,.1),new THREE.MeshPhongMaterial({color:0x2a2a3e,shininess:60}));
      v.position.set(-1.14,y,0); phoneGroup.add(v);
    });

    scene.add(phoneGroup);
    phoneGroup.position.y=.4;

    // Orbiting particles (lighter colors)
    const pN=60, pPos=new Float32Array(pN*3);
    const pV=Array.from({length:pN},()=>({
      theta:Math.random()*Math.PI*2,phi:Math.random()*Math.PI,
      r:2.5+Math.random()*1.8,speed:(Math.random()-.5)*.018+.008,drift:Math.random()*.007-.0035,
    }));
    const pGeo=new THREE.BufferGeometry();
    pGeo.setAttribute("position",new THREE.BufferAttribute(pPos,3));
    const pC=new Float32Array(pN*3);
    const cols=[[.02,.59,.41],[.01,.52,.78],[.85,.47,.02],[.48,.23,.93]];
    for(let i=0;i<pN;i++){const c=cols[i%cols.length];pC[i*3]=c[0];pC[i*3+1]=c[1];pC[i*3+2]=c[2];}
    pGeo.setAttribute("color",new THREE.BufferAttribute(pC,3));
    const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.08,vertexColors:true,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(pts);

    const sGlow=new THREE.PointLight(0x059669,2,4);
    sGlow.position.set(0,0,1.5); phoneGroup.add(sGlow);

    // Grid (subtle)
    const grid=new THREE.GridHelper(14,14,0x05966920,0x05966910);
    grid.position.y=-3.5; scene.add(grid);

    let raf; const clock=new THREE.Clock();
    let rotX=0,rotY=0,autoRotY=0;
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      autoRotY+=.005;
      phoneGroup.rotation.y=autoRotY+Math.sin(t*.3)*.15+rotY;
      phoneGroup.rotation.x=Math.sin(t*.2)*.06+rotX;
      phoneGroup.position.y=.4+Math.sin(t*.8)*.12;
      sGlow.intensity=1.5+Math.sin(t*2.5)*.8;
      fill.intensity=3.5+Math.sin(t*1.2)*1;
      pV.forEach((v,i)=>{
        v.theta+=v.speed; v.phi+=v.drift;
        const r=v.r+Math.sin(t*.5+i)*.3;
        pPos[i*3]=r*Math.sin(v.phi)*Math.cos(v.theta);
        pPos[i*3+1]=r*Math.cos(v.phi)*.5+Math.sin(t*.3+i)*.5;
        pPos[i*3+2]=r*Math.sin(v.phi)*Math.sin(v.theta);
      });
      pGeo.attributes.position.needsUpdate=true;
      let ci=0;
      phoneGroup.children.forEach(ch=>{
        if(ch.material&&ch.material.opacity<.5&&ch.material.opacity>.05){
          ch.material.opacity=.1+.1*Math.abs(Math.sin(t*1.5+ci*.8)); ci++;
        }
      });
      renderer.render(scene,camera);
    };
    animate();

    let drag=false,lMX=0,lMY=0;
    renderer.domElement.addEventListener("mousedown",e=>{drag=true;lMX=e.clientX;lMY=e.clientY;});
    window.addEventListener("mouseup",()=>{drag=false;});
    window.addEventListener("mousemove",e=>{
      if(!drag) return;
      rotY+=(e.clientX-lMX)*.008; rotX+=(e.clientY-lMY)*.005;
      rotX=Math.max(-.5,Math.min(.5,rotX)); lMX=e.clientX; lMY=e.clientY;
    });
    let lTX=null;
    renderer.domElement.addEventListener("touchmove",e=>{
      if(!lTX){lTX=e.touches[0].clientX;return;}
      rotY+=(e.touches[0].clientX-lTX)*.01; lTX=e.touches[0].clientX;
    },{passive:true});
    renderer.domElement.addEventListener("touchend",()=>{lTX=null;});
    return()=>{cancelAnimationFrame(raf);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
  },[]);
  return (
    <div style={{position:"relative",width:"100%"}}>
      <div ref={mountRef} style={{width:"100%",height:"clamp(200px,45vw,320px)",borderRadius:8,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.1)"}}/>
      <div style={{position:"absolute",bottom:8,right:10,fontFamily:C,fontSize:".55rem",color:`${GN}60`}}>ドラッグで回転</div>
    </div>
  );
}

/* ─── PhoneMockup CSS ─── */
function PhoneMockup({children,color=GN,title=""}){
  return (
    <div style={{display:"flex",justifyContent:"center",margin:"4px 0 10px"}}>
      <div style={{width:"clamp(130px,28vw,165px)",position:"relative"}}>
        <div style={{background:"#111827",border:`2px solid ${color}35`,borderRadius:20,padding:"8px 6px 12px",boxShadow:`0 8px 28px ${color}25,0 2px 8px rgba(0,0,0,.25)`}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
            <div style={{width:38,height:5,background:"#1f2937",borderRadius:3}}/>
          </div>
          <div style={{background:"#070c18",borderRadius:10,padding:"8px 6px",minHeight:120,border:`1px solid ${color}20`}}>
            {title&&<div style={{fontFamily:C,fontSize:".46rem",color:`${color}80`,letterSpacing:".1em",marginBottom:4,textAlign:"center"}}>{title}</div>}
            {children}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
            <div style={{width:36,height:3,background:`${color}40`,borderRadius:2}}/>
          </div>
        </div>
        <div style={{position:"absolute",inset:-6,background:`radial-gradient(circle,${color}12,transparent 70%)`,pointerEvents:"none",borderRadius:26}}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   SLIDES
══════════════════════════════════ */

/* ─── S0: BOOT ─── */
function S0_Boot(){
  const [ph,setPh]=useState(0);
  useEffect(()=>{
    sfxBoot();
    const t1=setTimeout(()=>setPh(1),400);
    const t2=setTimeout(()=>setPh(2),1200);
    const t3=setTimeout(()=>setPh(3),2200);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <Shell>
      <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
        <div style={{opacity:ph>=1?1:0,transition:"opacity .7s",fontFamily:C,color:`${GN}70`,fontSize:".7rem",letterSpacing:".25em"}}>
          POINTQUIC / MANAGEMENT DIAGNOSIS
        </div>
        <div style={{opacity:ph>=2?1:0,transform:ph>=2?"translateY(0)":"translateY(18px)",transition:"all 1s"}}>
          <div style={{fontFamily:C,fontSize:".65rem",color:TX3,letterSpacing:".15em",marginBottom:".5rem"}}>FREE USER DIAGNOSIS</div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:"clamp(2rem,6vw,3.4rem)",lineHeight:1.1,color:TX,letterSpacing:"-.02em"}}>
            経営の課題を、<br/>
            <span style={{color:GN}}>データで解決</span>する。
          </div>
        </div>
        <div style={{opacity:ph>=3?1:0,transition:"opacity .7s"}}>
          <PhoneScene3D/>
        </div>
        {ph>=3&&(
          <div style={{fontFamily:C,color:TX3,fontSize:".65rem",display:"flex",alignItems:"center",gap:".5rem",justifyContent:"center"}}>
            <span style={{animation:"blink 1.5s step-end infinite",color:GN}}>▶</span>
            スワイプまたは NEXT をタップ
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ─── S1: INTRO ─── */
function S1_Intro(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),80);},[]);
  return (
    <Shell>
      <SLabel>PURPOSE / 本日の目的</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.4rem,4.5vw,2rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:"0 0 1.2rem"}}>
        「無料で使えているから十分」<br/>
        <span style={{color:AM}}>では、もったいない。</span>
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          {icon:"🔍",title:"現在の利用状況を確認する",sub:"どの機能を使えているか？使えていないか？",color:BL},
          {icon:"📊",title:"使えていない = 経営課題が残っている",sub:"機能は手段。その先にある経営改善が目的です。",color:AM},
          {icon:"🚀",title:"明るい未来を一緒に描く",sub:"同じ費用で、もっと大きなリターンを得る方法があります。",color:GN},
        ].map((it,i)=>(
          <HoverCard key={i} color={it.color} style={{
            display:"flex",gap:12,padding:".9rem 1rem",
            border:`1px solid ${it.color}30`,background:SF,borderRadius:8,
            borderLeft:`3px solid ${it.color}`,
            boxShadow:"0 1px 4px rgba(0,0,0,.06)",
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-14px)",
            transition:`all .35s ${i*.1}s`,
          }}>
            <div style={{fontSize:"1.5rem",flexShrink:0}}>{it.icon}</div>
            <div>
              <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:"clamp(.9rem,2.8vw,1rem)"}}>{it.title}</div>
              <div style={{fontFamily:F,color:TX2,fontSize:".8rem",marginTop:3,lineHeight:1.55}}>{it.sub}</div>
            </div>
          </HoverCard>
        ))}
      </div>
      <div style={{marginTop:12,padding:".8rem 1rem",border:`1px solid ${GN}30`,background:`${GN}0c`,borderRadius:8,opacity:vis?1:0,transition:"opacity .5s .4s"}}>
        <div style={{fontFamily:F,color:TX2,fontSize:".82rem",lineHeight:1.7}}>
          💡 今日は「サービスの説明」ではなく、<strong style={{color:GN}}>「貴社の経営改善」</strong>の話をします。
        </div>
      </div>
    </Shell>
  );
}

/* ─── S2: CHECK USAGE ─── */
function S2_Check({checks,setChecks}){
  const items=[
    {id:"prepaid",label:"プリペイド・電子マネー機能",  sub:"事前チャージ・残高管理を活用している",color:GN},
    {id:"ipad",   label:"iPad/タブレットで受付自動化", sub:"スタッフ手作業なしにポイント付与できている",color:BL},
    {id:"line",   label:"LINEセグメント配信",          sub:"顧客属性・来店頻度に応じてクーポンを送っている",color:"#16a34a"},
    {id:"nohw",   label:"専用端末なしで運用",           sub:"iPad以外の専用ハードを導入していない",color:CY},
    {id:"speed",  label:"会計・受付の時間短縮",         sub:"レジや受付の混雑が以前より改善されている",color:AM},
  ];
  const unchecked=items.filter(it=>!checks[it.id]);
  return (
    <Shell>
      <SLabel>USAGE CHECK / 利用状況確認</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:"0 0 1rem"}}>
        現在、<span style={{color:GN}}>使えている機能</span>に<br/>チェックしてください
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
        {items.map(it=>(
          <CheckToggle key={it.id} checked={!!checks[it.id]} label={it.label} sub={it.sub} color={it.color}
            onChange={()=>setChecks(p=>({...p,[it.id]:!p[it.id]}))}/>
        ))}
      </div>
      {unchecked.length>0&&(
        <div style={{padding:".85rem 1rem",border:`1px solid ${AM}45`,background:`${AM}0e`,borderRadius:8,animation:"accOpen .3s ease"}}>
          <div style={{fontFamily:C,color:`${AM}80`,fontSize:".6rem",letterSpacing:".14em",marginBottom:5}}>DIAGNOSIS RESULT</div>
          <div style={{fontFamily:F,fontWeight:700,color:AM,fontSize:"1rem",marginBottom:6}}>
            {unchecked.length}つの改善機会が見つかりました
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
            {unchecked.map(it=><Badge key={it.id} color={it.color}>{it.label}</Badge>)}
          </div>
          <div style={{fontFamily:F,color:TX2,fontSize:".8rem",lineHeight:1.6}}>
            → 次のスライドで各機能が解決する<strong style={{color:TX}}>経営課題と改善事例</strong>をご紹介します。
          </div>
        </div>
      )}
      {unchecked.length===0&&(
        <div style={{padding:".85rem 1rem",border:`1px solid ${GN}50`,background:`${GN}0e`,borderRadius:8,textAlign:"center",animation:"accOpen .3s ease"}}>
          <div style={{fontFamily:F,fontWeight:700,color:GN,fontSize:"1rem"}}>🎉 すべての機能を活用できています！</div>
          <div style={{fontFamily:F,color:TX2,fontSize:".8rem",marginTop:4}}>さらなる活用方法や上位機能についてご相談できます。</div>
        </div>
      )}
    </Shell>
  );
}

/* ─── S3: CASE 1 — 資金繰り ─── */
function S3_Case1({checks}){
  const notUsing=!checks["prepaid"];
  return (
    <Shell>
      <SLabel color={GN}>CASE 01 / 資金繰り</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        {notUsing&&<Badge color={AM}>未使用</Badge>}
        <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:0}}>
          資金繰りの悩みを<br/><span style={{color:GN}}>プリペイドで売上先取り</span>
        </h2>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Key message */}
        <div style={{display:"flex",gap:14,alignItems:"center",padding:".85rem 1rem",background:SF,border:`1px solid ${GN}30`,borderRadius:8,borderLeft:`3px solid ${GN}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontFamily:C,fontSize:"clamp(1.6rem,5vw,2.2rem)",color:GN,fontWeight:700,lineHeight:1,flexShrink:0}}>先払<br/>い</div>
          <div>
            <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:"1rem",marginBottom:3}}>チャージ時点で売上が確定する</div>
            <div style={{fontFamily:F,color:TX2,fontSize:".82rem",lineHeight:1.6}}>未来の売上を今日受け取る仕組み。返金率は平均 <strong style={{color:GN}}>2%以下</strong>。</div>
          </div>
        </div>

        {/* Before/After accordion */}
        <Accordion icon="📋" title="Before / After 比較" sub="導入前後の変化を確認" color={GN}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"BEFORE",items:["売上は来月以降に計上","仕入れ・人件費が先行","キャッシュが不安定"],color:RD,check:false},
              {label:"AFTER", items:["チャージ時点で確定","未来の売上を今日受取","キャッシュ安定"],color:GN,check:true},
            ].map((col,ci)=>(
              <div key={ci}>
                <div style={{fontFamily:C,fontSize:".58rem",color:`${col.color}70`,letterSpacing:".1em",marginBottom:5}}>{col.label}</div>
                {col.items.map(t=>(
                  <div key={t} style={{display:"flex",gap:5,marginBottom:5,alignItems:"flex-start"}}>
                    <span style={{color:col.color,fontSize:".7rem",flexShrink:0,marginTop:1}}>{col.check?"✓":"✕"}</span>
                    <span style={{fontFamily:F,fontSize:".78rem",color:TX2,lineHeight:1.4}}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Accordion>

        {/* Phone mockup accordion */}
        <Accordion icon="📱" title="画面イメージ" sub="残高管理画面の例" color={BL}>
          <PhoneMockup color={GN} title="PREPAID BALANCE">
            <div style={{textAlign:"center",padding:"2px 0"}}>
              <div style={{fontFamily:C,fontSize:".44rem",color:`${GN}60`,marginBottom:2}}>BALANCE</div>
              <div style={{fontFamily:C,fontSize:"1.2rem",color:GN,fontWeight:700}}>¥15,800</div>
              <div style={{fontFamily:F,fontSize:".4rem",color:"#4b6280",marginBottom:6}}>チャージ済み残高</div>
              <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:6}}>
                {[{l:"チャージ",c:GN},{l:"残高確認",c:BL}].map(b=>(
                  <div key={b.l} style={{background:`${b.c}25`,border:`1px solid ${b.c}50`,borderRadius:3,padding:"2px 6px",fontFamily:F,fontSize:".38rem",color:b.c}}>{b.l}</div>
                ))}
              </div>
              <div style={{height:2,background:`${GN}20`,borderRadius:1,overflow:"hidden"}}>
                <div style={{width:"73%",height:"100%",background:`linear-gradient(90deg,${GN},${GN}60)`}}/>
              </div>
              <div style={{fontFamily:C,fontSize:".36rem",color:`${GN}50`,marginTop:2}}>利用率 73%</div>
            </div>
          </PhoneMockup>
        </Accordion>

        {/* Real case */}
        <div style={{padding:".8rem 1rem",border:`1px solid ${GN}25`,background:`${GN}08`,borderRadius:8}}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            📍 <strong style={{color:TX}}>東急不動産「TENOHA代官山」</strong> — 専用ハードが不要なため複数店舗共通プリペイドを予想以上にコスト抑制して実現。
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ─── S4: CASE 2 — 人件費 ─── */
function S4_Case2({checks}){
  const notUsing=!checks["ipad"];
  return (
    <Shell>
      <SLabel color={BL}>CASE 02 / 人件費</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        {notUsing&&<Badge color={AM}>未使用</Badge>}
        <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:0}}>
          人件費を削減する<br/><span style={{color:BL}}>iPad 1台で自動化</span>
        </h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Key stats */}
        <div style={{padding:".85rem 1rem",background:SF,border:`1px solid ${BL}25`,borderRadius:8,borderLeft:`3px solid ${BL}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,textAlign:"center"}}>
            {[{v:"0",u:"スタッフ手作業",c:GN},{v:"0%",u:"ミス発生率",c:BL},{v:"1台",u:"iPad導入だけ",c:AM}].map(s=>(
              <div key={s.u}>
                <div style={{fontFamily:C,fontSize:"clamp(1.3rem,4vw,1.8rem)",color:s.c,fontWeight:700,lineHeight:1}}>{s.v}</div>
                <div style={{fontFamily:F,fontSize:".72rem",color:TX2,marginTop:3,lineHeight:1.35}}>{s.u}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow accordion */}
        <Accordion icon="⚙️" title="自動化フロー" sub="どのように手作業がなくなるか" color={BL}>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[
              {n:"01",label:"顧客がQRコードを提示",note:"LINEの画面をかざすだけ"},
              {n:"02",label:"iPadが自動スキャン",note:"スタッフ操作不要"},
              {n:"03",label:"ポイント自動付与",note:"ミス発生率ゼロ"},
              {n:"04",label:"LINE通知＆履歴記録",note:"リアルタイムで管理画面に反映"},
            ].map(s=>(
              <div key={s.n} style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{fontFamily:C,fontSize:".6rem",color:`${BL}60`,background:`${BL}12`,border:`1px solid ${BL}25`,width:24,height:24,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                <div>
                  <div style={{fontFamily:F,fontWeight:600,fontSize:".85rem",color:TX}}>{s.label}</div>
                  <div style={{fontFamily:F,fontSize:".73rem",color:TX3}}>{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Cost comparison accordion */}
        <Accordion icon="💴" title="コスト比較" sub="専用機 vs iPad" color={AM}>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            <StatRow label="初期費用" before="専用機 ¥200,000〜" after="iPad ¥50,000〜" color={GN}/>
            <StatRow label="月額保守" before="¥15,000/月" after="¥0" color={GN}/>
            <StatRow label="故障対応" before="メーカー依存" after="代替機即対応" color={BL}/>
          </div>
        </Accordion>

        <div style={{padding:".8rem 1rem",border:`1px solid ${BL}25`,background:`${BL}08`,borderRadius:8}}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            📍 <strong style={{color:TX}}>アディダスジャパン「Y-3直営店」</strong> — iPadで運用できるため導入コストをかなり抑えられた。操作が簡単でわかりやすい。
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ─── S5: CASE 3 — リピート ─── */
function S5_Case3({checks}){
  const notUsing=!checks["line"];
  const GNL="#16a34a";
  return (
    <Shell>
      <SLabel color={GNL}>CASE 03 / リピート率</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        {notUsing&&<Badge color={AM}>未使用</Badge>}
        <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:0}}>
          リピート率を上げる<br/><span style={{color:GNL}}>LINEセグメント配信</span>
        </h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Key metric */}
        <div style={{display:"flex",gap:14,alignItems:"center",padding:".85rem 1rem",background:SF,border:`1px solid ${GNL}25`,borderRadius:8,borderLeft:`3px solid ${GNL}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontFamily:C,fontSize:"clamp(1.8rem,5.5vw,2.5rem)",color:GNL,fontWeight:700,lineHeight:1,flexShrink:0}}>+38<span style={{fontSize:"55%"}}>%</span></div>
          <div>
            <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:"1rem",marginBottom:2}}>リピート来店率 向上</div>
            <div style={{fontFamily:F,color:TX2,fontSize:".82rem",lineHeight:1.55}}>セグメント配信導入後の平均改善値。一律配信と比べてクーポン利用率 <strong style={{color:GNL}}>2.4倍</strong>。</div>
          </div>
        </div>

        {/* Segments accordion */}
        <Accordion icon="🎯" title="セグメント自動仕分け" sub="3種類の顧客に自動で最適な配信" color={GNL} defaultOpen={false}>
          {[
            {label:"VIP顧客",count:"上位20%",color:AM,  rate:"開封率 68%",msg:"特別感のある限定オファー"},
            {label:"休眠顧客",count:"90日+未来店",color:RD,rate:"開封率 45%",msg:"「お久しぶり」クーポン"},
            {label:"新規顧客",count:"初回〜3回",color:GNL,rate:"開封率 72%",msg:"次回来店を促すリピーター化"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:".55rem 0",borderBottom:`1px solid ${BD}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:`0 0 6px ${s.color}80`}}/>
              <div style={{flex:1}}>
                <span style={{fontFamily:F,fontWeight:600,fontSize:".85rem",color:TX}}>{s.label}</span>
                <span style={{fontFamily:C,fontSize:".6rem",color:TX3,marginLeft:6}}>{s.count}</span>
              </div>
              <Badge color={s.color}>{s.rate}</Badge>
            </div>
          ))}
          <div style={{marginTop:8,fontFamily:F,fontSize:".75rem",color:TX3,lineHeight:1.5}}>
            ↑ 条件を設定するだけで自動配信。手動作業ゼロ。
          </div>
        </Accordion>

        {/* Phone mockup accordion */}
        <Accordion icon="📱" title="配信画面イメージ" sub="管理画面からワンクリック" color={BL}>
          <PhoneMockup color={GNL} title="LINE SEGMENT">
            <div style={{padding:"2px 0"}}>
              {[
                {l:"VIP",n:"128名",c:AM,r:"68%"},
                {l:"休眠",n:"341名",c:RD,r:"45%"},
                {l:"新規",n:"89名",c:GNL,r:"72%"},
              ].map(s=>(
                <div key={s.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.c,flexShrink:0}}/>
                    <span style={{fontFamily:F,fontSize:".42rem",color:"#94a3b8"}}>{s.l} {s.n}</span>
                  </div>
                  <span style={{fontFamily:C,fontSize:".4rem",color:s.c}}>{s.r}</span>
                </div>
              ))}
              <div style={{marginTop:4,padding:"3px 6px",background:`${GNL}20`,borderRadius:3,textAlign:"center"}}>
                <span style={{fontFamily:C,fontSize:".4rem",color:GNL}}>▶ 一斉配信</span>
              </div>
            </div>
          </PhoneMockup>
        </Accordion>

        <div style={{padding:".8rem 1rem",border:`1px solid ${GNL}25`,background:`${GNL}08`,borderRadius:8}}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            📍 <strong style={{color:TX}}>新福菜館 秋葉原店</strong> — クーポン利用が来店履歴として機能。通常のLINEが格段にバージョンアップしたと驚かれています。
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ─── S6: CASE 4 — 運用コスト ─── */
function S6_Case4({checks}){
  const notUsing=!checks["nohw"];
  return (
    <Shell>
      <SLabel color={CY}>CASE 04 / 運用コスト</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        {notUsing&&<Badge color={AM}>未使用</Badge>}
        <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:0}}>
          運用コストを下げる<br/><span style={{color:CY}}>専用機は不要</span>
        </h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Key metric */}
        <div style={{display:"flex",gap:14,alignItems:"center",padding:".85rem 1rem",background:SF,border:`1px solid ${CY}25`,borderRadius:8,borderLeft:`3px solid ${CY}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontFamily:C,fontSize:"clamp(1.5rem,4.5vw,2rem)",color:CY,fontWeight:700,lineHeight:1,flexShrink:0}}>-78<span style={{fontSize:"55%"}}>%</span></div>
          <div>
            <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:"1rem",marginBottom:2}}>導入コスト削減率</div>
            <div style={{fontFamily:F,color:TX2,fontSize:".82rem",lineHeight:1.55}}>専用POS約¥265,000 → iPad約¥56,000〜に。月額保守費もゼロに。</div>
          </div>
        </div>

        {/* Cost breakdown accordion */}
        <Accordion icon="💴" title="コスト詳細比較" sub="従来型 vs POINTQUIC" color={CY}>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            <StatRow label="端末費用"     before="専用POS ¥200,000〜" after="iPad ¥50,000〜"  color={GN}/>
            <StatRow label="月額保守費"   before="¥15,000/月"         after="¥0"             color={GN}/>
            <StatRow label="設置・工事費" before="¥50,000〜"          after="当日設置可"      color={GN}/>
            <StatRow label="故障時対応"   before="メーカー依存 数日〜" after="代替機即対応"    color={BL}/>
            <StatRow label="拠点追加"     before="端末1台+工事"        after="アカウント追加"  color={CY}/>
          </div>
        </Accordion>

        {/* Multi-store accordion */}
        <Accordion icon="🏢" title="多店舗展開のしやすさ" sub="大型施設でも対応可能" color={GN}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            管理画面からアカウントを追加するだけで店舗を追加できます。複数店舗共通ポイントカードも<strong style={{color:TX}}>ハード追加ゼロ</strong>で実現。<br/>
            NTTレゾナント様では大型商業施設向けAPIサーバーと連携し「CRED岡山」「パセーラ」など複数施設に展開しています。
          </div>
        </Accordion>

        <div style={{padding:".8rem 1rem",border:`1px solid ${CY}25`,background:`${CY}08`,borderRadius:8}}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            📍 <strong style={{color:TX}}>サンルートプラザ東京</strong> — 全館複数レストランへの導入。iPadを端末として利用できたため導入コストが大幅に抑えられました。
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ─── S7: CASE 5 — 混雑対応 ─── */
function S7_Case5({checks}){
  const notUsing=!checks["speed"];
  const [animated,setAnimated]=useState(false);
  useEffect(()=>{setTimeout(()=>setAnimated(true),250);},[]);
  return (
    <Shell>
      <SLabel color={AM}>CASE 05 / 混雑対応</SLabel>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"1rem"}}>
        {notUsing&&<Badge color={AM}>未使用</Badge>}
        <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:0}}>
          混雑を解消する<br/><span style={{color:AM}}>処理時間 30秒短縮</span>
        </h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Key metric */}
        <div style={{display:"flex",gap:14,alignItems:"center",padding:".85rem 1rem",background:SF,border:`1px solid ${AM}25`,borderRadius:8,borderLeft:`3px solid ${AM}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{fontFamily:C,fontSize:"clamp(1.5rem,4.5vw,2rem)",color:AM,fontWeight:700,lineHeight:1,flexShrink:0}}>-46<span style={{fontSize:"55%"}}>%</span></div>
          <div>
            <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:"1rem",marginBottom:2}}>レジ待ち時間 46%削減</div>
            <div style={{fontFamily:F,color:TX2,fontSize:".82rem",lineHeight:1.55}}>65秒→35秒。ピーク時の行列解消で機会損失ゼロに。</div>
          </div>
        </div>

        {/* Time comparison accordion */}
        <Accordion icon="⏱" title="処理時間の比較" sub="1件あたりの所要時間" color={AM}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {label:"従来（カード＋手入力）",time:65,max:65,color:RD},
              {label:"POINTQUIC（QRスキャン）",time:35,max:65,color:AM},
            ].map((row,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
                  <span style={{fontFamily:F,fontSize:".82rem",color:TX2}}>{row.label}</span>
                  <span style={{fontFamily:C,fontSize:".85rem",color:row.color,fontWeight:700}}>{row.time}秒</span>
                </div>
                <div style={{height:6,background:"rgba(0,0,0,.07)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:animated?`${(row.time/row.max)*100}%`:"0%",background:`linear-gradient(90deg,${row.color},${row.color}80)`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)",borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Chain effect accordion */}
        <Accordion icon="🔗" title="処理短縮がもたらす連鎖効果" sub="単なる時短ではない" color={GN}>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[
              {step:"①",text:"1人30秒短縮",note:"→ 1時間で120名をさばける"},
              {step:"②",text:"行列が解消される",note:"→ 離脱客がゼロに"},
              {step:"③",text:"スタッフに余裕が生まれる",note:"→ 接客品質が向上"},
              {step:"④",text:"顧客満足度が上がる",note:"→ リピーター化に直結"},
            ].map(c=>(
              <div key={c.step} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${BD}`}}>
                <div style={{fontFamily:C,fontSize:".7rem",color:GN,flexShrink:0,width:20}}>{c.step}</div>
                <div>
                  <div style={{fontFamily:F,fontWeight:600,fontSize:".85rem",color:TX}}>{c.text}</div>
                  <div style={{fontFamily:F,fontSize:".72rem",color:TX3}}>{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        <div style={{padding:".8rem 1rem",border:`1px solid ${AM}25`,background:`${AM}08`,borderRadius:8}}>
          <div style={{fontFamily:F,fontSize:".82rem",color:TX2,lineHeight:1.7}}>
            📍 <strong style={{color:TX}}>株式会社テーオーシー「五反田TOC」</strong> — 来場チェックが自動化されリアルタイムに来場者数を把握。管理画面の機能も充実していると評価。
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ─── S8: SUMMARY ─── */
function S8_Summary({checks}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const cases=[
    {icon:"💰",label:"資金繰り",  solution:"プリペイドで売上先取り",key:"prepaid",color:GN},
    {icon:"⚡",label:"人件費",    solution:"iPad1台で自動化",       key:"ipad",   color:BL},
    {icon:"📢",label:"リピート",  solution:"LINEセグメント配信",   key:"line",   color:"#16a34a"},
    {icon:"🔧",label:"運用コスト",solution:"専用機不要",            key:"nohw",   color:CY},
    {icon:"⏱",label:"混雑対応",  solution:"処理時間30秒短縮",      key:"speed",  color:AM},
  ];
  const solved=cases.filter(c=>checks[c.key]);
  const unsolved=cases.filter(c=>!checks[c.key]);
  return (
    <Shell>
      <SLabel>SUMMARY / 診断まとめ</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:"0 0 1rem"}}>
        <span style={{color:GN}}>{solved.length}つ</span>解決済み、
        <span style={{color:unsolved.length>0?AM:GN}}>{unsolved.length}つ</span>の改善チャンス
      </h2>
      {unsolved.length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontFamily:C,color:`${AM}70`,fontSize:".62rem",letterSpacing:".12em",marginBottom:6}}>IMPROVEMENT OPPORTUNITIES</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {unsolved.map((c,i)=>(
              <HoverCard key={i} color={c.color} style={{
                display:"flex",alignItems:"center",gap:12,padding:".8rem 1rem",
                border:`1px solid ${c.color}30`,background:SF,borderRadius:8,
                boxShadow:"0 1px 4px rgba(0,0,0,.06)",
                opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-12px)",transition:`all .3s ${i*.07}s`,
              }}>
                <div style={{fontSize:"1.3rem",flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:C,color:`${c.color}70`,fontSize:".6rem",letterSpacing:".08em",marginBottom:1}}>未解決: {c.label}</div>
                  <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:".92rem"}}>{c.solution}</div>
                </div>
                <Badge color={c.color}>有料化で解決</Badge>
              </HoverCard>
            ))}
          </div>
        </div>
      )}
      {solved.length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontFamily:C,color:`${GN}70`,fontSize:".62rem",letterSpacing:".12em",marginBottom:6}}>ALREADY SOLVED ✓</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {solved.map(c=><Badge key={c.key} color={c.color}>{c.icon} {c.label}</Badge>)}
          </div>
        </div>
      )}
      <div style={{padding:".9rem 1rem",border:`1px solid ${GN}35`,background:`${GN}0e`,borderRadius:8,opacity:vis?1:0,transition:"opacity .5s .5s"}}>
        <div style={{fontFamily:F,fontSize:".85rem",color:TX2,lineHeight:1.8}}>
          💡 有料プランへの移行は「コスト」ではなく、<strong style={{color:GN}}>未解決の経営課題への投資</strong>です。<br/>
          月額 <strong style={{color:GN}}>¥6,000〜</strong>で、今日ご覧いただいたすべての機能が使えます。
        </div>
      </div>
    </Shell>
  );
}

/* ─── S9: CASES ─── */
function S9_Cases(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const cases=[
    {name:"ヤフー株式会社 LODGE",    cat:"来場管理",color:GN,quote:"毎日数百人の来場管理をPOINTQUICで実現。社内外の交流を促すツールとして活用。"},
    {name:"アディダスジャパン Y-3",  cat:"ポイントカード",color:BL,quote:"iPadで運用できるため導入コストをかなり抑えられた。操作が簡単でわかりやすい。"},
    {name:"東急不動産 TENOHA代官山", cat:"商業施設共通ポイント",color:CY,quote:"専用ハードウェアが不要なため、予想以上にコストを抑えて複数店舗展開を実現。"},
    {name:"新福菜館 秋葉原店",       cat:"飲食クーポン活用",color:AM,quote:"クーポン利用が来店履歴として機能。通常のLINEが格段にバージョンアップした。"},
  ];
  return (
    <Shell>
      <SLabel>REAL CASES / 導入事例</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.75rem)",fontWeight:800,color:TX,lineHeight:1.2,margin:"0 0 1rem"}}>
        大企業から個人店舗まで<br/><span style={{color:GN}}>幅広く導入</span>されています
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {cases.map((c,i)=>(
          <HoverCard key={i} color={c.color} style={{
            padding:".85rem 1rem",border:`1px solid ${c.color}25`,background:SF,borderRadius:8,
            borderLeft:`3px solid ${c.color}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)",
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-14px)",transition:`all .32s ${i*.08}s`,
          }}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
              <div style={{fontFamily:F,fontWeight:700,color:TX,fontSize:".92rem"}}>{c.name}</div>
              <Badge color={c.color}>{c.cat}</Badge>
            </div>
            <div style={{fontFamily:F,color:TX2,fontSize:".8rem",lineHeight:1.65,fontStyle:"italic"}}>
              「{c.quote}」
            </div>
          </HoverCard>
        ))}
      </div>
    </Shell>
  );
}

/* ─── S10: END ─── */
function S10_End(){
  const [ph,setPh]=useState(0);
  useEffect(()=>{
    sfxChime();
    const t1=setTimeout(()=>setPh(1),400);
    const t2=setTimeout(()=>setPh(2),1100);
    const t3=setTimeout(()=>setPh(3),2000);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <Shell>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:"1.5rem"}}>
        <div style={{opacity:ph>=1?1:0,transition:"opacity .8s",fontFamily:C,color:`${GN}60`,fontSize:".68rem",letterSpacing:".22em"}}>
          DIAGNOSIS COMPLETE
        </div>
        <div style={{opacity:ph>=2?1:0,transition:"all 1s",transform:ph>=2?"translateY(0)":"translateY(18px)"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:"clamp(1.6rem,5.5vw,3rem)",color:TX,lineHeight:1.15,letterSpacing:"-.01em"}}>
            経営課題は、<br/><span style={{color:GN}}>すでに手の中</span>に<br/>あります。
          </div>
        </div>
        <div style={{opacity:ph>=3?1:0,transition:"opacity .8s",maxWidth:400}}>
          <div style={{fontFamily:F,color:TX2,fontSize:".92rem",lineHeight:1.85,marginBottom:"1.2rem"}}>
            月額 <span style={{color:GN,fontWeight:700,fontSize:"1.05rem"}}>¥6,000〜</span> で、今日ご覧いただいた<br/>
            すべての機能が使えます。<br/>
            <span style={{color:AM,fontWeight:600}}>次のステップ</span>を、一緒に踏み出しませんか。
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,alignItems:"center"}}>
            {[
              {icon:"🌐",label:"pointquic.tokyo",sub:"POINTQUICサービスサイト"},
              {icon:"📋",label:"pointquic.tokyo/user/",sub:"導入事例"},
              {icon:"📞",label:"お問い合わせ",sub:"資料請求・デモ申込み"},
            ].map(l=>(
              <div key={l.label}
                onMouseEnter={sfxHover}
                style={{fontFamily:F,padding:"8px 20px",border:`1px solid ${GN}35`,background:SF,color:TX,fontSize:".85rem",borderRadius:6,boxShadow:"0 1px 4px rgba(0,0,0,.06)",transition:"all .18s",width:"100%",maxWidth:260,textAlign:"center"}}>
                {l.icon} <strong>{l.label}</strong>
                <div style={{fontFamily:C,fontSize:".58rem",color:TX3,marginTop:2,letterSpacing:".05em"}}>{l.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ══════════════
   MAIN APP
══════════════ */
const TOTAL=11;

export default function DiagnosisPresentation(){
  const [cur,setCur]=useState(0);
  const [dir,setDir]=useState(1);
  const [anim,setAnim]=useState(false);
  const [checks,setChecks]=useState({prepaid:false,ipad:false,line:false,nohw:false,speed:false});

  const go=useCallback((next)=>{
    if(next<0||next>=TOTAL||anim) return;
    sfxWhoosh();
    setDir(next>cur?1:-1);
    setAnim(true);
    setTimeout(()=>{setCur(next);setAnim(false);},220);
  },[cur,anim]);
  const goNext=useCallback(()=>go(cur+1),[go,cur]);
  const goPrev=useCallback(()=>go(cur-1),[go,cur]);

  useEffect(()=>{
    const h=e=>{
      if(e.key==="ArrowRight"||e.key==="ArrowDown") goNext();
      if(e.key==="ArrowLeft"||e.key==="ArrowUp") goPrev();
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[goNext,goPrev]);

  const swipe=useSwipe(goNext,goPrev);

  const SLIDES=[
    {id:"BOOT",    comp:<S0_Boot/>},
    {id:"INTRO",   comp:<S1_Intro/>},
    {id:"CHECK",   comp:<S2_Check checks={checks} setChecks={setChecks}/>},
    {id:"CASE01",  comp:<S3_Case1 checks={checks}/>},
    {id:"CASE02",  comp:<S4_Case2 checks={checks}/>},
    {id:"CASE03",  comp:<S5_Case3 checks={checks}/>},
    {id:"CASE04",  comp:<S6_Case4 checks={checks}/>},
    {id:"CASE05",  comp:<S7_Case5 checks={checks}/>},
    {id:"SUMMARY", comp:<S8_Summary checks={checks}/>},
    {id:"CASES",   comp:<S9_Cases/>},
    {id:"END",     comp:<S10_End/>},
  ];

  const slide=SLIDES[cur];

  return (
    <div style={{width:"100vw",height:"100vh",background:BG,color:TX,overflow:"hidden",position:"fixed",inset:0,fontFamily:F}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Sans+JP:wght@400;600;700;900&family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        button{font-family:inherit;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(5,150,105,.25);border-radius:2px}
        @keyframes accOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glowPulse{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>

      <BgCanvas/>

      {/* Header */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:10,height:"44px",padding:"0 clamp(.8rem,3vw,1.4rem)",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${BD}`,background:HDR,backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:GN,boxShadow:`0 0 6px ${GN}`,animation:"glowPulse 2.5s ease-in-out infinite"}}/>
          <span style={{fontFamily:C,fontSize:".62rem",color:GN,letterSpacing:".14em"}}>POINTQUIC</span>
          <span style={{fontFamily:C,fontSize:".54rem",color:TX3,letterSpacing:".1em",display:"none"}}>MANAGEMENT DIAGNOSIS</span>
        </div>
        <div style={{fontFamily:C,fontSize:".58rem",color:TX3}}>
          {String(cur+1).padStart(2,"0")}/{String(TOTAL).padStart(2,"0")} {slide.id}
        </div>
      </div>

      {/* Slide area */}
      <div {...swipe} style={{position:"fixed",top:"44px",left:0,right:0,bottom:"52px",zIndex:5,overflowY:"auto",opacity:anim?0:1,transform:anim?`translateX(${dir*18}px)`:"translateX(0)",transition:"opacity .22s,transform .22s"}}>
        {slide.comp}
      </div>

      {/* Footer */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,height:"52px",padding:"0 clamp(.8rem,3vw,1.4rem)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,borderTop:`1px solid ${BD}`,background:HDR,backdropFilter:"blur(10px)"}}>
        <button onClick={goPrev} disabled={cur===0||anim}
          style={{fontFamily:C,fontSize:".66rem",letterSpacing:".12em",padding:"6px 14px",border:`1px solid ${cur===0?BD:GN+"50"}`,color:cur===0?TX3:GN,background:"transparent",borderRadius:4,cursor:cur===0?"default":"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>
          ← PREV
        </button>
        <ProgressDots cur={cur+1} total={TOTAL}/>
        <button onClick={goNext} disabled={cur===TOTAL-1||anim}
          style={{fontFamily:C,fontSize:".66rem",letterSpacing:".12em",padding:"6px 14px",border:`1px solid ${cur===TOTAL-1?BD:GN+"60"}`,color:cur===TOTAL-1?TX3:GN,background:cur===TOTAL-1?"transparent":`${GN}12`,borderRadius:4,cursor:cur===TOTAL-1?"default":"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>
          NEXT →
        </button>
      </div>
    </div>
  );
}
