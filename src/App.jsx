import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ─── Audio ─── */
let _ac = null;
function getCtx() {
  try {
    if (!_ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; _ac = new A(); }
    if (_ac.state === "suspended") _ac.resume();
    return _ac;
  } catch(_){ return null; }
}
function beep(freq, type, dur, vol) {
  try {
    const ctx = getCtx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type||"sine"; o.frequency.setValueAtTime(freq||440, ctx.currentTime);
    g.gain.setValueAtTime(vol||0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+(dur||0.1));
    o.start(); o.stop(ctx.currentTime+(dur||0.1));
  } catch(_){}
}
const sfxClick  = () => beep(700,"sine",0.05,0.04);
const sfxHover  = () => beep(1200,"sine",0.04,0.02);
const sfxWhoosh = () => [150,280,460].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.12,0.05),i*55));
const sfxBoot   = () => [220,330,440,550,660].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.15,0.06),i*110));
const sfxChime  = () => [440,554,659,880].forEach((f,i)=>setTimeout(()=>beep(f,"sine",0.4,0.08),i*100));

/* ─── Mobile detection ─── */
function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

/* ─── Swipe ─── */
function useSwipe(onLeft, onRight) {
  const startX = useRef(null), startY = useRef(null);
  return {
    onTouchStart: e => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY; },
    onTouchEnd: e => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { dx < 0 ? onLeft() : onRight(); }
      startX.current = null; startY.current = null;
    },
  };
}

/* ─── Design tokens ─── */
const C  = "'Share Tech Mono',monospace";
const F  = "'Inter','Noto Sans JP',sans-serif";
const BG = "#070c18";
const BL = "#0ea5e9";
const CY = "#06b6d4";
const AM = "#f59e0b";
const GN = "#10b981";
const RD = "#ef4444";

/* ══════════════════════════════════════
   HOVER COMPONENTS
══════════════════════════════════════ */

/**
 * HoverCard — 各カード・リストアイテムをホバーでリフト＆グロー
 * color: アクセントカラー  style: 追加スタイル
 */
function HoverCard({ children, color, style={}, onClick }) {
  const [hov, setHov] = useState(false);
  const c = color || BL;
  return (
    <div
      onMouseEnter={() => { setHov(true); sfxHover(); }}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? "pointer" : "default",
        transform: hov ? "translateY(-3px) scale(1.012)" : "translateY(0) scale(1)",
        boxShadow: hov
          ? `0 8px 32px ${c}30, 0 0 0 1px ${c}50, inset 0 0 20px ${c}08`
          : style.boxShadow || "none",
        filter: hov ? `brightness(1.12)` : "brightness(1)",
        transition: "transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s, filter .18s, border-color .18s",
      }}
    >
      {/* scan line sweep on hover */}
      {hov && (
        <div style={{
          position:"absolute",inset:0,pointerEvents:"none",borderRadius:"inherit",
          background:`linear-gradient(180deg,transparent 0%,${c}10 50%,transparent 100%)`,
          backgroundSize:"100% 200%",
          animation:"scanSweep .4s ease-out forwards",
          zIndex:1,
        }}/>
      )}
      <div style={{position:"relative",zIndex:2}}>{children}</div>
    </div>
  );
}

/**
 * HoverBullet — 箇条書き1行をホバーで光らせる
 */
function HoverBullet({ children, color, style={} }) {
  const [hov, setHov] = useState(false);
  const c = color || BL;
  return (
    <div
      onMouseEnter={() => { setHov(true); sfxHover(); }}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        transform: hov ? "translateX(6px)" : "translateX(0)",
        transition: "transform .18s cubic-bezier(.34,1.56,.64,1), filter .15s",
        filter: hov ? `drop-shadow(0 0 4px ${c}80)` : "none",
        cursor: "default",
      }}
    >
      {/* Glow accent bar */}
      <div style={{
        position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",
        width: hov ? "3px" : "0px",height:"60%",
        background:c,borderRadius:2,
        transition:"width .15s",
        boxShadow:`0 0 6px ${c}`,
      }}/>
      <div style={{
        paddingLeft: hov ? "8px" : "0px",
        transition:"padding .18s",
        color: hov ? "#f1f5f9" : undefined,
      }}>
        {children}
      </div>
    </div>
  );
}

/**
 * HoverTag — タグチップのホバーエフェクト
 */
function HoverTag({ children, color, style={} }) {
  const [hov, setHov] = useState(false);
  const c = color || BL;
  return (
    <span
      onMouseEnter={() => { setHov(true); sfxHover(); }}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        display:"inline-flex",alignItems:"center",
        transform: hov ? "scale(1.08) translateY(-1px)" : "scale(1)",
        boxShadow: hov ? `0 0 12px ${c}60, 0 0 0 1px ${c}` : "none",
        background: hov ? `${c}20` : (style.background || "transparent"),
        color: hov ? c : (style.color || `${c}70`),
        borderColor: hov ? c : `${c}30`,
        transition:"all .18s cubic-bezier(.34,1.56,.64,1)",
        cursor:"default",
      }}
    >
      {children}
    </span>
  );
}

/**
 * HoverStep — フロー図のステップカード
 */
function HoverStep({ children, color, style={} }) {
  const [hov, setHov] = useState(false);
  const c = color || BL;
  return (
    <div
      onMouseEnter={() => { setHov(true); sfxHover(); }}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        transform: hov ? "translateY(-4px) scale(1.04)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 6px 24px ${c}40, 0 0 0 1px ${c}60` : "none",
        background: hov ? `${c}14` : (style.background || `${c}08`),
        transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Background ─── */
function BgCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const dots = Array.from({length:50},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r:Math.random()*1.5+.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      for (let i=0;i<dots.length;i++) for (let j=i+1;j<dots.length;j++) {
        const dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<130) {
          ctx.strokeStyle=`rgba(14,165,233,${(1-dist/130)*0.12})`;
          ctx.lineWidth=.5; ctx.beginPath();
          ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y); ctx.stroke();
        }
      }
      dots.forEach(d=>{
        ctx.fillStyle="rgba(14,165,233,0.35)";
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        d.x+=d.vx; d.y+=d.vy;
        if(d.x<0||d.x>W) d.vx*=-1;
        if(d.y<0||d.y>H) d.vy*=-1;
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const onResize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;};
    window.addEventListener("resize",onResize);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.6}}/>;
}

/* ─── Section label ─── */
function SLabel({children,color}){
  return (
    <div style={{fontFamily:C,color:color||`rgba(14,165,233,.45)`,fontSize:"clamp(.6rem,2vw,.72rem)",
      letterSpacing:".2em",marginBottom:"clamp(.6rem,2.5vw,1rem)",display:"flex",alignItems:"center",gap:".6rem"}}>
      <span>{children}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,rgba(14,165,233,.2),transparent)`}}/>
    </div>
  );
}

/* ─── Progress dots ─── */
function ProgressDots({cur,total}){
  return (
    <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{width:i<cur?16:5,height:3,
          background:i<cur?BL:"rgba(14,165,233,.15)",
          boxShadow:i<cur?`0 0 4px rgba(14,165,233,.5)`:"none",
          transition:"all .3s",borderRadius:2}}/>
      ))}
    </div>
  );
}

/* ─── Shell ─── */
function Shell({children}){
  return (
    <div style={{height:"100%",overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",boxSizing:"border-box"}}>
      <div style={{minHeight:"100%",padding:"clamp(1.2rem,4vw,2rem) clamp(1.2rem,5vw,4vw)",
        display:"flex",flexDirection:"column",justifyContent:"center",boxSizing:"border-box",
        maxWidth:"900px",margin:"0 auto",width:"100%"}}>
        {children}
      </div>
    </div>
  );
}

/* ─── Glitch text ─── */
function Glitch({children,style={}}){
  return (
    <span style={{position:"relative",display:"inline-block",...style}}>
      <span style={{position:"relative"}}>{children}</span>
      <span aria-hidden style={{position:"absolute",top:0,left:"-2px",color:CY,opacity:.7,
        animation:"gl1 2.5s steps(2,end) infinite",pointerEvents:"none"}}>{children}</span>
      <span aria-hidden style={{position:"absolute",top:0,left:"2px",color:AM,opacity:.5,
        animation:"gl2 3s steps(2,end) infinite 0.5s",pointerEvents:"none"}}>{children}</span>
    </span>
  );
}

/* ══════════════════════════
   THREE.JS: CRM NODE NETWORK
══════════════════════════ */
function CRMNetwork3D(){
  const mountRef = useRef(null);
  useEffect(()=>{
    const el = mountRef.current; if (!el) return;
    const W=el.clientWidth, H=el.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030810);
    const camera = new THREE.PerspectiveCamera(50,W/H,0.1,200);
    camera.position.set(0,4,14); camera.lookAt(0,0,0);
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(W,H); el.appendChild(renderer.domElement);
    scene.fog = new THREE.FogExp2(0x030810, 0.025);
    scene.add(new THREE.AmbientLight(0xffffff,0.3));
    const pt1=new THREE.PointLight(0x0ea5e9,4,20); pt1.position.set(0,5,0); scene.add(pt1);
    const pt2=new THREE.PointLight(0x06b6d4,2,15); pt2.position.set(-4,-2,4); scene.add(pt2);
    const pt3=new THREE.PointLight(0xf59e0b,2,15); pt3.position.set(4,3,-4); scene.add(pt3);
    const nodeData = [
      {label:"POS",  pos:[0,0,0],    color:0x0ea5e9, r:0.6},
      {label:"EC",   pos:[-4,-1,1],  color:0x06b6d4, r:0.5},
      {label:"決済", pos:[4,-1,1],   color:0x06b6d4, r:0.5},
      {label:"POINTQUIC",pos:[0,3,0],color:0xf59e0b, r:0.9},
      {label:"LINE", pos:[-4,5,0],   color:0x10b981, r:0.55},
      {label:"CRM",  pos:[4,5,0],    color:0x8b5cf6, r:0.55},
      {label:"顧客A",pos:[-6,2,-2],  color:0xf59e0b, r:0.3},
      {label:"顧客B",pos:[6,2,-2],   color:0xf59e0b, r:0.3},
      {label:"顧客C",pos:[0,1,-4],   color:0xf59e0b, r:0.3},
    ];
    const edges=[[0,3],[1,3],[2,3],[3,4],[3,5],[4,6],[5,7],[3,8]];
    const nodeMeshes=[];
    nodeData.forEach(nd=>{
      const geo=new THREE.SphereGeometry(nd.r,24,24);
      const mat=new THREE.MeshPhongMaterial({color:nd.color,emissive:nd.color,emissiveIntensity:.4,
        transparent:true,opacity:.9,shininess:80});
      const mesh=new THREE.Mesh(geo,mat);
      mesh.position.set(...nd.pos);
      scene.add(mesh);
      nodeMeshes.push(mesh);
      const rGeo=new THREE.RingGeometry(nd.r+0.05,nd.r+0.12,32);
      const rMat=new THREE.MeshBasicMaterial({color:nd.color,transparent:true,opacity:.3,side:THREE.DoubleSide});
      const ring=new THREE.Mesh(rGeo,rMat);
      ring.lookAt(camera.position);
      mesh.add(ring);
    });
    edges.forEach(([a,b])=>{
      const pa=new THREE.Vector3(...nodeData[a].pos);
      const pb=new THREE.Vector3(...nodeData[b].pos);
      const mid=pa.clone().lerp(pb,.5).addScalar(.3);
      const curve=new THREE.QuadraticBezierCurve3(pa,mid,pb);
      const geo=new THREE.TubeGeometry(curve,20,0.02,8,false);
      const mat=new THREE.MeshBasicMaterial({color:0x0ea5e9,transparent:true,opacity:.25});
      scene.add(new THREE.Mesh(geo,mat));
    });
    const particleCount=60;
    const pPositions=new Float32Array(particleCount*3);
    const pGeo=new THREE.BufferGeometry();
    pGeo.setAttribute("position",new THREE.BufferAttribute(pPositions,3));
    const pMat=new THREE.PointsMaterial({color:0x0ea5e9,size:.18,transparent:true,opacity:.9,
      blending:THREE.AdditiveBlending,depthWrite:false});
    scene.add(new THREE.Points(pGeo,pMat));
    const flowState=Array.from({length:particleCount},(_,i)=>({edge:i%edges.length,t:Math.random()}));
    const grid=new THREE.GridHelper(20,20,0x0ea5e920,0x0ea5e910);
    grid.position.y=-2; scene.add(grid);
    let raf; const clock=new THREE.Clock();
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const elapsed=clock.getElapsedTime();
      scene.rotation.y=elapsed*.12;
      nodeMeshes.forEach((m,i)=>{
        m.scale.setScalar(1+0.08*Math.sin(elapsed*2+i*1.2));
        m.children.forEach(r=>r.lookAt(camera.position));
      });
      flowState.forEach((state,i)=>{
        state.t+=0.008;
        if(state.t>=1){state.t=0;state.edge=Math.floor(Math.random()*edges.length);}
        const [a,b]=edges[state.edge];
        const pa=new THREE.Vector3(...nodeData[a].pos);
        const pb=new THREE.Vector3(...nodeData[b].pos);
        const mid=pa.clone().lerp(pb,.5).addScalar(.3);
        const curve=new THREE.QuadraticBezierCurve3(pa,mid,pb);
        const pt=curve.getPoint(state.t);
        pPositions[i*3]=pt.x;pPositions[i*3+1]=pt.y;pPositions[i*3+2]=pt.z;
      });
      pGeo.attributes.position.needsUpdate=true;
      pt1.intensity=3+1.5*Math.sin(elapsed*2);
      renderer.render(scene,camera);
    };
    animate();
    let dragging=false,lastMX=0;
    renderer.domElement.addEventListener("mousedown",e=>{dragging=true;lastMX=e.clientX;});
    window.addEventListener("mouseup",()=>{dragging=false;});
    window.addEventListener("mousemove",e=>{
      if(!dragging)return;
      scene.rotation.y+=(e.clientX-lastMX)*0.006;lastMX=e.clientX;
    });
    let lastTX=null;
    renderer.domElement.addEventListener("touchmove",e=>{
      if(lastTX===null){lastTX=e.touches[0].clientX;return;}
      scene.rotation.y+=(e.touches[0].clientX-lastTX)*0.008;lastTX=e.touches[0].clientX;
    },{passive:true});
    renderer.domElement.addEventListener("touchend",()=>{lastTX=null;});
    return ()=>{cancelAnimationFrame(raf);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
  },[]);
  return (
    <div style={{position:"relative",width:"100%"}}>
      <div ref={mountRef} style={{width:"100%",height:"clamp(200px,45vw,320px)",background:"#030810",borderRadius:4}}/>
      <div style={{position:"absolute",bottom:8,right:10,fontFamily:C,fontSize:"clamp(.5rem,1.8vw,.6rem)",color:"rgba(14,165,233,.35)"}}>ドラッグで回転</div>
      <div style={{position:"absolute",top:8,left:10,fontFamily:C,fontSize:"clamp(.5rem,1.8vw,.6rem)",color:"rgba(14,165,233,.5)",lineHeight:1.8}}>
        {[["■",BL,"POS/EC/決済"],["■",AM,"POINTQUIC"],["■",GN,"LINE連携"],["■","#8b5cf6","CRM"]].map(([s,c,l])=>(
          <div key={l} style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{color:c}}>{s}</span><span style={{color:"rgba(148,163,184,.6)"}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════
   SLIDES
══════════════ */

/* S0: BOOT */
function S0_Boot(){
  const [ph,setPh]=useState(0);
  useEffect(()=>{
    sfxBoot();
    const t1=setTimeout(()=>setPh(1),600);
    const t2=setTimeout(()=>setPh(2),1500);
    const t3=setTimeout(()=>setPh(3),2600);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <Shell>
      <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:"clamp(1.2rem,4vw,2rem)"}}>
        <div style={{opacity:ph>=1?1:0,transition:"opacity .8s",fontFamily:C,color:`rgba(14,165,233,.5)`,fontSize:"clamp(.7rem,2.5vw,.85rem)",letterSpacing:".3em"}}>
          POINTQUIC / 株式会社キーラボ
        </div>
        <div style={{opacity:ph>=2?1:0,transition:"opacity 1s",transform:ph>=2?"translateY(0)":"translateY(24px)"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:"clamp(1.8rem,7vw,4.2rem)",lineHeight:1.1,letterSpacing:"-.02em",color:"#f1f5f9"}}>
            <span style={{display:"block",color:"rgba(241,245,249,.4)",fontSize:"clamp(.8rem,2.5vw,.95rem)",fontWeight:400,fontFamily:C,letterSpacing:".2em",marginBottom:".5rem"}}>DATA-DRIVEN CRM</span>
            取引データで、<br/>
            <span style={{color:BL}}>売上を自動で回す</span><br/>
            時代へ。
          </div>
        </div>
        <div style={{opacity:ph>=3?1:0,transition:"opacity .8s",maxWidth:420,fontFamily:F,fontSize:"clamp(.85rem,3vw,1rem)",color:"#64748b",lineHeight:1.8}}>
          今日は、<span style={{color:AM,fontWeight:700}}>3つの確認</span>から始めます。
        </div>
        {ph>=3&&(
          <div style={{fontFamily:C,color:"rgba(100,116,139,.35)",fontSize:"clamp(.65rem,2.5vw,.78rem)",display:"flex",alignItems:"center",gap:".6rem"}}>
            <span style={{animation:"blink 1.5s step-end infinite"}}>▶</span>
            スワイプまたは NEXT をタップ
          </div>
        )}
      </div>
    </Shell>
  );
}

/* S1: PURPOSE */
function S1_Purpose(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const items=[
    {num:"01",icon:"🤝",title:"長期利用への感謝",sub:"これまでのご利用実績について",color:BL},
    {num:"02",icon:"⚠️",title:"無料利用終了の背景",sub:"サービス提供方針変更の経緯",color:AM},
    {num:"03",icon:"🚀",title:"サブスク移行のメリット",sub:"貴社・会員様双方への価値確認",color:GN},
  ];
  return (
    <Shell>
      <SLabel>AGENDA / 本日の目的</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.4rem,5vw,2.2rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.2,margin:"0 0 clamp(1rem,4vw,1.8rem)"}}>
        今日、確認したいことは<br/><span style={{color:BL}}>3つ</span>です
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {items.map((it,i)=>(
          <HoverCard key={i} color={it.color} style={{
            position:"relative",overflow:"hidden",
            padding:"clamp(.8rem,3vw,1.1rem) clamp(.9rem,3.5vw,1.3rem)",
            border:`1px solid ${it.color}30`,background:`${it.color}08`,
            borderRadius:4,borderLeft:`3px solid ${it.color}`,
            display:"flex",alignItems:"center",gap:"1rem",
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-20px)",
            transition:`opacity .5s ${i*0.12}s, transform .5s ${i*0.12}s`,
          }}>
            <div style={{fontFamily:C,color:`${it.color}60`,fontSize:"clamp(.9rem,3vw,1.1rem)",minWidth:28}}>{it.num}</div>
            <div style={{fontSize:"1.3rem"}}>{it.icon}</div>
            <div>
              <div style={{fontFamily:F,fontWeight:700,color:"#e2e8f0",fontSize:"clamp(.9rem,3.2vw,1rem)"}}>{it.title}</div>
              <div style={{fontFamily:F,color:"#64748b",fontSize:"clamp(.72rem,2.5vw,.82rem)",marginTop:2}}>{it.sub}</div>
            </div>
          </HoverCard>
        ))}
      </div>
    </Shell>
  );
}

/* S2: CHANGE */
function S2_Change(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  return (
    <Shell>
      <SLabel color={`${AM}80`}>SERVICE UPDATE / 方針変更</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.3rem,4.5vw,2rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.3,margin:"0 0 clamp(.8rem,3vw,1.5rem)"}}>
        サービスの現状と<br/><span style={{color:AM}}>提供方針の変更点</span>
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12,opacity:vis?1:0,transition:"opacity .6s"}}>
        {[
          {title:"プロダクトの進化",color:BL,items:[
            "LINE連携デジタル会員証が基本プランへ",
            "スマホ利用前提の設計へ完全移行",
            "今後の開発・改善はLINE連携版のみ",
          ]},
          {title:"契約形態の変更",color:RD,items:[
            "無料プランでの提供を終了",
            "有料プランへ一本化（サブスク必須）",
            "安定運用・品質保証のため",
          ]},
        ].map((col,ci)=>(
          <div key={ci} style={{padding:"clamp(.8rem,3vw,1rem)",border:`1px solid ${col.color}30`,background:`${col.color}08`,borderRadius:4,borderTop:`2px solid ${col.color}`}}>
            <div style={{fontFamily:C,color:`${col.color}80`,fontSize:"clamp(.58rem,1.8vw,.65rem)",letterSpacing:".12em",marginBottom:8}}>{col.title}</div>
            {col.items.map((it,i)=>(
              <HoverBullet key={i} color={col.color} style={{position:"relative",display:"flex",gap:6,marginBottom:5,alignItems:"flex-start",paddingLeft:4}}>
                <span style={{color:`${col.color}80`,marginTop:2,flexShrink:0,transition:"color .15s"}}>•</span>
                <span style={{fontFamily:F,fontSize:"clamp(.7rem,2.5vw,.8rem)",color:"#94a3b8",lineHeight:1.5,transition:"color .15s"}}>{it}</span>
              </HoverBullet>
            ))}
          </div>
        ))}
      </div>

      <HoverCard color={AM} style={{position:"relative",overflow:"hidden",padding:"clamp(.8rem,3vw,1rem)",border:`1px solid ${AM}40`,background:`${AM}08`,borderRadius:4,opacity:vis?1:0,transition:"opacity .6s .3s"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{fontSize:"1.2rem",flexShrink:0}}>📋</div>
          <div>
            <div style={{fontFamily:F,fontWeight:700,color:AM,fontSize:"clamp(.85rem,3vw,.95rem)",marginBottom:4}}>サブスク契約への移行が必須</div>
            <div style={{fontFamily:F,color:"#94a3b8",fontSize:"clamp(.72rem,2.5vw,.82rem)",lineHeight:1.6}}>
              安定的なサービス継続利用には、サブスクリプション契約への切り替えが必要です。移行後はサポート・保守の対象となり、安定運用を保証します。
            </div>
          </div>
        </div>
      </HoverCard>
    </Shell>
  );
}

/* S3: MARKET */
function S3_Market(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  return (
    <Shell>
      <SLabel>MARKET TREND / 市場動向</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.3rem,4.5vw,2rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.3,margin:"0 0 clamp(.8rem,3vw,1.5rem)"}}>
        会員証の<span style={{color:BL}}>スマホ表示</span>が<br/>業界標準になっています
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {icon:"📱",label:"STANDARD",title:"新しいスタンダード",items:["LINEで即時発行","アプリ不要・入力不要","カード忘れ・紛失ゼロ"],color:BL},
          {icon:"⚠️",label:"RISK",title:"カード継続のリスク",items:["新規会員化が停滞","既存会員の離脱","他店デジタルへ流出"],color:RD},
        ].map((col,ci)=>(
          <HoverCard key={ci} color={col.color} style={{
            position:"relative",overflow:"hidden",
            padding:"clamp(.8rem,3vw,1rem)",border:`1px solid ${col.color}25`,background:`${col.color}07`,borderRadius:4,
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",
            transition:`opacity .5s ${ci*0.15}s, transform .5s ${ci*0.15}s`,
          }}>
            <div style={{fontSize:"1.5rem",marginBottom:4}}>{col.icon}</div>
            <div style={{fontFamily:C,color:`${col.color}70`,fontSize:"clamp(.55rem,1.8vw,.62rem)",letterSpacing:".15em",marginBottom:6}}>{col.label}</div>
            <div style={{fontFamily:F,fontWeight:700,color:"#e2e8f0",fontSize:"clamp(.82rem,3vw,.9rem)",marginBottom:8}}>{col.title}</div>
            {col.items.map((it,i)=>(
              <HoverBullet key={i} color={col.color} style={{position:"relative",display:"flex",gap:5,marginBottom:4,alignItems:"center"}}>
                <span style={{color:`${col.color}70`,fontSize:".7rem",transition:"color .15s"}}>→</span>
                <span style={{fontFamily:F,fontSize:"clamp(.68rem,2.3vw,.78rem)",color:"#94a3b8",transition:"color .15s"}}>{it}</span>
              </HoverBullet>
            ))}
          </HoverCard>
        ))}
      </div>

      <HoverCard color={GN} style={{position:"relative",overflow:"hidden",padding:"clamp(.7rem,2.5vw,.9rem)",border:`1px solid ${GN}30`,background:`${GN}08`,borderRadius:4,opacity:vis?1:0,transition:"opacity .6s .4s"}}>
        <div style={{fontFamily:F,fontWeight:700,color:GN,fontSize:"clamp(.8rem,2.8vw,.88rem)",marginBottom:3}}>🎯 目指すゴール</div>
        <div style={{fontFamily:F,color:"#94a3b8",fontSize:"clamp(.7rem,2.3vw,.8rem)",lineHeight:1.6}}>
          「選ばれ続ける会員基盤」の構築 ― 会員離脱防止 × 運用負担削減 × 単一プラットフォームへの機能統合
        </div>
      </HoverCard>
    </Shell>
  );
}

/* S4: PLATFORM */
function S4_Platform(){
  return (
    <Shell>
      <SLabel>PLATFORM / POINTQUICの全体像</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.8rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.3,margin:"0 0 .6rem"}}>
        取引データを<span style={{color:AM}}>自動でCRMに変換</span>する<br/>プラットフォーム
      </h2>
      <p style={{fontFamily:F,color:"#64748b",fontSize:"clamp(.72rem,2.5vw,.82rem)",lineHeight:1.7,margin:"0 0 .8rem"}}>
        POS・EC・決済から取引データを自動取得し、LINE/LIFF会員証に顧客を統合。セグメント・ランク・自動配信などのCRM施策を現場オペレーションを増やさず実行できます。
      </p>
      <CRMNetwork3D/>
      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
        {["タブレット運用基本不要","POS自動連携","EC自動連携","会員証はLIFFアプリ","NFC対応"].map(t=>(
          <HoverTag key={t} color={BL} style={{fontFamily:C,fontSize:"clamp(.55rem,1.8vw,.65rem)",padding:"3px 8px",border:`1px solid ${BL}30`,borderRadius:2}}>
            {t}
          </HoverTag>
        ))}
      </div>
    </Shell>
  );
}

/* S5: BENEFITS */
function S5_Benefits(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const items=[
    {num:"01",icon:"📱",badge:"会員登録率向上",title:"LINE連携でカードレス運用",points:["友達追加で即時発行","入力不要・アプリ不要","カード忘れ・紛失ゼロ"],color:GN},
    {num:"02",icon:"📢",badge:"来店促進自動化",title:"クーポン配信を仕組み化",points:["誕生日クーポン自動配信","属性・行動別の出し分け","運用負担なく販促継続"],color:BL},
    {num:"03",icon:"🔗",badge:"顧客データ統合",title:"ECサイト連携でポイント統合",points:["ECでポイント利用・発行","実店舗と共通化","オンラインと店舗を一元化"],color:CY},
    {num:"04",icon:"⚡",badge:"業務効率化",title:"POS連携で自動ポイント処理",points:["POS入力だけで付与完了","レジ操作と完全一体化","オペレーションミス減少"],color:AM},
    {num:"05",icon:"💰",badge:"リピート率向上",title:"独自電子マネーで専用決済基盤",points:["店舗専用デポジット構築","ポイントと併用運用","独自経済圏で囲い込み"],color:"#8b5cf6"},
  ];
  return (
    <Shell>
      <SLabel>BENEFITS / サブスク化のメリット</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.8rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.2,margin:"0 0 clamp(.8rem,3vw,1.4rem)"}}>
        貴社・会員様双方への<br/><span style={{color:BL}}>5つの導入メリット</span>
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {items.map((it,i)=>(
          <HoverCard key={i} color={it.color} style={{
            position:"relative",overflow:"hidden",
            display:"flex",gap:10,padding:"clamp(.7rem,2.5vw,1rem)",
            border:`1px solid ${it.color}25`,background:`${it.color}07`,
            borderRadius:4,borderLeft:`3px solid ${it.color}`,
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-16px)",
            transition:`opacity .4s ${i*.08}s, transform .4s ${i*.08}s`,
          }}>
            <div style={{flexShrink:0,textAlign:"center"}}>
              <div style={{fontFamily:C,color:`${it.color}50`,fontSize:".65rem",marginBottom:2}}>{it.num}</div>
              <div style={{fontSize:"1.3rem"}}>{it.icon}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:C,fontSize:"clamp(.52rem,1.7vw,.6rem)",color:`${it.color}70`,letterSpacing:".1em",marginBottom:2}}>{it.badge}</div>
              <div style={{fontFamily:F,fontWeight:700,color:"#e2e8f0",fontSize:"clamp(.82rem,3vw,.92rem)",marginBottom:5}}>{it.title}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px"}}>
                {it.points.map(p=>(
                  <HoverTag key={p} color={it.color} style={{fontFamily:F,fontSize:"clamp(.65rem,2.2vw,.74rem)",color:"#64748b",border:"none",padding:"1px 0",borderRadius:0,gap:3}}>
                    <span style={{color:`${it.color}60`,fontSize:".7rem"}}>✓</span>{p}
                  </HoverTag>
                ))}
              </div>
            </div>
          </HoverCard>
        ))}
      </div>
    </Shell>
  );
}

/* S6: HOW IT WORKS */
function S6_HowItWorks(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const steps=[
    {n:"1",who:"お客様",icon:"👤",action:"スマホ会員証（QR）提示"},
    {n:"2",who:"店舗スタッフ様",icon:"📱",action:"iPadでのQRコード読取"},
    {n:"3",who:"システム",icon:"✅",action:"ポイント付与・情報更新完了"},
  ];
  const features=[
    {icon:"📲",t:"会員証のLINE連携・スマホ表示",d:"スマホが会員証。カード発行・在庫管理不要。"},
    {icon:"🗂",t:"会員情報の自動紐づけ・管理",d:"LINE連携で自動登録。手入力の手間・ミス排除。"},
    {icon:"📈",t:"長期安定運用の拡張性",d:"会員増でも操作性維持。大規模運用時も安定。"},
  ];
  return (
    <Shell>
      <SLabel>HOW IT WORKS / 基本機能と運用イメージ</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.1rem,3.8vw,1.7rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.3,margin:"0 0 clamp(.7rem,2.5vw,1.2rem)"}}>
        シンプルな運用で<br/><span style={{color:BL}}>CRMが自動で回る</span>
      </h2>

      {/* Flow steps */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,opacity:vis?1:0,transition:"opacity .6s"}}>
        {steps.map((st,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:1,gap:6}}>
            <HoverStep color={BL} style={{
              flex:1,padding:"clamp(.5rem,2vw,.8rem)",
              border:`1px solid ${BL}30`,borderRadius:4,textAlign:"center",
            }}>
              <div style={{fontFamily:C,color:`${BL}60`,fontSize:"clamp(.5rem,1.7vw,.6rem)",marginBottom:3}}>{st.who}</div>
              <div style={{fontSize:"1.2rem",marginBottom:2}}>{st.icon}</div>
              <div style={{fontFamily:F,fontSize:"clamp(.62rem,2vw,.72rem)",color:"#94a3b8",lineHeight:1.4}}>{st.action}</div>
            </HoverStep>
            {i<steps.length-1&&<div style={{color:`${BL}50`,fontSize:"1rem",flexShrink:0}}>→</div>}
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {features.map((f,i)=>(
          <HoverCard key={i} color={BL} style={{
            position:"relative",overflow:"hidden",
            display:"flex",gap:10,padding:"clamp(.6rem,2vw,.85rem)",
            border:`1px solid rgba(14,165,233,.15)`,background:"rgba(14,165,233,.04)",borderRadius:4,
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",
            transition:`opacity .4s ${i*.1}s, transform .4s ${i*.1}s`,
          }}>
            <div style={{fontSize:"1.3rem",flexShrink:0}}>{f.icon}</div>
            <div>
              <div style={{fontFamily:F,fontWeight:700,color:"#e2e8f0",fontSize:"clamp(.8rem,2.8vw,.9rem)",marginBottom:2}}>{f.t}</div>
              <div style={{fontFamily:F,color:"#64748b",fontSize:"clamp(.68rem,2.3vw,.78rem)",lineHeight:1.5}}>{f.d}</div>
            </div>
          </HoverCard>
        ))}
      </div>
    </Shell>
  );
}

/* S7: PRICING */
function S7_Pricing(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  return (
    <Shell>
      <SLabel color={`${AM}80`}>PRICING / 料金プラン</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.8rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.2,margin:"0 0 clamp(.8rem,3vw,1.4rem)"}}>
        サブスク移行時の<br/><span style={{color:AM}}>費用概要</span>
      </h2>

      <HoverCard color={RD} style={{position:"relative",overflow:"hidden",padding:"clamp(.6rem,2vw,.8rem)",border:`1px solid ${RD}40`,background:`${RD}08`,borderRadius:4,marginBottom:12,display:"flex",gap:8,alignItems:"center",opacity:vis?1:0,transition:"opacity .5s"}}>
        <span style={{fontSize:"1.1rem"}}>🔴</span>
        <div style={{fontFamily:F,fontSize:"clamp(.72rem,2.5vw,.82rem)",color:`${RD}90`}}>
          <strong>重要：</strong>無料プラン終了 → サブスク契約への移行が必須
        </div>
      </HoverCard>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"単体機能",price:"15",unit:"万円",sub:"（税別）",highlight:false,color:BL,
            features:["LINE会員証","専用アプリ","ICタッチ","POS/EC連携"],tag:null},
          {label:"パッケージ",price:"20",unit:"万円",sub:"（税別）",highlight:true,color:AM,
            features:["複数機能を統合","5万で全機能追加","トータルコスト削減","統合的な運用が可能"],tag:"おすすめ"},
          {label:"月額費用",price:"6,000",unit:"円〜",sub:"（税別）",highlight:false,color:BL,
            features:["会員数に応じた従量課金","スモールスタート可能","〜1,000人：月6,000円"],tag:null},
        ].map((p,i)=>(
          <HoverCard key={i} color={p.color} style={{
            position:"relative",overflow:"hidden",
            padding:"clamp(.7rem,2.5vw,1rem)",borderRadius:4,
            border:`1px solid ${p.highlight?AM:BL}${p.highlight?"60":"25"}`,
            background:p.highlight?`${AM}10`:`${BL}05`,
            boxShadow:p.highlight?`0 0 20px ${AM}25`:"none",
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(14px)",
            transition:`opacity .4s ${i*.1}s, transform .4s ${i*.1}s`,
          }}>
            {p.tag&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:AM,color:"#000",fontFamily:F,fontWeight:700,fontSize:"clamp(.55rem,1.8vw,.65rem)",padding:"2px 8px",borderRadius:2}}>{p.tag}</div>}
            <div style={{fontFamily:C,color:`${p.highlight?AM:BL}80`,fontSize:"clamp(.52rem,1.7vw,.6rem)",letterSpacing:".1em",marginBottom:4}}>初期費用</div>
            <div style={{fontFamily:F,fontWeight:800,color:p.highlight?AM:"#e2e8f0",fontSize:"clamp(1.4rem,4.5vw,1.8rem)",lineHeight:1}}>
              {p.price}<span style={{fontSize:"clamp(.65rem,2vw,.75rem)",fontWeight:400}}>{p.unit}</span>
            </div>
            <div style={{fontFamily:F,color:"#475569",fontSize:"clamp(.6rem,2vw,.68rem)",marginBottom:8}}>{p.sub}</div>
            {p.features.map(f=>(
              <HoverBullet key={f} color={p.color} style={{position:"relative",display:"flex",gap:4,marginBottom:3,alignItems:"flex-start",paddingLeft:4}}>
                <span style={{color:`${p.highlight?AM:BL}60`,fontSize:".65rem",marginTop:2,transition:"color .15s"}}>✓</span>
                <span style={{fontFamily:F,fontSize:"clamp(.62rem,2vw,.72rem)",color:"#64748b",lineHeight:1.4,transition:"color .15s"}}>{f}</span>
              </HoverBullet>
            ))}
          </HoverCard>
        ))}
      </div>

      <HoverCard color={GN} style={{position:"relative",overflow:"hidden",padding:"clamp(.7rem,2.5vw,.9rem)",border:`1px solid ${GN}30`,background:`${GN}08`,borderRadius:4,opacity:vis?1:0,transition:"opacity .5s .4s"}}>
        <div style={{fontFamily:F,fontSize:"clamp(.7rem,2.5vw,.8rem)",color:`${GN}90`,lineHeight:1.7}}>
          💡 スモールスタートが可能。会員規模に応じた詳細なプランをご用意しています。
        </div>
      </HoverCard>
    </Shell>
  );
}

/* S8: CASES */
function S8_Cases(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100);},[]);
  const voices=[
    {type:"会員様（エンドユーザー）の声",badge:"利便性向上",color:BL,quote:"お財布から会員証を探す手間がなく、スマホでサッと表示可能"},
    {type:"店舗様（オーナー）の声",badge:"集客効果",color:AM,quote:"クーポン配信の自動化により、お客様の来店頻度が向上"},
  ];
  const industries=[
    {icon:"💆",label:"整骨院・サロン",sub:"リピート促進・予約連携"},
    {icon:"👕",label:"アパレル・小売",sub:"会員ランク・セール告知"},
    {icon:"🍱",label:"食品・飲食系",sub:"ポイント付与・テイクアウト"},
  ];
  const enterprises=["ヤフー株式会社","アディダス ジャパン（株）","NTT都市開発株式会社","NTTドコモ","東急不動産株式会社","ヤマハ発動機販売株式会社"];
  return (
    <Shell>
      <SLabel>CASES / 導入企業の声と業界例</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.8rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.2,margin:"0 0 clamp(.8rem,3vw,1.4rem)"}}>
        実績が証明する<span style={{color:BL}}>信頼</span>
      </h2>

      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {voices.map((v,i)=>(
          <HoverCard key={i} color={v.color} style={{
            position:"relative",overflow:"hidden",
            padding:"clamp(.8rem,3vw,1.1rem)",border:`1px solid ${v.color}25`,background:`${v.color}07`,borderRadius:4,
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-16px)",
            transition:`opacity .5s ${i*.12}s, transform .5s ${i*.12}s`,
          }}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:F,fontSize:"clamp(.68rem,2.3vw,.76rem)",color:"#64748b"}}>{v.type}</div>
              <span style={{fontFamily:C,fontSize:"clamp(.5rem,1.6vw,.58rem)",padding:"2px 6px",background:`${v.color}20`,color:v.color,borderRadius:2}}>{v.badge}</span>
            </div>
            <div style={{fontFamily:C,color:v.color,fontSize:"1.2rem",marginBottom:4}}>"</div>
            <div style={{fontFamily:F,color:"#cbd5e1",fontSize:"clamp(.8rem,2.8vw,.92rem)",lineHeight:1.6,fontStyle:"italic"}}>{v.quote}</div>
          </HoverCard>
        ))}
      </div>

      <div style={{padding:"clamp(.8rem,3vw,1rem)",border:`1px solid rgba(14,165,233,.15)`,background:"rgba(14,165,233,.04)",borderRadius:4,marginBottom:10,opacity:vis?1:0,transition:"opacity .5s .3s"}}>
        <div style={{fontFamily:C,fontSize:"clamp(.55rem,1.8vw,.62rem)",color:`${BL}60`,letterSpacing:".12em",marginBottom:8}}>移行実績のある業界例</div>
        <div style={{display:"flex",gap:8}}>
          {industries.map(ind=>(
            <HoverCard key={ind.label} color={BL} style={{
              position:"relative",overflow:"hidden",
              flex:1,padding:"clamp(.5rem,2vw,.7rem)",
              border:`1px solid rgba(14,165,233,.12)`,borderRadius:3,textAlign:"center",
            }}>
              <div style={{fontSize:"1.3rem",marginBottom:3}}>{ind.icon}</div>
              <div style={{fontFamily:F,fontWeight:700,color:"#e2e8f0",fontSize:"clamp(.68rem,2.3vw,.76rem)",marginBottom:2}}>{ind.label}</div>
              <div style={{fontFamily:F,color:"#64748b",fontSize:"clamp(.6rem,2vw,.68rem)"}}>{ind.sub}</div>
            </HoverCard>
          ))}
        </div>
      </div>

      <div style={{padding:"clamp(.6rem,2vw,.8rem)",border:`1px solid ${GN}25`,background:`${GN}06`,borderRadius:4,opacity:vis?1:0,transition:"opacity .5s .5s"}}>
        <div style={{fontFamily:C,fontSize:"clamp(.52rem,1.7vw,.6rem)",color:`${GN}70`,letterSpacing:".1em",marginBottom:6}}>主な導入企業</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px"}}>
          {enterprises.map(e=>(
            <HoverTag key={e} color={GN} style={{fontFamily:F,fontSize:"clamp(.62rem,2vw,.72rem)",padding:"1px 4px",border:"none",borderRadius:0}}>
              {e}
            </HoverTag>
          ))}
          <span style={{fontFamily:F,fontSize:"clamp(.62rem,2vw,.72rem)",color:`${BL}70`}}>etc.</span>
        </div>
      </div>
    </Shell>
  );
}

/* S9: QA */
function S9_QA(){
  const [open,setOpen]=useState(null);
  const [hovIdx,setHovIdx]=useState(null);
  const qas=[
    {q:"無料期間中に費用はかかりますか？",a:"無料期間中は費用は一切発生しません。クレジット登録は必要ですが、課金は翌月以降のご判断次第です。"},
    {q:"無料のまま使い続けることはできますか？",a:"申し訳ありませんが、無料利用の継続はできません。サポートや改善の対象外となりサービス品質を保証できないためです。"},
    {q:"月額費用はいくらですか？",a:"ユーザー1,000人まで月額6,000円（税別）。ユーザー数に応じた従量課金制です。詳細は管理画面でご案内します。"},
    {q:"既存カード会員の移行は大変ですか？",a:"既存カード会員様はそのまま残しつつ、新規会員様から順次LINE連携に切り替える形でスムーズに進められます。"},
    {q:"LINEアカウントがない場合は？",a:"弊社側で新規にアカウントを開設し、すぐに使える状態でお渡しします。管理画面へのログインだけご協力いただければ大丈夫です。"},
    {q:"サポート体制はどうなっていますか？",a:"月額費用の中にサポートが含まれており、24時間受付で対応しています。"},
  ];
  return (
    <Shell>
      <SLabel>Q&A / よくあるご質問</SLabel>
      <h2 style={{fontFamily:F,fontSize:"clamp(1.2rem,4vw,1.8rem)",fontWeight:800,color:"#f1f5f9",lineHeight:1.2,margin:"0 0 clamp(.8rem,3vw,1.4rem)"}}>
        確認事項と<span style={{color:BL}}>想定Q&A</span>
      </h2>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {qas.map((qa,i)=>(
          <div key={i}
            onMouseEnter={()=>{setHovIdx(i);sfxHover();}}
            onMouseLeave={()=>setHovIdx(null)}
            style={{
              border:`1px solid rgba(14,165,233,${open===i?.3:hovIdx===i?.25:.15})`,
              borderRadius:4,overflow:"hidden",
              background:`rgba(14,165,233,${open===i?.06:hovIdx===i?.045:.03})`,
              transform: hovIdx===i&&open!==i ? "translateX(4px)" : "translateX(0)",
              boxShadow: hovIdx===i ? `0 4px 16px rgba(14,165,233,.2), 0 0 0 1px rgba(14,165,233,.3)` : "none",
              transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
            }}>
            <button onClick={()=>{setOpen(open===i?null:i);sfxClick();}} style={{
              width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",
              padding:"clamp(.7rem,2.5vw,.9rem)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              {/* Animated indicator bar */}
              <div style={{
                width:hovIdx===i||open===i?3:0,height:"1.2em",background:BL,borderRadius:2,
                marginRight:hovIdx===i||open===i?6:0,flexShrink:0,
                boxShadow:`0 0 6px ${BL}`,
                transition:"width .15s, margin .15s",
              }}/>
              <span style={{fontFamily:F,fontWeight:600,color:hovIdx===i?"#f1f5f9":"#e2e8f0",fontSize:"clamp(.78rem,2.8vw,.88rem)",lineHeight:1.4,flex:1,transition:"color .15s"}}>Q. {qa.q}</span>
              <span style={{color:BL,fontFamily:C,fontSize:"1rem",flexShrink:0,
                transform:open===i?"rotate(45deg)":"rotate(0)",transition:"transform .2s"}}>+</span>
            </button>
            {open===i&&(
              <div style={{padding:"0 clamp(.7rem,2.5vw,.9rem) clamp(.7rem,2.5vw,.9rem)",fontFamily:F,color:"#94a3b8",fontSize:"clamp(.72rem,2.5vw,.82rem)",lineHeight:1.7,borderTop:`1px solid rgba(14,165,233,.15)`}}>
                A. {qa.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}

/* S10: END */
function S10_End(){
  const [ph,setPh]=useState(0);
  useEffect(()=>{
    sfxChime();
    const t1=setTimeout(()=>setPh(1),500);
    const t2=setTimeout(()=>setPh(2),1200);
    const t3=setTimeout(()=>setPh(3),2100);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <Shell>
      <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:"clamp(1.2rem,4vw,2rem)"}}>
        <div style={{opacity:ph>=1?1:0,transition:"opacity .8s",fontFamily:C,color:`rgba(16,185,129,.5)`,fontSize:"clamp(.65rem,2.3vw,.78rem)",letterSpacing:".25em"}}>
          SESSION COMPLETE
        </div>
        <div style={{opacity:ph>=2?1:0,transition:"opacity 1s",transform:ph>=2?"translateY(0)":"translateY(20px)"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:"clamp(1.5rem,6vw,3.2rem)",color:"#f1f5f9",lineHeight:1.15,letterSpacing:"-.01em"}}>
            今日の商談で、<br/>
            <Glitch style={{color:BL}}>何か気付き</Glitch>は<br/>ありましたか？
          </div>
        </div>
        <div style={{opacity:ph>=3?1:0,transition:"opacity .8s",maxWidth:420}}>
          <div style={{fontFamily:F,color:"#64748b",fontSize:"clamp(.8rem,2.8vw,.95rem)",lineHeight:1.8,marginBottom:"1.2rem"}}>
            「取引データで売上を自動で回す」― その仕組みを、<br/>
            <span style={{color:AM,fontWeight:700}}>一緒に構築</span>しませんか。
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
            {[
              {icon:"🌐",label:"keylab.co.jp",sub:"公式サイト"},
              {icon:"🔗",label:"quic.jp",sub:"POINTQUICサービスサイト"},
            ].map(l=>(
              <HoverTag key={l.label} color={BL} style={{fontFamily:C,padding:"6px 16px",border:`1px solid rgba(14,165,233,.3)`,fontSize:"clamp(.68rem,2.3vw,.78rem)",borderRadius:2,letterSpacing:".05em"}}>
                {l.icon} {l.label} <span style={{opacity:.5,marginLeft:6}}>— {l.sub}</span>
              </HoverTag>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ══════════════════
   MAIN APP
══════════════════ */
const SLIDES=[
  {id:"BOOT",     comp:S0_Boot,      label:"起動"},
  {id:"PURPOSE",  comp:S1_Purpose,   label:"目的"},
  {id:"CHANGE",   comp:S2_Change,    label:"方針変更"},
  {id:"MARKET",   comp:S3_Market,    label:"市場動向"},
  {id:"PLATFORM", comp:S4_Platform,  label:"プラットフォーム"},
  {id:"BENEFITS", comp:S5_Benefits,  label:"メリット"},
  {id:"HOW",      comp:S6_HowItWorks,label:"使い方"},
  {id:"PRICING",  comp:S7_Pricing,   label:"料金"},
  {id:"CASES",    comp:S8_Cases,     label:"事例"},
  {id:"QA",       comp:S9_QA,        label:"Q&A"},
  {id:"END",      comp:S10_End,      label:"クロージング"},
];

export default function App(){
  const [cur,setCur]=useState(0);
  const [dir,setDir]=useState(1);
  const [anim,setAnim]=useState(false);

  const go=useCallback((next)=>{
    if(next<0||next>=SLIDES.length||anim) return;
    sfxWhoosh();
    setDir(next>cur?1:-1);
    setAnim(true);
    setTimeout(()=>{setCur(next);setAnim(false);},220);
  },[cur,anim]);

  const goNext=useCallback(()=>go(cur+1),[go,cur]);
  const goPrev=useCallback(()=>go(cur-1),[go,cur]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="ArrowRight"||e.key==="ArrowDown") goNext();
      if(e.key==="ArrowLeft"||e.key==="ArrowUp") goPrev();
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[goNext,goPrev]);

  const swipe=useSwipe(goNext,goPrev);
  const Slide=SLIDES[cur].comp;

  return (
    <div style={{width:"100vw",height:"100vh",background:BG,color:"#f1f5f9",overflow:"hidden",position:"fixed",inset:0,fontFamily:F}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Sans+JP:wght@400;600;700;900&family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(14,165,233,.3);border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes gl1{0%,100%{clip-path:inset(0 0 95% 0)}20%{clip-path:inset(30% 0 50% 0)}40%{clip-path:inset(60% 0 20% 0)}60%{clip-path:inset(10% 0 80% 0)}80%{clip-path:inset(70% 0 10% 0)}}
        @keyframes gl2{0%,100%{clip-path:inset(60% 0 0 0)}25%{clip-path:inset(0 0 70% 0)}50%{clip-path:inset(40% 0 30% 0)}75%{clip-path:inset(80% 0 5% 0)}}
        @keyframes scanSweep{
          from{background-position:0 -100%;opacity:0.8}
          to{background-position:0 100%;opacity:0}
        }
      `}</style>

      <BgCanvas/>

      {/* Header */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:10,
        padding:"clamp(.5rem,2vw,.75rem) clamp(.8rem,3vw,1.2rem)",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        borderBottom:"1px solid rgba(14,165,233,.08)",
        background:"rgba(7,12,24,.85)",backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:BL,boxShadow:`0 0 8px ${BL}`}}/>
          <span style={{fontFamily:C,fontSize:"clamp(.55rem,1.8vw,.65rem)",color:`rgba(14,165,233,.6)`,letterSpacing:".15em"}}>POINTQUIC</span>
        </div>
        <div style={{fontFamily:C,fontSize:"clamp(.52rem,1.7vw,.62rem)",color:"rgba(14,165,233,.4)"}}>
          {String(cur+1).padStart(2,"0")}/{String(SLIDES.length).padStart(2,"0")} {SLIDES[cur].id}
        </div>
      </div>

      {/* Slide */}
      <div {...swipe} style={{position:"fixed",inset:0,paddingTop:"clamp(2.5rem,8vw,3.2rem)",paddingBottom:"clamp(3.5rem,12vw,4.5rem)",
        opacity:anim?0:1,transform:anim?`translateX(${dir*18}px)`:"translateX(0)",
        transition:"opacity .22s,transform .22s"}}>
        <Slide key={cur}/>
      </div>

      {/* Footer Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,
        padding:"clamp(.5rem,2vw,.75rem) clamp(.8rem,3vw,1.2rem)",
        display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,
        borderTop:"1px solid rgba(14,165,233,.08)",
        background:"rgba(7,12,24,.85)",backdropFilter:"blur(8px)"}}>
        <button onClick={goPrev} disabled={cur===0||anim} style={{
          fontFamily:C,fontSize:"clamp(.6rem,2vw,.72rem)",letterSpacing:".12em",
          padding:"clamp(.35rem,1.5vw,.5rem) clamp(.6rem,2.5vw,.9rem)",
          border:`1px solid rgba(14,165,233,${cur===0?.1:.35})`,
          color:`rgba(14,165,233,${cur===0?.2:.7})`,background:"transparent",
          borderRadius:2,cursor:cur===0?"default":"pointer",transition:"all .2s"}}>
          ← PREV
        </button>
        <ProgressDots cur={cur+1} total={SLIDES.length}/>
        <button onClick={goNext} disabled={cur===SLIDES.length-1||anim} style={{
          fontFamily:C,fontSize:"clamp(.6rem,2vw,.72rem)",letterSpacing:".12em",
          padding:"clamp(.35rem,1.5vw,.5rem) clamp(.6rem,2.5vw,.9rem)",
          border:`1px solid rgba(14,165,233,${cur===SLIDES.length-1?.1:.55})`,
          color:cur===SLIDES.length-1?"rgba(14,165,233,.2)":BL,
          background:cur===SLIDES.length-1?"transparent":"rgba(14,165,233,.08)",
          borderRadius:2,cursor:cur===SLIDES.length-1?"default":"pointer",transition:"all .2s"}}>
          NEXT →
        </button>
      </div>
    </div>
  );
}
