/* Cinematic hero background (WebGL light field + optional duotone video)
   and the scroll-lit philosophy statement. */
(() => {
  'use strict';
  const cfg = window.SITE_CONFIG || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');

  /* ---------- optional background video (shown in duotone via CSS blend) ---------- */
  if (cfg.heroVideo && !reduceMotion && !navigator.connection?.saveData) {
    const v = Object.assign(document.createElement('video'), { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'metadata' });
    v.setAttribute('aria-hidden', 'true');
    v.src = cfg.heroVideo;
    document.querySelector('.hero-video').appendChild(v);
  }

  /* ---------- WebGL light field ---------- */
  const canvas = document.querySelector('.hero-canvas');
  const gl = canvas && canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { hero.classList.add('no-gl'); }
  else {
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y + m*.06;
  float T=t*.045;
  vec2 q=vec2(fbm(p*1.5+T),fbm(p*1.5-T+5.2));
  vec2 w=vec2(fbm(p*1.3+2.2*q+vec2(1.7,9.2)+T*1.4),fbm(p*1.3+2.2*q+vec2(8.3,2.8)-T));
  float f=fbm(p*1.1+2.6*w);
  vec3 base=vec3(.012,.012,.03);
  vec3 indigo=vec3(.20,.18,.80), violet=vec3(.55,.33,1.), cyan=vec3(.20,.85,.98);
  vec3 col=mix(base,indigo,smoothstep(.2,.68,f));
  col=mix(col,violet,smoothstep(.3,.9,length(q)-.2)*.8);
  col=mix(col,cyan,smoothstep(.48,.88,w.y*f*1.8)*.6);
  float wide=smoothstep(-.15,.9,uv.x)*(.6+.5*uv.y);
  float tall=.35+.8*smoothstep(.95,.15,uv.y);
  float light=mix(tall,wide,step(r.y,r.x));
  col*=(.2+1.55*light)*(.4+f*1.15);
  gl_FragColor=vec4(col,1.);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { hero.classList.add('no-gl'); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm');

    // Render at reduced resolution: the field is soft by design, and this keeps it cheap.
    const SCALE = 0.45;
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * SCALE)), h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uR, w, h);
    };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    hero.addEventListener('pointermove', e => {
      mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
      mouse.ty = (0.5 - e.clientY / innerHeight) * 2;
    });

    let visible = true, last = 0, raf = 0;
    const start = performance.now() - 20000; // start mid-flow, not from a blank state
    const draw = now => {
      raf = 0;
      if (now - last >= 33) { // ~30fps is plenty for slow motion
        last = now;
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        gl.uniform1f(uT, (now - start) / 1000);
        gl.uniform2f(uM, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      loop();
    };
    const loop = () => { if (!raf && visible && !document.hidden && !reduceMotion) raf = requestAnimationFrame(draw); };

    resize();
    gl.uniform1f(uT, 20); gl.uniform2f(uM, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3); // first frame (and the only one with reduced motion)
    hero.classList.add('gl-ready');
    addEventListener('resize', () => { resize(); if (reduceMotion) gl.drawArrays(gl.TRIANGLES, 0, 3); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(hero);
    document.addEventListener('visibilitychange', loop);
    loop();
  }

  /* ---------- philosophy: words light up as you scroll ---------- */
  const text = document.querySelector('[data-words]');
  if (text) {
    const wrap = node => {
      [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.append(part);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); }
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) wrap(c);
      });
    };
    wrap(text);
    const words = [...text.querySelectorAll('.w')];
    if (reduceMotion) words.forEach(w => w.classList.add('lit'));
    else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = text.getBoundingClientRect();
        // 0 when the text's top reaches 85% of the viewport, 1 when its bottom reaches 45%
        const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.4)));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('lit', i < n));
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }
})();
