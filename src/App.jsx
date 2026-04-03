import { useState, useEffect, useRef } from "react";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue, useInView, cubicBezier
} from "framer-motion";

const C = {
  bg:"#03050f", bg2:"#060914", bg3:"#0a0e1a",
  cyan:"#00e5ff", cyan2:"#00b8d4", violet:"#a855f7",
  pink:"#f472b6", green:"#00ff9d",
  white:"#e8f4ff", muted:"#4a6080", muted2:"#7090b0",
};

const E = {
  smooth: cubicBezier(0.25,0.46,0.45,0.94),
  spring: { type:"spring", stiffness:260, damping:20 },
  springS:{ type:"spring", stiffness:400, damping:30 },
  enter:  { duration:0.65, ease:[0.25,0.46,0.45,0.94] },
  fast:   { duration:0.3,  ease:[0.25,0.46,0.45,0.94] },
};

/* ── RESPONSIVE HOOK ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/* ── FONTS ── */
const FontLink = () => {
  useEffect(() => {
    if (!document.getElementById("pm-fonts")) {
      const l = document.createElement("link");
      l.id = "pm-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,700&family=Syne:wght@400;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    const style = document.createElement("style");
    style.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{background:#03050f;color:#e8f4ff;font-family:'Syne',sans-serif;overflow-x:hidden;}
      ::selection{background:#00e5ff;color:#03050f}
      a{color:inherit;text-decoration:none}
      ::-webkit-scrollbar{width:3px}
      ::-webkit-scrollbar-track{background:#03050f}
      ::-webkit-scrollbar-thumb{background:linear-gradient(to bottom,#00e5ff,#a855f7);border-radius:2px}
      @media(min-width:769px){body{cursor:none}}
      input,textarea{-webkit-appearance:none;border-radius:0;}
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

/* ── CURSOR (desktop only) ── */
function Cursor() {
  const isMobile = useIsMobile();
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness:500, damping:40 });
  const ry = useSpring(my, { stiffness:500, damping:40 });
  const ringX = useSpring(mx, { stiffness:180, damping:22 });
  const ringY = useSpring(my, { stiffness:180, damping:22 });
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const move = e => { mx.set(e.clientX); my.set(e.clientY); };
    const over  = e => setHovered(!!e.target.closest("a,button"));
    const down  = () => setClicking(true);
    const up    = () => setClicking(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
    };
  }, [isMobile]);

  if (isMobile) return null;
  return (
    <>
      <motion.div style={{ position:"fixed",pointerEvents:"none",zIndex:9999,borderRadius:"50%",x:rx,y:ry,translateX:"-50%",translateY:"-50%" }}
        animate={{ width:clicking?6:hovered?6:9, height:clicking?6:hovered?6:9, background:hovered?C.violet:C.cyan, boxShadow:hovered?`0 0 12px ${C.violet},0 0 28px rgba(168,85,247,0.5)`:`0 0 12px ${C.cyan},0 0 24px rgba(0,229,255,0.4)` }}
        transition={E.fast}
      />
      <motion.div style={{ position:"fixed",pointerEvents:"none",zIndex:9998,borderRadius:"50%",x:ringX,y:ringY,translateX:"-50%",translateY:"-50%",border:"1px solid" }}
        animate={{ width:clicking?20:hovered?50:32, height:clicking?20:hovered?50:32, borderColor:hovered?C.violet:"rgba(0,229,255,0.4)", opacity:clicking?0.4:1 }}
        transition={{ ...E.springS, duration:0.25 }}
      />
    </>
  );
}

/* ── CANVAS ── */
function SpaceCanvas() {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W, H, raf, stars=[], nebulas=[], shooters=[], trails=[];
    const resize = () => { W=c.width=window.innerWidth; H=c.height=window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const starCount = isMobile ? 60 : 140;
    for (let i=0;i<starCount;i++) stars.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.3+0.2, a:Math.random()*0.6+0.1, aDir:1,
      speed:Math.random()*0.12+0.01, twinkle:Math.random()*0.016+0.004,
      col:Math.random()>0.75?"0,229,255":Math.random()>0.5?"168,85,247":"232,244,255"
    });
    for (let i=0;i<4;i++) nebulas.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*180+80, a:Math.random()*0.025+0.006,
      col:i%3===0?"0,229,255":i%3===1?"168,85,247":"244,114,182",
      dx:(Math.random()-0.5)*0.04
    });
    const onMove = e => { if(!isMobile&&Math.random()<0.35) trails.push({x:e.clientX,y:e.clientY,a:0.45,r:Math.random()*3+0.8}); };
    window.addEventListener("mousemove", onMove);
    const spawnShooter = () => { if(shooters.length<2&&Math.random()<0.005) shooters.push({x:Math.random()*W*0.7,y:Math.random()*H*0.3,vx:3+Math.random()*4,vy:1+Math.random()*2,len:70+Math.random()*60,a:1}); };
    const loop = () => {
      ctx.clearRect(0,0,W,H);
      nebulas.forEach(n=>{ n.x+=n.dx; if(n.x<-n.r||n.x>W+n.r)n.dx*=-1; const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r); g.addColorStop(0,`rgba(${n.col},${n.a})`); g.addColorStop(1,"transparent"); ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill(); });
      stars.forEach(s=>{ s.a+=s.twinkle*s.aDir; if(s.a>0.8||s.a<0.06)s.aDir*=-1; s.y-=s.speed; if(s.y<-2){s.y=H+2;s.x=Math.random()*W;} ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(${s.col},${s.a})`; ctx.fill(); });
      spawnShooter();
      shooters=shooters.filter(s=>{ s.x+=s.vx; s.y+=s.vy; s.a-=0.018; if(s.a<=0)return false; const g=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*s.len/5,s.y-s.vy*s.len/5); g.addColorStop(0,`rgba(0,229,255,${s.a})`); g.addColorStop(1,"transparent"); ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*s.len/5,s.y-s.vy*s.len/5); ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke(); return true; });
      trails=trails.filter(t=>{ t.a-=0.022; if(t.a<=0)return false; ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fillStyle=`rgba(0,229,255,${t.a*0.28})`; ctx.fill(); return true; });
      raf=requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMove); };
  }, [isMobile]);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.7}}/>;
}

/* ── LOADER ── */
function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState("Initializing systems...");
  const [done, setDone] = useState(false);
  const statuses = ["Initializing systems...","Loading assets...","Compiling portfolio...","Almost ready...","Done!"];
  useEffect(() => {
    let count=0;
    const iv=setInterval(()=>{
      count=Math.min(count+Math.random()*7+2,100);
      setPct(Math.floor(count));
      const idx=Math.floor((count/100)*statuses.length);
      setStatus(statuses[Math.min(idx,statuses.length-1)]);
      if(count>=100){ clearInterval(iv); setTimeout(()=>{ setDone(true); setTimeout(onDone,700); },300); }
    },55);
    document.body.style.overflow="hidden";
    return ()=>clearInterval(iv);
  },[]);
  return (
    <AnimatePresence>
      {!done&&(
        <motion.div exit={{opacity:0,scale:1.06,filter:"blur(8px)"}} transition={{duration:0.7,ease:[0.25,0.46,0.45,0.94]}}
          style={{position:"fixed",inset:0,zIndex:99999,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1.6rem"}}>
          <motion.div animate={{y:[0,40]}} transition={{duration:3,repeat:Infinity,ease:"linear"}}
            style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
          <motion.div animate={{top:["-2px","100%"]}} transition={{duration:1.4,repeat:Infinity,ease:"linear"}}
            style={{position:"absolute",left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,rgba(0,229,255,0.5),transparent)"}}/>
          {[{top:12,left:12,bw:"1px 0 0 1px"},{top:12,right:12,bw:"1px 1px 0 0"},{bottom:12,left:12,bw:"0 0 1px 1px"},{bottom:12,right:12,bw:"0 1px 1px 0"}].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,scale:0.5}} animate={{opacity:0.5,scale:1}} transition={{delay:i*0.1,duration:0.4}}
              style={{position:"absolute",width:18,height:18,borderColor:C.cyan,borderStyle:"solid",borderWidth:s.bw,...s}}/>
          ))}
          <motion.div animate={{opacity:[0.5,1]}} transition={{duration:1,repeat:Infinity,repeatType:"reverse"}}
            style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(1.8rem,5vw,3rem)",fontWeight:900,letterSpacing:"0.15em",background:`linear-gradient(135deg,${C.cyan},${C.violet},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            SM<span style={{color:C.violet}}>.DEV</span>
          </motion.div>
          <div style={{width:"min(220px,80vw)",height:2,background:"rgba(0,229,255,0.08)",overflow:"hidden"}}>
            <motion.div animate={{width:`${pct}%`}} transition={{duration:0.1,ease:"linear"}}
              style={{height:"100%",background:`linear-gradient(90deg,${C.cyan},${C.violet},${C.pink})`}}/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.78rem",color:C.cyan,letterSpacing:"0.1em"}}>{pct}%</div>
          <motion.div key={status} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
            style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.22em",textTransform:"uppercase",color:C.muted2,textAlign:"center",padding:"0 1rem"}}>
            {status}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── REVEAL ── */
function Reveal({ children, delay=0, from="bottom" }) {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-60px 0px"});
  return (
    <motion.div ref={ref} initial={{opacity:0,y:from==="bottom"?30:from==="top"?-30:0,x:from==="left"?-30:from==="right"?30:0,filter:"blur(4px)"}}
      animate={inView?{opacity:1,y:0,x:0,filter:"blur(0px)"}:{}}
      transition={{duration:0.65,delay,ease:[0.25,0.46,0.45,0.94]}}>
      {children}
    </motion.div>
  );
}

function StaggerReveal({ children, delay=0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true,margin:"-60px 0px"});
  return (
    <motion.div ref={ref} initial="hidden" animate={inView?"visible":"hidden"}
      variants={{visible:{transition:{staggerChildren:0.12,delayChildren:delay}}}}>
      {children}
    </motion.div>
  );
}

const StaggerItem = ({ children, from="bottom" }) => (
  <motion.div variants={{
    hidden:{opacity:0,y:from==="bottom"?28:from==="top"?-28:0,x:from==="left"?-28:from==="right"?28:0,filter:"blur(4px)"},
    visible:{opacity:1,y:0,x:0,filter:"blur(0px)",transition:{duration:0.6,ease:[0.25,0.46,0.45,0.94]}}
  }}>{children}</motion.div>
);

/* ── MAGNETIC BUTTON ── */
function MagneticBtn({ children, style, onClick, href, target }) {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x,{stiffness:300,damping:20});
  const sy = useSpring(y,{stiffness:300,damping:20});
  const onMove = e => { if(isMobile)return; const r=ref.current.getBoundingClientRect(); x.set((e.clientX-r.left-r.width/2)*0.35); y.set((e.clientY-r.top-r.height/2)*0.35); };
  const onLeave = () => { x.set(0); y.set(0); };
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag ref={ref} href={href} target={target} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{...style,x:sx,y:sy,display:"inline-block",cursor:isMobile?"pointer":"none"}}
      whileHover={{scale:1.05}} whileTap={{scale:0.97}} transition={E.springS}>
      {children}
    </Tag>
  );
}

/* ── TILT CARD ── */
function TiltCard({ children, style }) {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const rotX = useMotionValue(0), rotY = useMotionValue(0);
  const sRotX = useSpring(rotX,{stiffness:200,damping:25});
  const sRotY = useSpring(rotY,{stiffness:200,damping:25});
  const [glow, setGlow] = useState({x:50,y:50});
  const onMove = e => { if(isMobile)return; const r=ref.current.getBoundingClientRect(); const nx=(e.clientX-r.left)/r.width; const ny=(e.clientY-r.top)/r.height; rotX.set((ny-0.5)*-10); rotY.set((nx-0.5)*10); setGlow({x:nx*100,y:ny*100}); };
  const onLeave = () => { rotX.set(0); rotY.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{...style,rotateX:isMobile?0:sRotX,rotateY:isMobile?0:sRotY,transformStyle:"preserve-3d",perspective:800,position:"relative",overflow:"hidden"}}
      whileHover={{y:isMobile?0:-4,boxShadow:`0 16px 50px rgba(0,229,255,0.1)`}} transition={E.spring}>
      {!isMobile&&<div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,background:`radial-gradient(circle at ${glow.x}% ${glow.y}%,rgba(0,229,255,0.07),transparent 55%)`,transition:"background 0.1s"}}/>}
      {children}
    </motion.div>
  );
}

/* ── TYPING ── */
function TypingText() {
  const roles = ["Software Developer","BCA Student @ PSIT","Problem Solver","Full Stack Builder","DSA Enthusiast"];
  const [text, setText] = useState("");
  useEffect(() => {
    let cancelled=false;
    const loop=(ci,ri,deleting)=>{ if(cancelled)return; const cur=roles[ri]; if(!deleting){setText(cur.slice(0,ci+1)); if(ci+1===cur.length)setTimeout(()=>loop(ci,ri,true),1900); else setTimeout(()=>loop(ci+1,ri,false),68);} else{setText(cur.slice(0,ci-1)); if(ci-1===0)setTimeout(()=>loop(0,(ri+1)%roles.length,false),320); else setTimeout(()=>loop(ci-1,ri,true),36);} };
    loop(0,0,false);
    return ()=>{cancelled=true;};
  },[]);
  return (
    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.75rem,3vw,1.05rem)",color:C.cyan2,letterSpacing:"0.06em",minHeight:"1.7em",display:"block",marginBottom:"1.6rem"}}>
      <span style={{color:C.muted2}}>&gt;&nbsp;</span>{text}
      <motion.span animate={{opacity:[1,0]}} transition={{duration:0.8,repeat:Infinity,repeatType:"reverse",ease:"steps(1)"}}
        style={{display:"inline-block",width:2,height:"1em",background:C.cyan,marginLeft:2,verticalAlign:"middle"}}/>
    </span>
  );
}

/* ── HELPERS ── */
const SLabel = ({children}) => (
  <Reveal from="left">
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.28em",textTransform:"uppercase",color:C.cyan,display:"flex",alignItems:"center",gap:"0.7rem",marginBottom:"0.7rem"}}>
      <span style={{display:"block",width:18,height:1,background:C.cyan}}/>{children}
    </div>
  </Reveal>
);
const STitle = ({children}) => (
  <Reveal delay={0.08}>
    <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(1.8rem,6vw,4.2rem)",fontWeight:900,lineHeight:1,letterSpacing:"0.04em",marginBottom:"2.5rem"}}>{children}</h2>
  </Reveal>
);
const AC = ({children}) => <span style={{background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{children}</span>;
const GlowDiv = () => <div style={{height:1,background:`linear-gradient(to right,transparent,${C.cyan},${C.violet},transparent)`,opacity:0.28,position:"relative",zIndex:1}}/>;

/* ── NAVBAR ── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mOpen, setMOpen] = useState(false);
  const links = ["about","skills","projects","education","achievements","contact"];
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>30); window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn); },[]);
  return (
    <>
      <motion.nav initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.6,delay:0.2}}
        style={{position:"fixed",top:0,left:0,right:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5vw",height:64,background:scrolled?"rgba(3,5,15,0.92)":"transparent",borderBottom:scrolled?`1px solid ${C.cyan}22`:"1px solid transparent",backdropFilter:scrolled?"blur(20px)":"none",transition:"all 0.4s"}}>
        <motion.a href="#hero" whileHover={{scale:1.05}} style={{fontFamily:"'Orbitron',sans-serif",fontSize:"1.05rem",fontWeight:900,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>SM.DEV</motion.a>
        {/* Desktop links */}
        <ul style={{display:"flex",gap:"2rem",alignItems:"center",listStyle:"none"}} className="desktop-nav">
          {links.slice(0,-1).map(l=>(
            <li key={l} style={{display:"none"}} className="desktop-li">
              <motion.a href={`#${l}`} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.64rem",letterSpacing:"0.14em",textTransform:"uppercase",color:C.muted2,position:"relative"}} whileHover={{color:C.white}}>
                {l}
                <motion.span style={{position:"absolute",bottom:-4,left:0,height:1,background:`linear-gradient(90deg,${C.cyan},${C.violet})`}} initial={{width:0}} whileHover={{width:"100%"}} transition={{duration:0.3}}/>
              </motion.a>
            </li>
          ))}
          <li>
            <MagneticBtn href="#contact" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.64rem",letterSpacing:"0.14em",textTransform:"uppercase",padding:"0.45rem 1rem",border:`1px solid ${C.cyan}`,color:C.cyan,background:"transparent",position:"relative",overflow:"hidden"}}>
              <motion.span style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${C.cyan},${C.violet})`,zIndex:0}} initial={{opacity:0}} whileHover={{opacity:1}} transition={E.fast}/>
              <span style={{position:"relative",zIndex:1}}>Contact</span>
            </MagneticBtn>
          </li>
        </ul>
        {/* Hamburger */}
        <motion.button onClick={()=>setMOpen(v=>!v)} whileTap={{scale:0.9}}
          style={{display:"flex",flexDirection:"column",gap:5,background:"none",border:"none",padding:4,cursor:"pointer"}}>
          {[0,1,2].map(i=>(
            <motion.span key={i} animate={mOpen?{rotate:i===0?45:i===2?-45:0,y:i===0?6.5:i===2?-6.5:0,opacity:i===1?0:1}:{rotate:0,y:0,opacity:1}}
              style={{display:"block",width:22,height:1.5,background:C.white,transformOrigin:"center"}} transition={E.fast}/>
          ))}
        </motion.button>
      </motion.nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {mOpen&&(
          <motion.div initial={{y:"-110%",opacity:0}} animate={{y:0,opacity:1}} exit={{y:"-110%",opacity:0}} transition={E.enter}
            style={{position:"fixed",top:64,left:0,right:0,zIndex:499,background:"rgba(3,5,15,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.cyan}22`,padding:"1.5rem 5vw",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
            {links.map(l=>(
              <motion.a key={l} href={`#${l}`} onClick={()=>setMOpen(false)} whileHover={{x:6,color:C.cyan}}
                style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.9rem",letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted2,padding:"0.75rem 0",borderBottom:`1px solid rgba(255,255,255,0.05)`,display:"block",cursor:"pointer"}}>
                {l}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── HERO ── */
function Hero() {
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY,[0,600],[0,-80]);
  const opParallax = useTransform(scrollY,[0,400],[1,0]);
  const mouseX = useMotionValue(0.5), mouseY = useMotionValue(0.5);
  const o1x = useTransform(mouseX,[0,1],[-30,30]);
  const o1y = useTransform(mouseY,[0,1],[-20,20]);
  const o2x = useTransform(mouseX,[0,1],[20,-20]);
  const o2y = useTransform(mouseY,[0,1],[15,-15]);
  useEffect(()=>{ const fn=e=>{mouseX.set(e.clientX/window.innerWidth); mouseY.set(e.clientY/window.innerHeight);}; window.addEventListener("mousemove",fn); return()=>window.removeEventListener("mousemove",fn); },[]);
  const hv = { container:{hidden:{},visible:{transition:{staggerChildren:0.15,delayChildren:0.1}}}, item:{hidden:{opacity:0,y:44,filter:"blur(6px)"},visible:{opacity:1,y:0,filter:"blur(0px)",transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}} };
  return (
    <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"90px 5vw 80px",position:"relative",overflow:"hidden"}}>
      <motion.div style={{position:"absolute",width:isMobile?300:600,height:isMobile?300:600,borderRadius:"50%",filter:"blur(80px)",background:"radial-gradient(circle,rgba(0,229,255,0.09),transparent 70%)",top:"-8%",left:"-8%",x:isMobile?0:o1x,y:isMobile?0:o1y,pointerEvents:"none"}}/>
      <motion.div style={{position:"absolute",width:isMobile?250:500,height:isMobile?250:500,borderRadius:"50%",filter:"blur(80px)",background:"radial-gradient(circle,rgba(168,85,247,0.11),transparent 70%)",bottom:"-8%",right:"-4%",x:isMobile?0:o2x,y:isMobile?0:o2y,pointerEvents:"none"}}/>
      <motion.div animate={{y:[0,-20,0]}} transition={{duration:8,repeat:Infinity,ease:"easeInOut"}}
        style={{position:"absolute",width:200,height:200,borderRadius:"50%",filter:"blur(60px)",background:"radial-gradient(circle,rgba(244,114,182,0.07),transparent 70%)",top:"45%",right:"10%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)`,backgroundSize:"60px 60px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 35%,transparent 100%)"}}/>
      <motion.div style={{position:"relative",zIndex:2,maxWidth:950,width:"100%",y:isMobile?0:yParallax,opacity:isMobile?1:opParallax}}>
        <motion.div variants={hv.container} initial="hidden" animate="visible">
          <motion.div variants={hv.item} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.6rem,2vw,0.68rem)",letterSpacing:"0.26em",textTransform:"uppercase",color:C.cyan,display:"flex",alignItems:"center",gap:"0.7rem",marginBottom:"1.2rem",flexWrap:"wrap"}}>
            <span style={{display:"block",width:26,height:1,background:C.cyan}}/>
            <motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:1.2,repeat:Infinity}} style={{width:5,height:5,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`,display:"inline-block"}}/>
            Available for Opportunities
          </motion.div>
          <motion.h1 variants={hv.item} style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2.8rem,10vw,8rem)",fontWeight:900,lineHeight:0.9,letterSpacing:"0.04em",marginBottom:"0.5rem"}}>
            <span style={{display:"block",color:C.white}}>SARTHAK</span>
            <motion.span style={{display:"block",background:`linear-gradient(135deg,${C.cyan} 0%,${C.violet} 50%,${C.pink} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"200% 200%"}}
              animate={{backgroundPosition:["0% 50%","100% 50%","0% 50%"]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}>MISHRA</motion.span>
          </motion.h1>
          <motion.div variants={hv.item}><TypingText/></motion.div>
          <motion.p variants={hv.item} style={{fontSize:"clamp(0.85rem,2.5vw,0.98rem)",lineHeight:1.82,color:"rgba(232,244,255,0.52)",maxWidth:510,marginBottom:"2rem"}}>
            Building scalable, impactful digital solutions with JavaScript, React, and Firebase. 500+ DSA problems solved. Passionate about clean code and real-world impact.
          </motion.p>
          <motion.div variants={hv.item} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
            {[
              {label:"View Projects",href:"#projects",primary:true},
              {label:"Download Resume",href:"#",primary:false},
              {label:"Contact Me",href:"#contact",primary:false},
            ].map((b,i)=>(
              <MagneticBtn key={i} href={b.href}
                onClick={b.label==="Download Resume"?e=>{e.preventDefault();window.open("/resume.pdf","_blank");}:undefined}
                style={{padding:"0.75rem 1.5rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(0.62rem,2vw,0.72rem)",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",...(b.primary?{background:`linear-gradient(135deg,${C.cyan},${C.violet})`,color:C.bg,border:"none"}:{background:"transparent",color:C.white,border:`1px solid rgba(232,244,255,0.2)`})}}>
                {b.label}
              </MagneticBtn>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
      {/* Badge — hidden on mobile */}
      {!isMobile&&(
        <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} transition={{delay:2,duration:0.6,...E.spring}}
          style={{position:"absolute",right:"5vw",top:"50%",width:140,height:140,borderRadius:"50%",border:`1px solid ${C.cyan}22`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,229,255,0.03)",backdropFilter:"blur(10px)"}}>
          <motion.div animate={{rotate:360}} transition={{duration:18,repeat:Infinity,ease:"linear"}} style={{position:"absolute",inset:0,borderRadius:"50%",border:`1px dashed rgba(0,229,255,0.18)`}}/>
          <motion.div animate={{rotate:-360}} transition={{duration:12,repeat:Infinity,ease:"linear"}} style={{position:"absolute",inset:12,borderRadius:"50%",border:`1px dashed rgba(168,85,247,0.14)`}}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"2.2rem",fontWeight:900,background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>500+</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.muted2,textAlign:"center",marginTop:"0.2rem"}}>DSA<br/>Problems</div>
        </motion.div>
      )}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.2}}
        style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem"}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.26em",textTransform:"uppercase",color:C.muted}}>Scroll</span>
        <motion.div animate={{scaleY:[1,1.2,1],opacity:[0.3,1,0.3]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}
          style={{width:1,height:40,background:`linear-gradient(to bottom,${C.cyan},transparent)`}}/>
      </motion.div>
    </section>
  );
}

/* ── TICKER ── */
function Ticker() {
  const items=["JavaScript","React","Node.js","Firebase","MongoDB","500+ DSA Solved","Python","Spring Boot","PyTorch","MySQL"];
  const doubled=[...items,...items];
  return (
    <div style={{overflow:"hidden",padding:"0.75rem 0",background:C.bg2,borderTop:`1px solid ${C.cyan}22`,borderBottom:`1px solid ${C.cyan}22`,position:"relative",zIndex:1}}>
      <motion.div animate={{x:["0%","-50%"]}} transition={{duration:22,repeat:Infinity,ease:"linear"}} style={{display:"flex",whiteSpace:"nowrap"}}>
        {doubled.map((item,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"1.2rem",padding:"0 1.2rem",fontFamily:"'Orbitron',sans-serif",fontSize:"0.75rem",letterSpacing:"0.12em",color:C.muted}}>
            {item}<span style={{width:4,height:4,borderRadius:"50%",background:`linear-gradient(135deg,${C.cyan},${C.violet})`,display:"inline-block"}}/>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── ABOUT ── */
function About() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  const [counted, setCounted] = useState(false);
  useEffect(()=>{ if(inView&&!counted)setCounted(true); },[inView]);
  const Counter = ({target,suffix="",isFloat=false}) => {
    const [val,setVal]=useState(0);
    useEffect(()=>{ if(!counted)return; let start=null; const dur=1400; const step=ts=>{if(!start)start=ts; const p=Math.min((ts-start)/dur,1); const ease=1-Math.pow(1-p,3); setVal(target*ease); if(p<1)requestAnimationFrame(step); else setVal(target);}; requestAnimationFrame(step); },[counted]);
    return <>{isFloat?val.toFixed(2):Math.floor(val)}{suffix}</>;
  };
  const stats=[{target:500,suffix:"+",label:"DSA Problems"},{target:8.77,label:"CGPA",isFloat:true},{target:2,suffix:"+",label:"Live Projects"},{target:2,suffix:"+",label:"Certifications"}];
  return (
    <section id="about" style={{background:C.bg2,borderTop:`1px solid rgba(255,255,255,0.05)`,borderBottom:`1px solid rgba(255,255,255,0.05)`,padding:"80px 5vw",position:"relative",zIndex:1}}>
      <div ref={ref} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"3rem",alignItems:"start",maxWidth:1100,margin:"0 auto"}}>
        <div>
          <SLabel>Who I Am</SLabel>
          <STitle>ABOUT<br/><AC>ME</AC></STitle>
          <StaggerReveal delay={0.2}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:`${C.cyan}22`,border:`1px solid ${C.cyan}22`}}>
              {stats.map((s,i)=>(
                <StaggerItem key={i}>
                  <TiltCard style={{background:C.bg2,padding:"1.4rem 1.2rem",cursor:"default"}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(1.8rem,4vw,2.6rem)",fontWeight:900,lineHeight:1,marginBottom:"0.25rem",background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                      <Counter target={s.target} suffix={s.suffix||""} isFloat={s.isFloat}/>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.muted}}>{s.label}</div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerReveal>
        </div>
        <div>
          <Reveal delay={0.1}><p style={{fontSize:"0.95rem",lineHeight:1.85,color:"rgba(232,244,255,0.6)",marginBottom:"1.2rem"}}>I'm a software developer and BCA student at PSIT, Kanpur, with a strong foundation in JavaScript, React, Firebase, and MongoDB. I thrive on turning complex problems into elegant, scalable digital solutions.</p></Reveal>
          <Reveal delay={0.2}><p style={{fontSize:"0.95rem",lineHeight:1.85,color:"rgba(232,244,255,0.6)",marginBottom:"1.2rem"}}>With 500+ DSA problems solved, I bring both the theoretical depth and practical experience needed to build systems that perform at scale.</p></Reveal>
          <StaggerReveal delay={0.3}>
            {["Strong leadership & mentoring experience","Certified by Infosys (Python) & Oracle (AI/ML)","Focused on impactful, real-world applications","Open to full-stack & ML opportunities"].map((h,i)=>(
              <StaggerItem key={i}>
                <motion.div whileHover={{x:5,borderColor:C.cyan,color:C.white,background:"rgba(0,229,255,0.04)"}}
                  style={{display:"flex",alignItems:"center",gap:"0.7rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",letterSpacing:"0.04em",color:C.muted2,padding:"0.45rem 0.7rem",borderLeft:"2px solid transparent",transition:"all 0.25s",cursor:"default",marginBottom:"0.3rem"}}>
                  <span style={{color:C.cyan,fontSize:"0.65rem"}}>▸</span>{h}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}

/* ── SKILLS ── */
function Skills() {
  const cats=[
    {name:"Web Development",bg:"WEB",tags:["JavaScript","React","Node.js","Express","HTML","CSS","Spring Boot","Firebase","MongoDB","MySQL"]},
    {name:"ML / Data Science",bg:"ML",tags:["Python","PyTorch","Pandas"]},
    {name:"Core CS",bg:"CS",tags:["DSA","DBMS","OOPs","SQL","Java"]},
    {name:"Soft Skills",bg:"SOFT",tags:["Leadership","Communication","Teamwork","Mentoring"]},
  ];
  return (
    <section id="skills" style={{maxWidth:1100,margin:"0 auto",padding:"80px 5vw",position:"relative",zIndex:1}}>
      <SLabel>Technical Skills</SLabel>
      <STitle>MY <AC>STACK</AC></STitle>
      <StaggerReveal delay={0.1}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)"}}>
          {cats.map((cat,i)=>(
            <StaggerItem key={i}>
              <TiltCard style={{background:C.bg,padding:"1.7rem 1.5rem",cursor:"default",minHeight:160}}>
                <div style={{position:"absolute",top:-12,right:-8,fontFamily:"'Orbitron',sans-serif",fontSize:"4rem",fontWeight:900,color:"rgba(0,229,255,0.04)",pointerEvents:"none",lineHeight:1}}>{cat.bg}</div>
                <div style={{position:"relative"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.22em",textTransform:"uppercase",color:C.cyan,marginBottom:"1rem"}}>{cat.name}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                    {cat.tags.map((t,j)=>(
                      <motion.span key={j} whileHover={{borderColor:C.cyan,color:C.cyan,background:"rgba(0,229,255,0.05)"}}
                        style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.05em",padding:"0.24rem 0.58rem",border:`1px solid ${C.cyan}22`,color:C.muted2,cursor:"default",transition:"all 0.2s"}}>
                        {t}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </div>
      </StaggerReveal>
    </section>
  );
}

/* ── PROJECTS ── */
function Projects() {
  const projects=[
    {num:"01",name:"SALE SETU",desc:"Multi-company business management platform with scalable database architecture and fully responsive UI. Built for real-world commerce with robust data handling.",tech:["HTML","CSS","JavaScript","Firebase","MongoDB"],url:"https://salesetu-tracker.netlify.app"},
    {num:"02",name:"LIKHA PADHI",desc:"Educational content platform focused on accessibility and clean user experience. Designed to make quality learning available to every user, everywhere.",tech:["HTML","CSS","JavaScript","Firebase"],url:"https://likha-padhi-3ae36.web.app"},
  ];
  return (
    <section id="projects" style={{background:C.bg2,borderTop:`1px solid rgba(255,255,255,0.05)`,borderBottom:`1px solid rgba(255,255,255,0.05)`,padding:"80px 5vw",position:"relative",zIndex:1}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <SLabel>What I've Built</SLabel>
        <STitle>FEATURED <AC>PROJECTS</AC></STitle>
        <StaggerReveal delay={0.1}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)"}}>
            {projects.map((p,i)=>(
              <StaggerItem key={i}>
                <TiltCard style={{background:C.bg2,padding:"2rem 1.8rem",display:"flex",flexDirection:"column",gap:"0.9rem",minHeight:280}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"3.5rem",fontWeight:900,color:"rgba(0,229,255,0.07)",lineHeight:1,position:"absolute",top:"0.9rem",right:"1rem"}}>{p.num}</div>
                  <div style={{position:"relative"}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(1.3rem,3vw,1.6rem)",fontWeight:900,letterSpacing:"0.04em",marginBottom:"0.8rem"}}>{p.name}</div>
                    <p style={{fontSize:"0.85rem",lineHeight:1.72,color:"rgba(232,244,255,0.54)",marginBottom:"0.8rem"}}>{p.desc}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.9rem"}}>
                      {p.tech.map((t,j)=>(
                        <span key={j} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.2rem 0.5rem",background:"rgba(0,229,255,0.04)",border:`1px solid ${C.cyan}22`,color:C.cyan}}>{t}</span>
                      ))}
                    </div>
                    <motion.a href={p.url} target="_blank" style={{display:"inline-flex",alignItems:"center",gap:"0.42rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.67rem",letterSpacing:"0.1em",textTransform:"uppercase",color:C.cyan,cursor:"pointer"}} whileHover={{gap:"0.7rem",color:C.violet}}>
                      View Live <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10L10 2M10 2H5M10 2V7"/></svg>
                    </motion.a>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerReveal>
      </div>
    </section>
  );
}

/* ── EDUCATION ── */
function Education() {
  const items=[
    {deg:"Bachelor of Computer Applications",sch:"PSIT — Pranveer Singh Institute of Technology, Kanpur",meta:"CGPA: 8.77",year:"2024 – Present"},
    {deg:"12th Grade — CBSE",sch:"Central Board of Secondary Education",meta:"85%",year:"2023"},
    {deg:"10th Grade — CBSE",sch:"Central Board of Secondary Education",meta:"80%",year:"2021"},
  ];
  return (
    <section id="education" style={{maxWidth:900,margin:"0 auto",padding:"80px 5vw",position:"relative",zIndex:1}}>
      <SLabel>Academic Path</SLabel>
      <STitle>EDUCATION <AC>PATH</AC></STitle>
      <div style={{paddingLeft:"2rem",position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.cyan},${C.violet},transparent)`}}/>
        <StaggerReveal delay={0.1}>
          {items.map((item,i)=>(
            <StaggerItem key={i} from="left">
              <motion.div style={{position:"relative",padding:"0 0 2.5rem 2rem"}} whileHover={{x:3}} transition={E.fast}>
                <motion.div initial={{scale:0}} whileInView={{scale:1}} viewport={{once:true}} transition={{delay:i*0.15+0.2,type:"spring",stiffness:300}}
                  style={{position:"absolute",left:-5,top:"0.28rem",width:10,height:10,borderRadius:"50%",background:C.cyan,border:`2px solid ${C.bg}`,boxShadow:`0 0 12px ${C.cyan},0 0 24px rgba(0,229,255,0.3)`}}/>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(1rem,2.5vw,1.3rem)",fontWeight:900,letterSpacing:"0.03em",marginBottom:"0.25rem"}}>{item.deg}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:C.cyan,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.4rem"}}>{item.sch}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:C.muted}}><span style={{color:C.violet,marginRight:"0.7rem"}}>{item.meta}</span>{item.year}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}

/* ── ACHIEVEMENTS ── */
function Achievements() {
  const items=[
    {circle:true,icon:<path d="M7 4.5v2.5l1.5 1"/>,title:"500+ DSA Problems",desc:"solved across platforms, demonstrating strong algorithmic and analytical thinking."},
    {icon:<><rect x="2" y="3.5" width="10" height="8" rx="1"/><path d="M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1"/></>,title:"Python Certification",desc:"from Infosys — validated industry-level programming fundamentals."},
    {icon:<path d="M7 1.5l1.3 2.6 2.9.42-2.1 2.05.5 2.9L7 8.1 4.4 9.47l.5-2.9L2.8 4.52l2.9-.42z"/>,title:"AI/ML Certification",desc:"from Oracle — advanced program in artificial intelligence and machine learning."},
    {icon:<path d="M2 8.5l3-3 2.5 2.5 4.5-5.5"/>,title:"Sessions & Mentoring",desc:"hosted workshops and mentored peers, building a stronger community learning culture."},
  ];
  return (
    <section id="achievements" style={{background:C.bg2,borderTop:`1px solid rgba(255,255,255,0.05)`,padding:"80px 5vw",position:"relative",zIndex:1}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <SLabel>Recognition</SLabel>
        <STitle>ACHIEVEMENTS <AC>&amp; CERTS</AC></STitle>
        <StaggerReveal delay={0.1}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)"}}>
            {items.map((item,i)=>(
              <StaggerItem key={i}>
                <TiltCard style={{background:C.bg2,padding:"1.5rem",display:"flex",alignItems:"flex-start",gap:"0.9rem",cursor:"default"}}>
                  <motion.div whileHover={{background:"rgba(0,229,255,0.08)",boxShadow:`0 0 12px rgba(0,229,255,0.15)`}}
                    style={{width:32,height:32,minWidth:32,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.cyan}22`,color:C.cyan,background:"rgba(0,229,255,0.04)",transition:"all 0.25s",flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      {item.circle&&<circle cx="7" cy="7" r="5.5"/>}{item.icon}
                    </svg>
                  </motion.div>
                  <div style={{fontSize:"0.85rem",lineHeight:1.65,color:"rgba(232,244,255,0.68)"}}>
                    <strong style={{color:C.white,fontWeight:600}}>{item.title}</strong> {item.desc}
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerReveal>
      </div>
    </section>
  );
}

/* ── INTERESTS ── */
function Interests() {
  const chips=["Poetry","Public Speaking","Continuous Learning","Fitness"];
  return (
    <section id="interests" style={{maxWidth:900,margin:"0 auto",padding:"80px 5vw",position:"relative",zIndex:1}}>
      <SLabel>Beyond Code</SLabel>
      <STitle>MY <AC>INTERESTS</AC></STitle>
      <Reveal>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.75rem"}}>
          {chips.map((c,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.1+0.1}}
              whileHover={{borderColor:C.cyan,color:C.white,y:-2}}
              style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(0.85rem,2.5vw,1.1rem)",fontWeight:900,letterSpacing:"0.08em",padding:"0.6rem 1.2rem",border:`1px solid ${C.cyan}22`,color:C.muted,position:"relative",overflow:"hidden",cursor:"default",transition:"color 0.3s,border-color 0.3s"}}>
              <motion.div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,rgba(0,229,255,0.08),rgba(168,85,247,0.08))`,translateX:"-100%"}} whileHover={{translateX:"0%"}} transition={{duration:0.4}}/>
              <span style={{position:"relative"}}>{c}</span>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ── CONTACT ── */
function Contact() {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const isMobile = useIsMobile();
  const WHATSAPP_NUMBER = "918429670087";

  const sendWhatsApp = () => {
    if(!form.name||!form.message){ alert("Please fill in your name and message."); return; }
    const text = `Hi Sarthak! 👋\n\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url,"_blank");
  };

  return (
    <section id="contact" style={{background:C.bg,padding:"80px 5vw",position:"relative",zIndex:1}}>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"3rem"}}>
        <div>
          <SLabel>Let's Connect</SLabel>
          <STitle>GET IN <AC>TOUCH</AC></STitle>
          <Reveal delay={0.1}>
            <p style={{fontSize:"0.95rem",lineHeight:1.8,color:"rgba(232,244,255,0.54)",marginBottom:"2rem"}}>
              Open to internships, collaborations, and full-time opportunities. Let's build something great together.
            </p>
          </Reveal>
          <StaggerReveal delay={0.2}>
            {[
              {label:"Phone",val:"+91 8429670087",href:"tel:+918429670087",icon:<path d="M2 1.5a1 1 0 011-1h1.6l.9 2.7-1.3 1.3A8.5 8.5 0 007.5 9.8l1.3-1.3 2.7.9v1.6a1 1 0 01-1 1A10.5 10.5 0 012 1.5z"/>},
              {label:"WhatsApp",val:"Chat on WhatsApp",href:`https://wa.me/${WHATSAPP_NUMBER}`,icon:<path d="M11.5 8.5c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.2l-.9 1.1c-.1.2-.3.2-.6.1C6.4 8.4 5.4 7.7 4.6 6.8 3.9 6 3.3 5 3.1 4.8c-.1-.3 0-.5.2-.6l.6-.7c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6L3.2 1c-.2-.4-.5-.4-.7-.4H2c-.2 0-.6.1-.9.4C.8 1.4 0 2.2 0 3.4c0 1.2.9 2.4 1 2.6 1 1.8 2.4 3.4 4 4.5 1.5 1.1 3.1 1.7 4.2 1.7.5 0 1.4-.2 2-.8.5-.5.7-1.2.7-1.6 0-.2-.1-.3-.4-.4z"/>,target:"_blank"},
              {label:"Email",val:"sarthakmishra010@gmail.com",href:"mailto:sarthakmishra010@gmail.com",icon:<><rect x="1" y="2" width="11" height="9" rx="1"/><path d="M1 3l5.5 4L12 3"/></>},
              {label:"Location",val:"Kanpur, Uttar Pradesh, India",href:null,icon:<><path d="M6.5 1a3.5 3.5 0 013.5 3.5C10 7.5 6.5 12 6.5 12S3 7.5 3 4.5A3.5 3.5 0 016.5 1z"/><circle cx="6.5" cy="4.5" r="1.3"/></>},
            ].map((item,i)=>(
              <StaggerItem key={i}>
                <motion.a href={item.href||undefined} target={item.target||undefined}
                  whileHover={{x:6,borderColor:`${C.cyan}44`,background:C.bg3}}
                  style={{display:"flex",alignItems:"center",gap:"0.9rem",padding:"0.8rem 1rem",border:`1px solid rgba(255,255,255,0.05)`,background:C.bg2,cursor:item.href?"pointer":"default",marginBottom:"0.7rem",transition:"all 0.3s",textDecoration:"none"}}>
                  <div style={{width:32,height:32,minWidth:32,display:"flex",alignItems:"center",justifyContent:"center",background:item.label==="WhatsApp"?"rgba(0,255,100,0.08)":"rgba(0,229,255,0.05)",color:item.label==="WhatsApp"?"#00ff9d":C.cyan,border:`1px solid ${item.label==="WhatsApp"?"rgba(0,255,100,0.2)":C.cyan+"22"}`}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill={item.label==="WhatsApp"?"currentColor":"none"} stroke={item.label==="WhatsApp"?"none":"currentColor"} strokeWidth="1.4">{item.icon}</svg>
                  </div>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:item.label==="WhatsApp"?"#00ff9d":C.muted,marginBottom:"0.1rem"}}>{item.label}</div>
                    <div style={{fontSize:"0.84rem",color:C.white,wordBreak:"break-all"}}>{item.val}</div>
                  </div>
                </motion.a>
              </StaggerItem>
            ))}
          </StaggerReveal>
          {/* Social links */}
          <Reveal delay={0.3}>
            <div style={{marginTop:"1.5rem"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:"0.8rem"}}>Find me on</div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                {[{label:"LinkedIn",href:"https://linkedin.com/in/sarthak-mishra-1a8041306"},{label:"GitHub",href:"#"}].map((s,i)=>(
                  <motion.a key={i} href={s.href} target="_blank" whileHover={{x:6,borderColor:C.cyan,color:C.cyan,background:"rgba(0,229,255,0.03)"}}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.8rem 1rem",border:`1px solid rgba(255,255,255,0.05)`,background:C.bg2,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted2,cursor:"pointer",transition:"all 0.3s"}}>
                    {s.label}<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 9L9 2M9 2H4.5M9 2V6.5"/></svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* FORM */}
        <Reveal delay={0.15}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:"1rem"}}>Send via WhatsApp</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
              <motion.input placeholder="Your Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                whileFocus={{borderColor:C.cyan,boxShadow:`0 0 14px rgba(0,229,255,0.08)`}}
                style={{background:C.bg2,border:`1px solid rgba(255,255,255,0.08)`,padding:"0.82rem 1rem",color:C.white,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.75rem",outline:"none",width:"100%",letterSpacing:"0.04em",transition:"border-color 0.25s,box-shadow 0.25s"}}/>
              <motion.input placeholder="your@email.com" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                whileFocus={{borderColor:C.cyan,boxShadow:`0 0 14px rgba(0,229,255,0.08)`}}
                style={{background:C.bg2,border:`1px solid rgba(255,255,255,0.08)`,padding:"0.82rem 1rem",color:C.white,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.75rem",outline:"none",width:"100%",letterSpacing:"0.04em",transition:"border-color 0.25s,box-shadow 0.25s"}}/>
              <motion.textarea placeholder="Your message..." rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                whileFocus={{borderColor:C.cyan,boxShadow:`0 0 14px rgba(0,229,255,0.08)`}}
                style={{background:C.bg2,border:`1px solid rgba(255,255,255,0.08)`,padding:"0.82rem 1rem",color:C.white,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.75rem",outline:"none",width:"100%",letterSpacing:"0.04em",resize:"none",transition:"border-color 0.25s,box-shadow 0.25s"}}/>
              <MagneticBtn onClick={sendWhatsApp}
                style={{alignSelf:"flex-start",padding:"0.82rem 1.9rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,background:`linear-gradient(135deg,#00ff9d,#00b8d4)`,color:C.bg,border:"none",clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))"}}>
                📱 Send via WhatsApp
              </MagneticBtn>
              <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",color:C.muted,letterSpacing:"0.05em"}}>
                * Clicking will open WhatsApp with your message pre-filled
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <motion.footer initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
      style={{borderTop:`1px solid rgba(255,255,255,0.05)`,padding:"1.5rem 5vw",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.75rem",position:"relative",zIndex:1}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"1rem",fontWeight:900,letterSpacing:"0.12em",background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>SM.DEV</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.1em",color:C.muted}}>© 2025 Sarthak Mishra. All rights reserved.</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",color:C.muted}}>Built with <span style={{color:C.cyan}}>precision &amp; passion</span></div>
    </motion.footer>
  );
}

/* ── ROOT ── */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <FontLink/>
      <Loader onDone={()=>{ setLoaded(true); document.body.style.overflow="auto"; }}/>
      <Cursor/>
      <SpaceCanvas/>
      <AnimatePresence>
        {loaded&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
            <Navbar/>
            <Hero/>
            <Ticker/>
            <About/>
            <GlowDiv/>
            <Skills/>
            <Projects/>
            <Education/>
            <GlowDiv/>
            <Achievements/>
            <Interests/>
            <GlowDiv/>
            <Contact/>
            <Footer/>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}