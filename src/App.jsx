
import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue, useInView, stagger,
  useAnimate, cubicBezier
} from "framer-motion";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bg:      "#03050f",
  bg2:     "#060914",
  bg3:     "#0a0e1a",
  cyan:    "#00e5ff",
  cyan2:   "#00b8d4",
  violet:  "#a855f7",
  pink:    "#f472b6",
  green:   "#00ff9d",
  white:   "#e8f4ff",
  muted:   "#4a6080",
  muted2:  "#7090b0",
};

const E = {
  smooth:  cubicBezier(0.25, 0.46, 0.45, 0.94),
  spring:  { type: "spring", stiffness: 260, damping: 20 },
  springS: { type: "spring", stiffness: 400, damping: 30 },
  enter:   { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  fast:    { duration: 0.3,  ease: [0.25, 0.46, 0.45, 0.94] },
};

/* ─────────────────────────────────────────────
   FONTS (injected once)
───────────────────────────────────────────── */
const FontLink = () => {
  useEffect(() => {
    if (!document.getElementById("pm-fonts")) {
      const l = document.createElement("link");
      l.id   = "pm-fonts";
      l.rel  = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,700&family=Syne:wght@400;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    const style = document.createElement("style");
    style.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{background:#03050f;color:#e8f4ff;font-family:'Syne',sans-serif;overflow-x:hidden;cursor:none}
      ::selection{background:#00e5ff;color:#03050f}
      a{color:inherit;text-decoration:none}
      ::-webkit-scrollbar{width:3px}
      ::-webkit-scrollbar-track{background:#03050f}
      ::-webkit-scrollbar-thumb{background:linear-gradient(to bottom,#00e5ff,#a855f7);border-radius:2px}
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */
function Cursor() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 500, damping: 40 });
  const ry = useSpring(my, { stiffness: 500, damping: 40 });
  const ringX = useSpring(mx, { stiffness: 180, damping: 22 });
  const ringY = useSpring(my, { stiffness: 180, damping: 22 });
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = e => { mx.set(e.clientX); my.set(e.clientY); };
    const over = e => setHovered(!!e.target.closest("a,button"));
    const down = () => setClicking(true);
    const up   = () => setClicking(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup",   up);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup",   up);
    };
  }, []);

  return (
    <>
      {/* dot */}
      <motion.div
        style={{
          position:"fixed", pointerEvents:"none", zIndex:9999,
          borderRadius:"50%",
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
        }}
        animate={{
          width:  clicking ? 6  : hovered ? 6  : 9,
          height: clicking ? 6  : hovered ? 6  : 9,
          background: hovered ? C.violet : C.cyan,
          boxShadow: hovered
            ? `0 0 12px ${C.violet},0 0 28px rgba(168,85,247,0.5)`
            : `0 0 12px ${C.cyan},0 0 24px rgba(0,229,255,0.4)`,
        }}
        transition={E.fast}
      />
      {/* ring */}
      <motion.div
        style={{
          position:"fixed", pointerEvents:"none", zIndex:9998,
          borderRadius:"50%",
          x: ringX, y: ringY,
          translateX: "-50%", translateY: "-50%",
          border: `1px solid`,
        }}
        animate={{
          width:  clicking ? 20 : hovered ? 50  : 32,
          height: clicking ? 20 : hovered ? 50  : 32,
          borderColor: hovered ? C.violet : "rgba(0,229,255,0.4)",
          opacity: clicking ? 0.4 : 1,
        }}
        transition={{ ...E.springS, duration: 0.25 }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   CANVAS BACKGROUND
───────────────────────────────────────────── */
function SpaceCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W, H, raf, stars=[], nebulas=[], shooters=[], trails=[];
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i=0;i<140;i++) stars.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.3+0.2, a:Math.random()*0.6+0.1, aDir:1,
      speed:Math.random()*0.12+0.01, twinkle:Math.random()*0.016+0.004,
      col: Math.random()>0.75?"0,229,255":Math.random()>0.5?"168,85,247":"232,244,255"
    });
    for (let i=0;i<6;i++) nebulas.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*220+90, a:Math.random()*0.03+0.007,
      col:i%3===0?"0,229,255":i%3===1?"168,85,247":"244,114,182",
      dx:(Math.random()-0.5)*0.05
    });
    const onMove = e => { if(Math.random()<0.35) trails.push({x:e.clientX,y:e.clientY,a:0.45,r:Math.random()*3+0.8}); };
    window.addEventListener("mousemove", onMove);
    const spawnShooter = () => {
      if (shooters.length < 3 && Math.random()<0.007)
        shooters.push({ x:Math.random()*W*0.7, y:Math.random()*H*0.3, vx:3+Math.random()*4, vy:1+Math.random()*2, len:70+Math.random()*60, a:1 });
    };
    const loop = () => {
      ctx.clearRect(0,0,W,H);
      nebulas.forEach(n => {
        n.x+=n.dx; if(n.x<-n.r||n.x>W+n.r) n.dx*=-1;
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
        g.addColorStop(0,`rgba(${n.col},${n.a})`); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });
      stars.forEach(s => {
        s.a+=s.twinkle*s.aDir; if(s.a>0.8||s.a<0.06) s.aDir*=-1;
        s.y-=s.speed; if(s.y<-2){s.y=H+2;s.x=Math.random()*W;}
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${s.col},${s.a})`; ctx.fill();
      });
      spawnShooter();
      shooters = shooters.filter(s => {
        s.x+=s.vx; s.y+=s.vy; s.a-=0.018; if(s.a<=0) return false;
        const g=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*s.len/5,s.y-s.vy*s.len/5);
        g.addColorStop(0,`rgba(0,229,255,${s.a})`); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*s.len/5,s.y-s.vy*s.len/5);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke(); return true;
      });
      trails = trails.filter(t => {
        t.a-=0.022; if(t.a<=0) return false;
        ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,229,255,${t.a*0.28})`; ctx.fill(); return true;
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMove); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.7 }}/>;
}

/* ─────────────────────────────────────────────
   LOADER
───────────────────────────────────────────── */
function Loader({ onDone }) {
  const [pct, setPct]       = useState(0);
  const [status, setStatus] = useState("Initializing systems...");
  const [done, setDone]     = useState(false);
  const statuses = ["Initializing systems...","Loading assets...","Compiling portfolio...","Almost ready...","Done!"];

  useEffect(() => {
    let count = 0;
    const iv = setInterval(() => {
      count = Math.min(count + Math.random() * 7 + 2, 100);
      setPct(Math.floor(count));
      const idx = Math.floor((count / 100) * statuses.length);
      setStatus(statuses[Math.min(idx, statuses.length - 1)]);
      if (count >= 100) {
        clearInterval(iv);
        setTimeout(() => { setDone(true); setTimeout(onDone, 700); }, 300);
      }
    }, 55);
    document.body.style.overflow = "hidden";
    return () => clearInterval(iv);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.25,0.46,0.45,0.94] }}
          style={{
            position:"fixed",inset:0,zIndex:99999,background:C.bg,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1.6rem"
          }}
        >
          {/* animated grid */}
          <motion.div
            animate={{ y: [0, 40] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position:"absolute",inset:0,
              backgroundImage:`linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)`,
              backgroundSize:"40px 40px"
            }}
          />
          {/* scanline */}
          <motion.div
            animate={{ top: ["-2px","100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            style={{
              position:"absolute",left:0,right:0,height:"2px",
              background:"linear-gradient(90deg,transparent,rgba(0,229,255,0.5),transparent)"
            }}
          />
          {/* corners */}
          {[{top:12,left:12,bw:"1px 0 0 1px"},{top:12,right:12,bw:"1px 1px 0 0"},{bottom:12,left:12,bw:"0 0 1px 1px"},{bottom:12,right:12,bw:"0 1px 1px 0"}].map((s,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, scale:0.5 }} animate={{ opacity:0.5, scale:1 }}
              transition={{ delay: i*0.1, duration:0.4 }}
              style={{ position:"absolute", width:18, height:18, borderColor:C.cyan, borderStyle:"solid", borderWidth:s.bw, ...s }}
            />
          ))}
          {/* logo */}
          <motion.div
            animate={{ opacity:[0.5,1] }}
            transition={{ duration:1, repeat:Infinity, repeatType:"reverse" }}
            style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:900, letterSpacing:"0.15em",
              background:`linear-gradient(135deg,${C.cyan},${C.violet},${C.pink})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
          >
            SM<span style={{color:C.violet}}>.DEV</span>
          </motion.div>
          {/* bar */}
          <div style={{ width:220, height:2, background:"rgba(0,229,255,0.08)", overflow:"hidden" }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration:0.1, ease:"linear" }}
              style={{ height:"100%", background:`linear-gradient(90deg,${C.cyan},${C.violet},${C.pink})` }}
            />
          </div>
          <motion.div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.78rem", color:C.cyan, letterSpacing:"0.1em" }}>
            {pct}%
          </motion.div>
          <motion.div
            key={status}
            initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
            style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", letterSpacing:"0.22em", textTransform:"uppercase", color:C.muted2 }}
          >
            {status}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   REVEAL WRAPPER  (scroll-triggered + stagger)
───────────────────────────────────────────── */
function Reveal({ children, delay=0, from="bottom", className="" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px 0px" });
  const variants = {
    hidden: {
      opacity:0,
      y:    from==="bottom"? 36 : from==="top"?   -36 : 0,
      x:    from==="left"?  -36 : from==="right"?  36  : 0,
      filter:"blur(4px)",
    },
    visible:{
      opacity:1, y:0, x:0, filter:"blur(0px)",
      transition:{ duration:0.65, delay, ease:[0.25,0.46,0.45,0.94] }
    }
  };
  return (
    <motion.div ref={ref} className={className} variants={variants} initial="hidden" animate={inView?"visible":"hidden"}>
      {children}
    </motion.div>
  );
}

/* staggered container */
function StaggerReveal({ children, delay=0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-60px 0px" });
  return (
    <motion.div ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ visible:{ transition:{ staggerChildren:0.13, delayChildren:delay } } }}
    >
      {children}
    </motion.div>
  );
}
const StaggerItem = ({ children, from="bottom", className="" }) => (
  <motion.div className={className} variants={{
    hidden:{ opacity:0, y: from==="bottom"?30:from==="top"?-30:0, x: from==="left"?-30:from==="right"?30:0, filter:"blur(4px)" },
    visible:{ opacity:1, y:0, x:0, filter:"blur(0px)", transition:{ duration:0.6, ease:[0.25,0.46,0.45,0.94] } }
  }}>
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────────
   MAGNETIC BUTTON
───────────────────────────────────────────── */
function MagneticBtn({ children, className, style, onClick, href }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness:300, damping:20 });
  const sy = useSpring(y, { stiffness:300, damping:20 });

  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const Tag = href ? motion.a : motion.button;
  return (
    <Tag ref={ref} href={href} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ ...style, x:sx, y:sy, display:"inline-block", cursor:"none" }}
      whileHover={{ scale:1.05 }}
      whileTap={{ scale:0.97 }}
      transition={E.springS}
      className={className}
    >
      {children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness:200, damping:25 });
  const sRotY = useSpring(rotY, { stiffness:200, damping:25 });
  const [glow, setGlow] = useState({ x:50, y:50 });

  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;
    rotX.set((ny - 0.5) * -12);
    rotY.set((nx - 0.5) *  12);
    setGlow({ x: nx*100, y: ny*100 });
  };
  const onLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div ref={ref} className={className}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        ...style,
        rotateX: sRotX, rotateY: sRotY,
        transformStyle:"preserve-3d",
        perspective:800,
        position:"relative", overflow:"hidden",
      }}
      whileHover={{ y:-6, boxShadow:`0 20px 60px rgba(0,229,255,0.12)` }}
      transition={E.spring}
    >
      {/* spotlight glow */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:`radial-gradient(circle at ${glow.x}% ${glow.y}%,rgba(0,229,255,0.07),transparent 55%)`,
        transition:"background 0.1s"
      }}/>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   TYPING ANIMATION
───────────────────────────────────────────── */
function TypingText() {
  const roles = ["Software Developer","BCA Student @ PSIT","Problem Solver","Full Stack Builder","DSA Enthusiast"];
  const [text, setText] = useState("");
  const [idx, setIdx]   = useState(0);
  const [del, setDel]   = useState(false);

  useEffect(() => {
    let ci = 0;
    let cancelled = false;
    const loop = (ci, ri, deleting) => {
      if (cancelled) return;
      const cur = roles[ri];
      if (!deleting) {
        setText(cur.slice(0, ci + 1));
        if (ci + 1 === cur.length) setTimeout(() => loop(ci, ri, true), 1900);
        else setTimeout(() => loop(ci + 1, ri, false), 68);
      } else {
        setText(cur.slice(0, ci - 1));
        if (ci - 1 === 0) setTimeout(() => loop(0, (ri+1)%roles.length, false), 320);
        else setTimeout(() => loop(ci - 1, ri, true), 36);
      }
    };
    loop(0, 0, false);
    return () => { cancelled = true; };
  }, []);

  return (
    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"clamp(0.8rem,1.7vw,1.05rem)",
      color:C.cyan2, letterSpacing:"0.06em", minHeight:"1.7em", display:"block", marginBottom:"1.6rem" }}>
      <span style={{ color:C.muted2 }}>&gt;&nbsp;</span>
      {text}
      <motion.span
        animate={{ opacity:[1,0] }}
        transition={{ duration:0.8, repeat:Infinity, repeatType:"reverse", ease:"steps(1)" }}
        style={{ display:"inline-block",width:2,height:"1em",background:C.cyan,marginLeft:2,verticalAlign:"middle" }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────
   SECTION LABEL + TITLE helpers
───────────────────────────────────────────── */
const SLabel = ({ children }) => (
  <Reveal from="left">
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", letterSpacing:"0.28em",
      textTransform:"uppercase", color:C.cyan, display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"0.7rem" }}>
      <span style={{ display:"block",width:18,height:1,background:C.cyan }}/>
      {children}
    </div>
  </Reveal>
);
const STitle = ({ children }) => (
  <Reveal delay={0.08}>
    <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(2.2rem,6vw,4.2rem)", fontWeight:900,
      lineHeight:0.95, letterSpacing:"0.04em", marginBottom:"3.2rem" }}>
      {children}
    </h2>
  </Reveal>
);
const AC = ({ children }) => (
  <span style={{ background:`linear-gradient(135deg,${C.cyan},${C.violet})`,
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
    {children}
  </span>
);

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mOpen, setMOpen]       = useState(false);
  const links = ["about","skills","projects","education","achievements","contact"];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y:-80, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        transition={{ duration:0.6, delay:0.2, ease:[0.25,0.46,0.45,0.94] }}
        style={{
          position:"fixed",top:0,left:0,right:0,zIndex:500,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 5vw",height:64,
          background: scrolled ? "rgba(3,5,15,0.9)" : "transparent",
          borderBottom: scrolled ? `1px solid ${C.cyan}22` : "1px solid transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          transition:"background 0.4s, border-color 0.4s, backdrop-filter 0.4s"
        }}
      >
        <motion.a href="#hero" whileHover={{ scale:1.05 }} style={{
          fontFamily:"'Orbitron',sans-serif", fontSize:"1.05rem", fontWeight:900, letterSpacing:"0.14em", cursor:"none",
          background:`linear-gradient(135deg,${C.cyan},${C.violet})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"
        }}>SM.DEV</motion.a>

        {/* desktop links */}
        <ul style={{ display:"flex", gap:"2rem", alignItems:"center", listStyle:"none",
          ["@media(max-width:680px)"]:{display:"none"} }}>
          {links.slice(0,-1).map(l => (
            <li key={l}>
              <motion.a href={`#${l}`}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.14em",
                  textTransform:"uppercase", color:C.muted2, position:"relative", cursor:"none" }}
                whileHover={{ color:C.white }}
              >
                {l}
                <motion.span
                  style={{ position:"absolute", bottom:-4, left:0, height:1,
                    background:`linear-gradient(90deg,${C.cyan},${C.violet})` }}
                  initial={{ width:0 }}
                  whileHover={{ width:"100%" }}
                  transition={{ duration:0.3 }}
                />
              </motion.a>
            </li>
          ))}
          <li>
            <MagneticBtn href="#contact" style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.14em",
              textTransform:"uppercase", padding:"0.45rem 1rem", border:`1px solid ${C.cyan}`,
              color:C.cyan, background:"transparent", borderRadius:0,
              position:"relative", overflow:"hidden"
            }}>
              <motion.span
                style={{ position:"absolute",inset:0, background:`linear-gradient(135deg,${C.cyan},${C.violet})`, zIndex:0 }}
                initial={{ opacity:0 }} whileHover={{ opacity:1 }} transition={E.fast}
              />
              <span style={{ position:"relative",zIndex:1 }}>Contact</span>
            </MagneticBtn>
          </li>
        </ul>

        {/* hamburger */}
        <motion.button
          onClick={() => setMOpen(v=>!v)}
          style={{ display:"none", flexDirection:"column", gap:5, cursor:"none",
            background:"none", border:"none", padding:4,
            ["@media(max-width:680px)"]:{display:"flex"} }}
          whileTap={{ scale:0.9 }}
        >
          {[0,1,2].map(i=>(
            <motion.span key={i}
              animate={mOpen ? {
                rotate: i===0?45:i===2?-45:0,
                y:      i===0?6.5:i===2?-6.5:0,
                opacity:i===1?0:1
              } : { rotate:0, y:0, opacity:1 }}
              style={{ display:"block",width:22,height:1.5,background:C.white,transformOrigin:"center" }}
              transition={E.fast}
            />
          ))}
        </motion.button>
      </motion.nav>

      {/* mobile menu */}
      <AnimatePresence>
        {mOpen && (
          <motion.div
            initial={{ y:"-110%", opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:"-110%", opacity:0 }}
            transition={E.enter}
            style={{ position:"fixed",top:64,left:0,right:0,zIndex:499,
              background:"rgba(3,5,15,0.97)", backdropFilter:"blur(20px)",
              borderBottom:`1px solid ${C.cyan}22`, padding:"1.5rem 5vw",
              display:"flex",flexDirection:"column",gap:"1rem" }}
          >
            {links.map(l=>(
              <motion.a key={l} href={`#${l}`} onClick={()=>setMOpen(false)}
                whileHover={{ x:6, color:C.cyan }} style={{
                  fontFamily:"'JetBrains Mono',monospace", fontSize:"0.78rem", letterSpacing:"0.12em",
                  textTransform:"uppercase", color:C.muted2, padding:"0.55rem 0",
                  borderBottom:`1px solid ${C.border2}`, display:"block", cursor:"none"
                }}
              >{l}</motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 600], [0, -120]);
  const opParallax = useTransform(scrollY, [0, 400], [1, 0]);

  // Mouse parallax for orbs
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const o1x = useTransform(mouseX, [0,1], [-40, 40]);
  const o1y = useTransform(mouseY, [0,1], [-30, 30]);
  const o2x = useTransform(mouseX, [0,1], [30, -30]);
  const o2y = useTransform(mouseY, [0,1], [20, -20]);

  useEffect(() => {
    const fn = e => { mouseX.set(e.clientX/window.innerWidth); mouseY.set(e.clientY/window.innerHeight); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const heroVariants = {
    container: { hidden:{}, visible:{ transition:{ staggerChildren:0.15, delayChildren:0.1 } } },
    item: { hidden:{ opacity:0, y:44, filter:"blur(6px)" }, visible:{ opacity:1, y:0, filter:"blur(0px)", transition:{ duration:0.75, ease:[0.25,0.46,0.45,0.94] } } }
  };

  return (
    <section id="hero" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      padding:"100px 5vw 80px", position:"relative", overflow:"hidden" }}>

      {/* parallax orbs */}
      <motion.div style={{ position:"absolute",width:600,height:600,borderRadius:"50%",filter:"blur(80px)",
        background:"radial-gradient(circle,rgba(0,229,255,0.09),transparent 70%)", top:"-8%",left:"-8%", x:o1x,y:o1y, pointerEvents:"none" }}/>
      <motion.div style={{ position:"absolute",width:500,height:500,borderRadius:"50%",filter:"blur(80px)",
        background:"radial-gradient(circle,rgba(168,85,247,0.11),transparent 70%)", bottom:"-8%",right:"-4%", x:o2x,y:o2y, pointerEvents:"none" }}/>
      <motion.div
        animate={{ y:[0,-28,0] }} transition={{ duration:8, repeat:Infinity, ease:"easeInOut" }}
        style={{ position:"absolute",width:280,height:280,borderRadius:"50%",filter:"blur(80px)",
          background:"radial-gradient(circle,rgba(244,114,182,0.07),transparent 70%)", top:"45%",right:"18%", pointerEvents:"none" }}
      />

      {/* grid */}
      <div style={{ position:"absolute",inset:0, backgroundImage:`linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)`,
        backgroundSize:"60px 60px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 35%,transparent 100%)" }}/>

      <motion.div style={{ position:"relative",zIndex:2,maxWidth:950,width:"100%", y:yParallax, opacity:opParallax }}>
        <motion.div variants={heroVariants.container} initial="hidden" animate="visible">

          {/* eyebrow */}
          <motion.div variants={heroVariants.item}
            style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", letterSpacing:"0.26em",
              textTransform:"uppercase", color:C.cyan, display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"1.4rem" }}>
            <span style={{ display:"block",width:26,height:1,background:C.cyan }}/>
            <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.2, repeat:Infinity }}
              style={{ width:5,height:5,borderRadius:"50%",background:C.green,
                boxShadow:`0 0 6px ${C.green}`,display:"inline-block" }}/>
            Available for Opportunities
          </motion.div>

          {/* name */}
          <motion.h1 variants={heroVariants.item}
            style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(3.2rem,10vw,8rem)",
              fontWeight:900, lineHeight:0.9, letterSpacing:"0.04em", marginBottom:"0.5rem" }}>
            <span style={{ display:"block", color:C.white }}>SARTHAK</span>
            <motion.span
              style={{ display:"block", background:`linear-gradient(135deg,${C.cyan} 0%,${C.violet} 50%,${C.pink} 100%)`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                backgroundSize:"200% 200%" }}
              animate={{ backgroundPosition:["0% 50%","100% 50%","0% 50%"] }}
              transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
            >MISHRA</motion.span>
          </motion.h1>

          {/* typing */}
          <motion.div variants={heroVariants.item}>
            <TypingText/>
          </motion.div>

          {/* desc */}
          <motion.p variants={heroVariants.item}
            style={{ fontSize:"0.98rem", lineHeight:1.82, color:"rgba(232,244,255,0.52)",
              maxWidth:510, marginBottom:"2.4rem" }}>
            Building scalable, impactful digital solutions with JavaScript, React, and Firebase. 500+ DSA problems solved. Passionate about clean code and real-world impact.
          </motion.p>

          {/* buttons */}
          <motion.div variants={heroVariants.item} style={{ display:"flex",gap:"1rem",flexWrap:"wrap" }}>
            {[
              { label:"View Projects", href:"#projects", primary:true },
              { label:"Download Resume", href:"#", primary:false },
              { label:"Contact Me", href:"#contact", primary:false },
            ].map((b,i)=>(
              <MagneticBtn key={i} href={b.href}
                onClick={!b.href.startsWith("#p")&&!b.href.startsWith("#c") ? e=>{e.preventDefault();alert("Resume coming soon!");} : undefined}
                style={{
                  padding:"0.82rem 1.9rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem",
                  letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700,
                  clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",
                  ...(b.primary
                    ? { background:`linear-gradient(135deg,${C.cyan},${C.violet})`, color:C.bg, border:"none" }
                    : { background:"transparent", color:C.white, border:`1px solid rgba(232,244,255,0.14)` })
                }}
              >
                <motion.span whileHover={{ color: b.primary ? C.bg : C.cyan }} style={{ position:"relative", zIndex:1 }}>
                  {b.label}
                </motion.span>
              </MagneticBtn>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* spinning badge */}
      <motion.div
        initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
        transition={{ delay:2, duration:0.6, ...E.spring }}
        style={{ position:"absolute",right:"5vw",top:"50%",
          width:155,height:155,borderRadius:"50%",
          border:`1px solid ${C.cyan}22`,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          background:"rgba(0,229,255,0.03)", backdropFilter:"blur(10px)" }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:18,repeat:Infinity,ease:"linear" }}
          style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px dashed rgba(0,229,255,0.18)` }}/>
        <motion.div animate={{ rotate:-360 }} transition={{ duration:12,repeat:Infinity,ease:"linear" }}
          style={{ position:"absolute",inset:12,borderRadius:"50%",border:`1px dashed rgba(168,85,247,0.14)` }}/>
        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"2.5rem",fontWeight:900,lineHeight:1,
          background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>500+</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.muted2,textAlign:"center",marginTop:"0.2rem" }}>DSA<br/>Problems</div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.2 }}
        style={{ position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",
          display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.26em",textTransform:"uppercase",color:C.muted }}>Scroll</span>
        <motion.div
          animate={{ scaleY:[1,1.2,1], opacity:[0.3,1,0.3] }}
          transition={{ duration:2,repeat:Infinity,ease:"easeInOut" }}
          style={{ width:1,height:46,background:`linear-gradient(to bottom,${C.cyan},transparent)` }}
        />
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TICKER
───────────────────────────────────────────── */
function Ticker() {
  const items = ["JavaScript","React","Node.js","Firebase","MongoDB","500+ DSA Solved","Python","Spring Boot","PyTorch","MySQL"];
  const doubled = [...items,...items];
  return (
    <div style={{ overflow:"hidden",padding:"0.85rem 0",background:C.bg2,
      borderTop:`1px solid ${C.cyan}22`,borderBottom:`1px solid ${C.cyan}22`,position:"relative",zIndex:1 }}>
      <motion.div
        animate={{ x:["0%","-50%"] }}
        transition={{ duration:22,repeat:Infinity,ease:"linear" }}
        style={{ display:"flex",gap:0,whiteSpace:"nowrap" }}
      >
        {doubled.map((item,i)=>(
          <span key={i} style={{ display:"flex",alignItems:"center",gap:"1.4rem",padding:"0 1.4rem",
            fontFamily:"'Orbitron',sans-serif",fontSize:"0.78rem",letterSpacing:"0.12em",color:C.muted }}>
            {item}
            <span style={{ width:4,height:4,borderRadius:"50%",
              background:`linear-gradient(135deg,${C.cyan},${C.violet})`,display:"inline-block" }}/>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────── */
function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    if (inView && !counted) setCounted(true);
  }, [inView]);

  const Counter = ({ target, suffix="", isFloat=false }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
      if (!counted) return;
      let start=null;
      const dur=1400;
      const step = ts => {
        if (!start) start=ts;
        const p = Math.min((ts-start)/dur, 1);
        const ease = 1-Math.pow(1-p,3);
        setVal(target*ease);
        if (p<1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, [counted]);
    return <>{isFloat ? val.toFixed(2) : Math.floor(val)}{suffix}</>;
  };

  const stats = [
    { target:500, suffix:"+", label:"DSA Problems" },
    { target:8.77, label:"CGPA", isFloat:true },
    { target:2, suffix:"+", label:"Live Projects" },
    { target:2, suffix:"+", label:"Certifications" },
  ];

  return (
    <section id="about" style={{ background:C.bg2, borderTop:`1px solid rgba(255,255,255,0.05)`,
      borderBottom:`1px solid rgba(255,255,255,0.05)`, padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <div ref={ref} style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:"5rem", alignItems:"start", maxWidth:1100, margin:"0 auto" }}>
        <div>
          <SLabel>Who I Am</SLabel>
          <STitle>ABOUT<br/><AC>ME</AC></STitle>
          <StaggerReveal delay={0.2}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:`${C.cyan}22`,border:`1px solid ${C.cyan}22` }}>
              {stats.map((s,i)=>(
                <StaggerItem key={i}>
                  <TiltCard style={{ background:C.bg2,padding:"1.7rem 1.4rem",cursor:"default" }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"2.6rem",fontWeight:900,lineHeight:1,marginBottom:"0.25rem",
                      background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                      <Counter target={s.target} suffix={s.suffix||""} isFloat={s.isFloat}/>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.muted }}>{s.label}</div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerReveal>
        </div>
        <div>
          <Reveal delay={0.1}>
            <p style={{ fontSize:"0.97rem",lineHeight:1.85,color:"rgba(232,244,255,0.6)",marginBottom:"1.5rem" }}>
              I'm a software developer and BCA student at PSIT, Kanpur, with a strong foundation in JavaScript, React, Firebase, and MongoDB. I thrive on turning complex problems into elegant, scalable digital solutions.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize:"0.97rem",lineHeight:1.85,color:"rgba(232,244,255,0.6)",marginBottom:"1.5rem" }}>
              With 500+ DSA problems solved, I bring both the theoretical depth and practical experience needed to build systems that perform at scale. Beyond code, I'm a natural communicator — hosting sessions, mentoring peers, and driving collaborative outcomes.
            </p>
          </Reveal>
          <StaggerReveal delay={0.3}>
            {["Strong leadership & mentoring experience","Certified by Infosys (Python) & Oracle (AI/ML)","Focused on impactful, real-world applications","Open to full-stack & ML opportunities"].map((h,i)=>(
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ x:6, borderColor:C.cyan, color:C.white, background:"rgba(0,229,255,0.04)" }}
                  style={{ display:"flex",alignItems:"center",gap:"0.7rem",
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.04em",color:C.muted2,
                    padding:"0.45rem 0.7rem",borderLeft:"2px solid transparent",transition:"all 0.25s",cursor:"default" }}>
                  <span style={{ color:C.cyan,fontSize:"0.65rem" }}>▸</span>
                  {h}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SKILLS
───────────────────────────────────────────── */
function Skills() {
  const cats = [
    { name:"Web Development", bg:"WEB", tags:["JavaScript","React","Node.js","Express","HTML","CSS","Spring Boot","Firebase","MongoDB","MySQL"] },
    { name:"ML / Data Science", bg:"ML",  tags:["Python","PyTorch","Pandas"] },
    { name:"Core CS",          bg:"CS",   tags:["DSA","DBMS","OOPs","SQL","Java"] },
    { name:"Soft Skills",      bg:"SOFT", tags:["Leadership","Communication","Teamwork","Mentoring"] },
  ];
  return (
    <section id="skills" style={{ maxWidth:1100, margin:"0 auto", padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <SLabel>Technical Skills</SLabel>
      <STitle>MY <AC>STACK</AC></STitle>
      <StaggerReveal delay={0.1}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)" }}>
          {cats.map((cat,i)=>(
            <StaggerItem key={i}>
              <TiltCard style={{ background:C.bg, padding:"1.9rem 1.7rem", cursor:"default" }}>
                <div style={{ position:"absolute",top:-16,right:-12,fontFamily:"'Orbitron',sans-serif",fontSize:"4.5rem",fontWeight:900,color:"rgba(0,229,255,0.04)",pointerEvents:"none",lineHeight:1 }}>{cat.bg}</div>
                <div style={{ position:"relative" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.22em",textTransform:"uppercase",color:C.cyan,marginBottom:"1.1rem" }}>{cat.name}</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:"0.4rem" }}>
                    {cat.tags.map((t,j)=>(
                      <motion.span key={j}
                        whileHover={{ borderColor:C.cyan,color:C.cyan,background:"rgba(0,229,255,0.05)",boxShadow:`0 0 10px rgba(0,229,255,0.1)` }}
                        style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",letterSpacing:"0.05em",
                          padding:"0.26rem 0.62rem",border:`1px solid ${C.cyan}22`,color:C.muted2,cursor:"default",
                          transition:"all 0.2s" }}>
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

/* ─────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────── */
function Projects() {
  const projects = [
    { num:"01", name:"SALE SETU", desc:"Multi-company business management platform with scalable database architecture and fully responsive UI. Built for real-world commerce with robust data handling.", tech:["HTML","CSS","JavaScript","Firebase","MongoDB"], url:"https://salesetu-tracker.netlify.app" },
    { num:"02", name:"LIKHA PADHI", desc:"Educational content platform focused on accessibility and clean user experience. Designed to make quality learning available to every user, everywhere.", tech:["HTML","CSS","JavaScript","Firebase"], url:"https://likha-padhi-3ae36.web.app" },
  ];
  return (
    <section id="projects" style={{ background:C.bg2, borderTop:`1px solid rgba(255,255,255,0.05)`, borderBottom:`1px solid rgba(255,255,255,0.05)`, padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <SLabel>What I've Built</SLabel>
        <STitle>FEATURED <AC>PROJECTS</AC></STitle>
        <StaggerReveal delay={0.1}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)" }}>
            {projects.map((p,i)=>(
              <StaggerItem key={i}>
                <TiltCard style={{ background:C.bg2, padding:"2.4rem 2rem", display:"flex", flexDirection:"column", gap:"0.9rem", minHeight:320 }}>
                  <motion.div
                    style={{ position:"absolute",top:0,left:0,right:0,height:2,
                      background:`linear-gradient(90deg,${C.cyan},${C.violet},${C.pink})`,scaleX:0,transformOrigin:"left" }}
                    whileHover={{ scaleX:1 }}
                    transition={{ duration:0.5 }}
                  />
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"4rem",fontWeight:900,color:"rgba(0,229,255,0.07)",lineHeight:1,position:"absolute",top:"0.9rem",right:"1.2rem" }}>{p.num}</div>
                  <div style={{ position:"relative" }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.6rem",fontWeight:900,letterSpacing:"0.04em",marginBottom:"0.9rem" }}>{p.name}</div>
                    <p style={{ fontSize:"0.87rem",lineHeight:1.72,color:"rgba(232,244,255,0.54)",marginBottom:"0.9rem" }}>{p.desc}</p>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:"0.38rem",marginBottom:"1rem" }}>
                      {p.tech.map((t,j)=>(
                        <span key={j} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",
                          padding:"0.22rem 0.55rem",background:"rgba(0,229,255,0.04)",border:`1px solid ${C.cyan}22`,color:C.cyan }}>{t}</span>
                      ))}
                    </div>
                    <motion.a href={p.url} target="_blank"
                      style={{ display:"inline-flex",alignItems:"center",gap:"0.42rem",fontFamily:"'JetBrains Mono',monospace",
                        fontSize:"0.67rem",letterSpacing:"0.1em",textTransform:"uppercase",color:C.cyan,cursor:"none" }}
                      whileHover={{ gap:"0.75rem", color:C.violet }}>
                      View Live
                      <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                        whileHover={{ x:3,y:-3 }} transition={E.fast}>
                        <path d="M2 10L10 2M10 2H5M10 2V7"/>
                      </motion.svg>
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

/* ─────────────────────────────────────────────
   EDUCATION
───────────────────────────────────────────── */
function Education() {
  const items = [
    { deg:"Bachelor of Computer Applications", sch:"PSIT — Pranveer Singh Institute of Technology, Kanpur", meta:"CGPA: 8.77", year:"2024 – Present" },
    { deg:"12th Grade — CBSE", sch:"Central Board of Secondary Education", meta:"85%", year:"2023" },
    { deg:"10th Grade — CBSE", sch:"Central Board of Secondary Education", meta:"80%", year:"2021" },
  ];
  return (
    <section id="education" style={{ maxWidth:900, margin:"0 auto", padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <SLabel>Academic Path</SLabel>
      <STitle>EDUCATION <AC>PATH</AC></STitle>
      <div style={{ paddingLeft:"2rem", position:"relative" }}>
        <div style={{ position:"absolute",left:0,top:0,bottom:0,width:1,
          background:`linear-gradient(to bottom,${C.cyan},${C.violet},transparent)` }}/>
        <StaggerReveal delay={0.1}>
          {items.map((item,i)=>(
            <StaggerItem key={i} from="left">
              <motion.div
                style={{ position:"relative",padding:"0 0 2.8rem 2.2rem" }}
                whileHover={{ x:4 }}
                transition={E.fast}
              >
                <motion.div
                  initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }}
                  transition={{ delay: i*0.15+0.2, type:"spring", stiffness:300 }}
                  style={{ position:"absolute",left:-5,top:"0.28rem",width:10,height:10,borderRadius:"50%",
                    background:C.cyan,border:`2px solid ${C.bg}`,
                    boxShadow:`0 0 12px ${C.cyan},0 0 24px rgba(0,229,255,0.3)` }}
                />
                <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.35rem",fontWeight:900,letterSpacing:"0.03em",marginBottom:"0.25rem" }}>{item.deg}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",color:C.cyan,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.4rem" }}>{item.sch}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:C.muted }}>
                  <span style={{ color:C.violet,marginRight:"0.7rem" }}>{item.meta}</span>{item.year}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ACHIEVEMENTS
───────────────────────────────────────────── */
function Achievements() {
  const items = [
    { icon:<path d="M7 4.5v2.5l1.5 1"/>, circle:true, title:"500+ DSA Problems", desc:"solved across platforms, demonstrating strong algorithmic and analytical thinking." },
    { icon:<><rect x="2" y="3.5" width="10" height="8" rx="1"/><path d="M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1"/></>, title:"Python Certification", desc:"from Infosys — validated industry-level programming fundamentals." },
    { icon:<path d="M7 1.5l1.3 2.6 2.9.42-2.1 2.05.5 2.9L7 8.1 4.4 9.47l.5-2.9L2.8 4.52l2.9-.42z"/>, title:"AI/ML Certification", desc:"from Oracle — advanced program in artificial intelligence and machine learning." },
    { icon:<path d="M2 8.5l3-3 2.5 2.5 4.5-5.5"/>, title:"Sessions & Mentoring", desc:"hosted workshops and mentored peers, building a stronger community learning culture." },
  ];
  return (
    <section id="achievements" style={{ background:C.bg2, borderTop:`1px solid rgba(255,255,255,0.05)`, padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <SLabel>Recognition</SLabel>
        <STitle>ACHIEVEMENTS <AC>&amp; CERTS</AC></STitle>
        <StaggerReveal delay={0.1}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)" }}>
            {items.map((item,i)=>(
              <StaggerItem key={i}>
                <TiltCard style={{ background:C.bg2, padding:"1.7rem 1.5rem", display:"flex", alignItems:"flex-start", gap:"0.9rem", cursor:"default" }}>
                  <motion.div
                    whileHover={{ background:"rgba(0,229,255,0.08)", boxShadow:`0 0 12px rgba(0,229,255,0.15)` }}
                    style={{ width:32,height:32,minWidth:32,display:"flex",alignItems:"center",justifyContent:"center",
                      border:`1px solid ${C.cyan}22`,color:C.cyan,background:"rgba(0,229,255,0.04)",transition:"all 0.25s" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                      {item.circle && <circle cx="7" cy="7" r="5.5"/>}
                      {item.icon}
                    </svg>
                  </motion.div>
                  <div style={{ fontSize:"0.86rem",lineHeight:1.65,color:"rgba(232,244,255,0.68)" }}>
                    <strong style={{ color:C.white,fontWeight:600 }}>{item.title}</strong> {item.desc}
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

/* ─────────────────────────────────────────────
   INTERESTS
───────────────────────────────────────────── */
function Interests() {
  const chips = ["Poetry","Public Speaking","Continuous Learning","Fitness"];
  return (
    <section id="interests" style={{ maxWidth:900, margin:"0 auto", padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <SLabel>Beyond Code</SLabel>
      <STitle>MY <AC>INTERESTS</AC></STitle>
      <Reveal>
        <div style={{ display:"flex",flexWrap:"wrap",gap:"1rem" }}>
          {chips.map((c,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              transition={{ delay: i*0.1+0.1 }}
              whileHover={{ borderColor:C.cyan, color:C.white, y:-2 }}
              style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.1rem",fontWeight:900,letterSpacing:"0.08em",
                padding:"0.65rem 1.5rem",border:`1px solid ${C.cyan}22`,color:C.muted,
                position:"relative",overflow:"hidden",cursor:"default",transition:"color 0.3s,border-color 0.3s" }}>
              <motion.div
                style={{ position:"absolute",inset:0,background:`linear-gradient(135deg,rgba(0,229,255,0.08),rgba(168,85,247,0.08))`,translateX:"-100%" }}
                whileHover={{ translateX:"0%" }}
                transition={{ duration:0.4 }}
              />
              <span style={{ position:"relative" }}>{c}</span>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CONTACT
───────────────────────────────────────────── */
function Contact() {
  return (
    <section id="contact" style={{ background:C.bg, padding:"110px 5vw", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem" }}>
        <div>
          <SLabel>Let's Connect</SLabel>
          <STitle>GET IN <AC>TOUCH</AC></STitle>
          <Reveal delay={0.1}>
            <p style={{ fontSize:"0.97rem",lineHeight:1.8,color:"rgba(232,244,255,0.54)",marginBottom:"2.4rem" }}>
              Open to internships, collaborations, and full-time opportunities. Let's build something great together.
            </p>
          </Reveal>
          <StaggerReveal delay={0.2}>
            {[
              { label:"Phone",    val:"+91 8429670087",                  href:"tel:+918429670087",         icon:<path d="M2 1.5a1 1 0 011-1h1.6l.9 2.7-1.3 1.3A8.5 8.5 0 007.5 9.8l1.3-1.3 2.7.9v1.6a1 1 0 01-1 1A10.5 10.5 0 012 1.5z"/> },
              { label:"Email",    val:"sarthakmishra010@gmail.com",       href:"mailto:sarthakmishra010@gmail.com", icon:<><rect x="1" y="2" width="11" height="9" rx="1"/><path d="M1 3l5.5 4L12 3"/></> },
              { label:"Location", val:"Kanpur, Uttar Pradesh, India",     href:null,                        icon:<><path d="M6.5 1a3.5 3.5 0 013.5 3.5C10 7.5 6.5 12 6.5 12S3 7.5 3 4.5A3.5 3.5 0 016.5 1z"/><circle cx="6.5" cy="4.5" r="1.3"/></> },
            ].map((item,i)=>(
              <StaggerItem key={i}>
                <motion.a href={item.href||undefined}
                  whileHover={{ x:8, borderColor:`${C.cyan}44`, background:C.bg3 }}
                  style={{ display:"flex",alignItems:"center",gap:"0.9rem",padding:"0.85rem 1rem",
                    border:`1px solid rgba(255,255,255,0.05)`,background:C.bg2,cursor:item.href?"none":"default",
                    marginBottom:"0.8rem",transition:"all 0.3s" }}>
                  <div style={{ width:32,height:32,minWidth:32,display:"flex",alignItems:"center",justifyContent:"center",
                    background:"rgba(0,229,255,0.05)",color:C.cyan,border:`1px solid ${C.cyan}22` }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">{item.icon}</svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:"0.1rem" }}>{item.label}</div>
                    <div style={{ fontSize:"0.86rem",color:C.white }}>{item.val}</div>
                  </div>
                </motion.a>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
        <Reveal delay={0.15}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:"0.9rem" }}>Find me on</div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.55rem",marginBottom:"1.8rem" }}>
              {[{label:"LinkedIn",href:"https://linkedin.com/in/sarthak-mishra-1a8041306"},{label:"GitHub",href:"#"}].map((s,i)=>(
                <motion.a key={i} href={s.href} target="_blank"
                  whileHover={{ x:8, borderColor:C.cyan, color:C.cyan, background:"rgba(0,229,255,0.03)" }}
                  style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.85rem 1rem",
                    border:`1px solid rgba(255,255,255,0.05)`,background:C.bg2,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",
                    color:C.muted2,cursor:"none",transition:"all 0.3s" }}>
                  {s.label}
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 9L9 2M9 2H4.5M9 2V6.5"/></svg>
                </motion.a>
              ))}
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.muted,marginBottom:"0.9rem" }}>Quick Message</div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.65rem" }}>
              {["Your Name","your@email.com"].map((ph,i)=>(
                <motion.input key={i} placeholder={ph} type={i===1?"email":"text"}
                  whileFocus={{ borderColor:C.cyan, boxShadow:`0 0 14px rgba(0,229,255,0.08)` }}
                  style={{ background:C.bg2,border:`1px solid rgba(255,255,255,0.05)`,padding:"0.82rem 1rem",color:C.white,
                    fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",outline:"none",width:"100%",letterSpacing:"0.04em",
                    transition:"border-color 0.25s,box-shadow 0.25s" }}
                />
              ))}
              <motion.textarea placeholder="Your message..." rows={4}
                whileFocus={{ borderColor:C.cyan, boxShadow:`0 0 14px rgba(0,229,255,0.08)` }}
                style={{ background:C.bg2,border:`1px solid rgba(255,255,255,0.05)`,padding:"0.82rem 1rem",color:C.white,
                  fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",outline:"none",width:"100%",letterSpacing:"0.04em",
                  resize:"none",transition:"border-color 0.25s,box-shadow 0.25s" }}
              />
              <MagneticBtn onClick={()=>alert("Demo — integrate your backend!")}
                style={{ alignSelf:"flex-start",padding:"0.82rem 1.9rem",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,
                  background:`linear-gradient(135deg,${C.cyan},${C.violet})`,color:C.bg,border:"none",
                  clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))" }}>
                Send Message
              </MagneticBtn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <motion.footer
      initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
      style={{ borderTop:`1px solid rgba(255,255,255,0.05)`,padding:"1.8rem 5vw",display:"flex",
        alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",
        position:"relative",zIndex:1 }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1rem",fontWeight:900,letterSpacing:"0.12em",
        background:`linear-gradient(135deg,${C.cyan},${C.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>SM.DEV</div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.1em",color:C.muted }}>© 2025 Sarthak Mishra. All rights reserved.</div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",color:C.muted }}>
        Built with <span style={{ color:C.cyan }}>precision &amp; passion</span>
      </div>
    </motion.footer>
  );
}

/* ─────────────────────────────────────────────
   GLOW DIVIDER
───────────────────────────────────────────── */
const GlowDiv = () => (
  <div style={{ height:1,background:`linear-gradient(to right,transparent,${C.cyan},${C.violet},transparent)`,opacity:0.28,position:"relative",zIndex:1 }}/>
);

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <FontLink/>
      <Loader onDone={() => { setLoaded(true); document.body.style.overflow = "auto"; }}/>
      <Cursor/>
      <SpaceCanvas/>
      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.5 }}
          >
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
