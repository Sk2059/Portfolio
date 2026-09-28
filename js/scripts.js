(function(){
  "use strict";

  /* ============ CONFIGURATION ============ */
  // Replace with your production endpoint to enable real email sending.
  // The endpoint should accept: POST JSON { name, email, subject, message }
  // Leave as empty string to stay in simulated mode (shows a UI demo only).
  var CONTACT_ENDPOINT = '';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 900 || ('ontouchstart' in window && window.innerWidth < 1024);
  var hasWebGL = (function(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    }catch(e){ return false; }
  })();

  /* ============ HERO REVEAL + SPOTLIGHT + MAGNETIC BUTTONS ============ */
  var heroCopy = document.getElementById('hero-copy');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ heroCopy.classList.add('play'); }); });

  var spotlight = document.getElementById('hero-spotlight');
  var heroEl = document.getElementById('home');
  if(spotlight && !reduceMotion && !isMobile){
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      spotlight.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100) + '%');
      spotlight.style.setProperty('--my', ((e.clientY - r.top)/r.height*100) + '%');
    });
  }

  if(!reduceMotion && !isMobile){
    document.querySelectorAll('.hero-actions .btn, .nav-cta .btn-primary').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * 0.28;
        var y = (e.clientY - r.top - r.height/2) * 0.5;
        btn.style.transform = 'translate('+x+'px,'+(y-2)+'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }

  /* ============ NAV BEHAVIOR ============ */
  var nav = document.getElementById('site-nav');
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('solid'); } else { nav.classList.remove('solid'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var navLinks = document.querySelectorAll('[data-nav]');
  var navLinksM = document.querySelectorAll('[data-nav-m]');
  var sections = ['home','about','skills','projects','contact'].map(function(id){ return document.getElementById(id); });

  function setActive(id){
    navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+id); });
    navLinksM.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+id); });
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ setActive(e.target.id); } });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(function(s){ if(s) io.observe(s); });

  /* ============ FADE UP REVEAL ============ */
  var fadeEls = document.querySelectorAll('.fade-up');
  var revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { threshold:0.15 });
  fadeEls.forEach(function(el){ revealIO.observe(el); });

  /* ============ PORTRAIT PARALLAX ============ */
  var stage = document.getElementById('portrait-stage');
  var portraitWrap = document.querySelector('.hero-portrait-wrap');
  if(stage && !reduceMotion){
    if(isMobile){
      // Ambient "alive" tilt by default on mobile — no interaction required.
      stage.classList.add('auto-tilt');

      var gyroActive = false;
      function applyGyroTilt(gamma, beta){
        if(!gyroActive){ gyroActive = true; stage.classList.remove('auto-tilt'); }
        var x = Math.max(-1, Math.min(1, gamma/45));
        var y = Math.max(-1, Math.min(1, (beta-45)/45));
        stage.style.transform = 'rotateY('+(x*11)+'deg) rotateX('+(-y*9)+'deg)';
      }
      function onOrientation(e){
        if(e.gamma === null || e.beta === null) return;
        applyGyroTilt(e.gamma, e.beta);
      }
      function enableGyro(){
        if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
          DeviceOrientationEvent.requestPermission().then(function(res){
            if(res === 'granted'){ window.addEventListener('deviceorientation', onOrientation); }
          }).catch(function(){});
        } else if(typeof DeviceOrientationEvent !== 'undefined'){
          window.addEventListener('deviceorientation', onOrientation);
        }
        document.removeEventListener('touchend', enableGyro);
      }
      document.addEventListener('touchend', enableGyro, { once:true, passive:true });

      // Direct-touch drag tilt on the portrait itself, as an additional interactive layer.
      portraitWrap.addEventListener('touchmove', function(e){
        if(!e.touches || !e.touches[0]) return;
        stage.classList.remove('auto-tilt');
        var r = stage.getBoundingClientRect();
        var t = e.touches[0];
        var x = (t.clientX - r.left)/r.width - 0.5;
        var y = (t.clientY - r.top)/r.height - 0.5;
        stage.style.transform = 'rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg)';
      }, { passive:true });
      portraitWrap.addEventListener('touchend', function(){
        if(!gyroActive){ stage.style.transform = ''; stage.classList.add('auto-tilt'); }
      });
    } else {
      portraitWrap.addEventListener('mousemove', function(e){
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - 0.5;
        var y = (e.clientY - r.top)/r.height - 0.5;
        stage.style.transform = 'rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)';
      });
      portraitWrap.addEventListener('mouseleave', function(){
        stage.style.transform = 'rotateY(0) rotateX(0)';
      });
    }
  }

  /* ============ HERO FLOW PACKET ANIMATION ============ */
  (function(){
    var track = document.getElementById('flow-track');
    if(!track || isMobile) return;
    var packet = document.createElement('div');
    packet.className = 'flow-packet';
    track.appendChild(packet);
    if(reduceMotion) return;
    var start = null, dur = 4200;
    function step(ts){
      if(!start) start = ts;
      var p = ((ts - start) % dur) / dur;
      packet.style.left = (p*100) + '%';
      packet.style.opacity = p < 0.05 || p > 0.95 ? '0' : '1';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  /* ============ TECH LOGO MAP — inline SVG, zero external dependency ============ */
  var SVG_ICON_MAP = {
    'React': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#61DAFB" stroke-width="1"><circle cx="12" cy="12" r="2.1" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="10" ry="4.3"/><ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(120 12 12)"/></svg>',
    'TypeScript': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#3178C6"/><text x="12" y="16.5" font-family="monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">TS</text></svg>',
    'JavaScript': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#F7DF1E"/><text x="12" y="16.5" font-family="monospace" font-size="10" font-weight="700" fill="#111" text-anchor="middle">JS</text></svg>',
    'Tailwind CSS': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#38BDF8"><path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.11 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.48 6 12 6Z"/><path d="M7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C8.39 16.85 9.52 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.48 12 7 12Z"/></svg>',
    'HTML': '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M3.5 2h17l-1.55 17.5L12 22l-6.95-2.5L3.5 2Z" fill="#E34F26"/><path d="M12 4v16.35l5.6-1.6L18.9 4H12Z" fill="#EF652A"/></svg>',
    'CSS': '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M3.5 2h17l-1.55 17.5L12 22l-6.95-2.5L3.5 2Z" fill="#264DE4"/><path d="M12 4v16.35l5.6-1.6L18.9 4H12Z" fill="#2965F1"/></svg>',
    'Framer Motion': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#0055FF"/><text x="12" y="16" font-family="monospace" font-size="8" font-weight="700" fill="#fff" text-anchor="middle">FM</text></svg>',
    'Python': '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2c-4 0-4 2-4 2v3h5v1H6s-3 0-3 5 3 5 3 5h2v-3s0-2 2-2h5s3 0 3-3V6s0-4-6-4Zm-2 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="#3776AB"/><path d="M12 22c4 0 4-2 4-2v-3h-5v-1h7s3 0 3-5-3-5-3-5h-2v3s0 2-2 2H9s-3 0-3 3v4s0 4 6 4Zm2-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFD43B"/></svg>',
    'FastAPI': '<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="10" fill="#009688"/><path d="M13 4 6 13h5l-1 7 7-9h-5l1-7Z" fill="#fff"/></svg>',
    'Django': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#092E20"/><text x="12" y="16" font-family="monospace" font-size="9" font-weight="700" fill="#44B78B" text-anchor="middle">Dj</text></svg>',
    'DRF': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#A30000"/><text x="12" y="15.5" font-family="monospace" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle">DRF</text></svg>',
    'REST APIs': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13M17 8l-3-3M17 8l-3 3"/><path d="M20 16H7M7 16l3-3M7 16l3 3"/></svg>',
    'JWT Auth': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    'PostgreSQL': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#336791" stroke-width="1.8"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>',
    'MySQL': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#00758F" stroke-width="1.8"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>',
    'SQL': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/></svg>',
    'Supabase': '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M13.5 2 4 14h7l-1 8 9.5-13h-7l1-7Z" fill="#3ECF8E"/></svg>',
    'Vector DB': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="2" fill="currentColor" stroke="none"/><path d="M6.7 7.2 17.3 7.2M6 7.5 11.3 16.3M18 7.5 12.7 16.3"/></svg>',
    'LLM APIs': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    'RAG': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h9"/><path d="M14 2l5 5v3"/><circle cx="15.5" cy="16.5" r="3"/><path d="M18 19l3 3"/></svg>',
    'AI Agents': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="2"/><circle cx="9" cy="13.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r="1.3" fill="currentColor" stroke="none"/><path d="M12 8V4M9 4h6"/></svg>',
    'Prompt Eng.': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>',
    'scikit-learn': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#F89939"/><text x="12" y="16" font-family="monospace" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">sk</text></svg>',
    'XGBoost': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#EB6E4B"/><text x="12" y="15.5" font-family="monospace" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle">XGB</text></svg>',
    'pandas': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#150458"/><text x="12" y="16" font-family="monospace" font-size="8.5" font-weight="700" fill="#E70488" text-anchor="middle">pd</text></svg>',
    'NumPy': '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect width="24" height="24" rx="4" fill="#4DABCF"/><text x="12" y="16" font-family="monospace" font-size="8.5" font-weight="700" fill="#013243" text-anchor="middle">np</text></svg>',
    'Docker': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#2496ED"><rect x="2" y="10.5" width="3.6" height="3.6"/><rect x="6.4" y="10.5" width="3.6" height="3.6"/><rect x="10.8" y="10.5" width="3.6" height="3.6"/><rect x="6.4" y="6" width="3.6" height="3.6"/><path d="M1 14.5c.3 4 4.3 6 9 6 6.2 0 11-3 12.4-8.4-.9.4-2 .3-2.7-.3-.9.8-2.7.9-3.6.1-.9.8-2.6.9-3.6 0-.7.6-1.9.7-2.8.3-.9.5-2.1.5-2.9-.2-.8.5-1.8.6-2.6.2A5.9 5.9 0 0 1 1 14.5Z"/></svg>',
    'Git': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F05033" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="2.1" fill="#F05033" stroke="none"/><circle cx="6" cy="18" r="2.1" fill="#F05033" stroke="none"/><circle cx="18" cy="12" r="2.1" fill="#F05033" stroke="none"/><path d="M6 8.2V15.8M8.4 12H15.6C15.6 10 14 8.5 12 8.5"/></svg>',
    'GitHub': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#F4F6FB"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55C20.71 21.39 24 17.07 24 12 24 5.65 18.35.5 12 .5Z"/></svg>',
    'Vercel': '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 3 L22 20 H2 Z" fill="#fff"/></svg>',
    'Render': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#46E3B7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v12M7 8l5-6 5 6"/><path d="M5 14c0 4 3 7 7 7s7-3 7-7"/></svg>',
    'Pytest': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#0A9EDC" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
    'Redis': '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="#DC382D"><rect x="9" y="2" width="6" height="6" transform="rotate(45 12 5)"/><rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)"/><rect x="9" y="16" width="6" height="6" transform="rotate(45 12 19)"/></svg>',
    'Node.js': '<svg viewBox="0 0 24 24" width="1em" height="1em"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#539E43"/></svg>'
  };
  function techIcon(name, size, color){
    var svg = SVG_ICON_MAP[name];
    if(!svg) return null;
    return '<span style="display:inline-flex;font-size:'+size+'px;line-height:0;'+(color?('color:'+color+';'):'')+'" aria-hidden="true">'+svg+'</span>';
  }

  /* ============ SKILLS DATA ============ */
  var skills = [
    {name:'React', cat:'frontend', tip:'Component-driven interfaces', color:'#3E7BFA'},
    {name:'TypeScript', cat:'frontend', tip:'Typed application logic', color:'#3E7BFA'},
    {name:'Tailwind CSS', cat:'frontend', tip:'Utility-first styling', color:'#22D3EE'},
    {name:'HTML', cat:'frontend', tip:'Semantic structure', color:'#22D3EE'},
    {name:'CSS', cat:'frontend', tip:'Layout & motion', color:'#22D3EE'},
    {name:'Framer Motion', cat:'frontend', tip:'Interface animation', color:'#7C5CFF'},
    {name:'Python', cat:'backend', tip:'Core backend language', color:'#7C5CFF'},
    {name:'FastAPI', cat:'backend', tip:'Async API framework', color:'#22D3EE'},
    {name:'Django', cat:'backend', tip:'Full-stack web framework', color:'#3E7BFA'},
    {name:'DRF', cat:'backend', tip:'Django REST Framework', color:'#3E7BFA'},
    {name:'REST APIs', cat:'backend', tip:'Service communication', color:'#7C5CFF'},
    {name:'JWT Auth', cat:'backend', tip:'Token-based authentication', color:'#7C5CFF'},
    {name:'PostgreSQL', cat:'database', tip:'Relational data store', color:'#3E7BFA'},
    {name:'MySQL', cat:'database', tip:'Relational data store', color:'#3E7BFA'},
    {name:'SQL', cat:'database', tip:'Query language', color:'#3E7BFA'},
    {name:'Supabase', cat:'database', tip:'Managed Postgres + auth', color:'#22D3EE'},
    {name:'Vector DB', cat:'database', tip:'Embeddings for RAG', color:'#7C5CFF'},
    {name:'LLM APIs', cat:'ai', tip:'OpenAI · Anthropic', color:'#C9A961'},
    {name:'RAG', cat:'ai', tip:'Retrieval-augmented generation', color:'#C9A961'},
    {name:'AI Agents', cat:'ai', tip:'Autonomous task orchestration', color:'#C9A961'},
    {name:'Prompt Eng.', cat:'ai', tip:'Designing model behavior', color:'#C9A961'},
    {name:'scikit-learn', cat:'ai', tip:'Classical ML models', color:'#7C5CFF'},
    {name:'XGBoost', cat:'ai', tip:'Gradient-boosted models', color:'#7C5CFF'},
    {name:'pandas', cat:'ai', tip:'Data wrangling', color:'#7C5CFF'},
    {name:'NumPy', cat:'ai', tip:'Numerical computing', color:'#7C5CFF'},
    {name:'Docker', cat:'devops', tip:'Containerized environments', color:'#22D3EE'},
    {name:'Git', cat:'devops', tip:'Version control', color:'#22D3EE'},
    {name:'GitHub', cat:'devops', tip:'Source hosting & CI', color:'#22D3EE'},
    {name:'Vercel', cat:'devops', tip:'Frontend deployment', color:'#3E7BFA'},
    {name:'Render', cat:'devops', tip:'Backend deployment', color:'#3E7BFA'},
    {name:'Pytest', cat:'devops', tip:'Automated testing', color:'#22D3EE'}
  ];
  var skillsGrid = document.getElementById('skills-grid');
  function initials(n){ return n.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase(); }
  function renderSkills(filter){
    skillsGrid.innerHTML = '';
    var list = skills.filter(function(s){ return filter==='all' || s.cat===filter; });
    list.forEach(function(s, i){
      var card = document.createElement('div');
      card.className = 'skill-card fade-up';
      card.tabIndex = 0;
      var icon = techIcon(s.name, 22);
      var glyphInner = icon ? icon : initials(s.name);
      card.innerHTML = '<div class="skill-glyph" style="background:'+s.color+'22; color:'+s.color+'; border:1px solid '+s.color+'55;">'+glyphInner+'</div>'+
        '<div class="skill-name">'+s.name+'</div>'+
        '<div class="skill-cat">'+s.cat+'</div>'+
        '<div class="skill-tip">'+s.tip+'</div>';
      if(!reduceMotion){
        card.addEventListener('mousemove', function(e){
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left)/r.width - 0.5;
          var y = (e.clientY - r.top)/r.height - 0.5;
          card.style.transform = 'rotateY('+(x*12)+'deg) rotateX('+(-y*12)+'deg) translateY(-4px)';
        });
        card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
      }
      skillsGrid.appendChild(card);
      revealIO.observe(card);
      card.style.transitionDelay = Math.min(i*45,360) + 'ms';
    });
  }
  renderSkills('all');
  document.querySelectorAll('.skill-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.skill-tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      renderSkills(tab.dataset.cat);
    });
  });

  /* ============ PROJECTS DATA ============ */
  var projects = [
    {
      slug:'farmers-marketplace', featured:true, category:'Full-Stack · Capstone',
      title:"Local Farmers' Marketplace", colors:['#7C5CFF','#22D3EE'],
      desc:'A B.Sc. CSIT capstone e-commerce platform connecting farmers in Koshi Province directly with buyers, using a hybrid backend for transactions and real-time features.',
      stack:['React','Django REST Framework','FastAPI','PostgreSQL','Redis','Cloudinary','Khalti'],
      github:'https://github.com/Sk2059', live:null,
      overview:"A solo capstone e-commerce platform designed to connect local farmers with buyers directly, cutting out unnecessary middlemen in the supply chain.",
      problem:"Farmers in Koshi Province had limited digital channels to reach buyers directly, relying on intermediaries that reduced their margins and made pricing opaque.",
      solution:"A React storefront backed by a hybrid API layer: Django REST Framework handles the core transactional data (listings, orders, payments), while FastAPI powers realtime and intelligence-oriented features.",
      features:['Farmer & buyer account roles','Product listings with media via Cloudinary','Order and payment flow integrated with Khalti','Realtime features served through FastAPI','Redis-backed caching for performance'],
      flow:['React','Django REST Framework','PostgreSQL','FastAPI (realtime)','Redis'],
      challenges:'Coordinating two backend frameworks (Django and FastAPI) around a single PostgreSQL data model, and keeping payment flows (Khalti) reliable and testable.',
      results:'Produced full SRS-style academic documentation alongside working hybrid-architecture code as the sixth-semester capstone project.'
    },
    {
      slug:'real-estate-platform', category:'Full-Stack',
      title:'Real Estate Platform', colors:['#3E7BFA','#22D3EE'],
      desc:'A full-stack real estate platform for browsing, managing, and presenting property listings through a modern frontend and scalable backend.',
      stack:['React','Django','PostgreSQL','REST API'],
      github:'https://github.com/Sk2059/Realstate-project', live:null,
      overview:'A property listing platform built at ClickDigitals, giving clients a frontend to browse listings and an admin-side backend to manage them.',
      problem:'Clients needed a maintainable way to publish and manage property listings without relying on static pages.',
      solution:'A Django backend exposes REST endpoints for property data, consumed by a React frontend for browsing, filtering, and detail views.',
      features:['Property listing & detail pages','Search and filtering','Admin-managed listings','REST API layer separating frontend and backend'],
      flow:['React','Django','REST API','PostgreSQL'],
      challenges:'Structuring the data model to support flexible property attributes while keeping queries efficient.',
      results:'Delivered as a production system at ClickDigitals for real client use.'
    },
    {
      slug:'employee-management', category:'Full-Stack',
      title:'Employee Management System', colors:['#3E7BFA','#7C5CFF'],
      desc:'An internal admin dashboard for managing 50+ staff — employee records, attendance, and CRUD operations.',
      stack:['Django','DRF','PostgreSQL'],
      github:'https://github.com/Sk2059/Companysite-with-HRmanagementsystem', live:null,
      overview:'An HR management dashboard built to handle day-to-day employee administration for a company with 50+ staff.',
      problem:'Manual employee record-keeping did not scale and made attendance tracking error-prone.',
      solution:'A Django + DRF backend with role-based access, exposing CRUD operations for employee records and attendance through a structured admin dashboard.',
      features:['Employee record CRUD','Attendance tracking','Role-based access control','JWT-authenticated API'],
      flow:['Admin Dashboard','Django REST Framework','PostgreSQL'],
      challenges:'Designing permissions so different roles (admin vs. staff) see only what they should.',
      results:'In active use for internal company operations.'
    },
    {
      slug:'dental-platform', category:'Full-Stack',
      title:'Dental Hospital Platform', colors:['#22D3EE','#3E7BFA'],
      desc:'A modern hospital website for Sayapatri Dental Hospital with appointment booking functionality.',
      stack:['TypeScript','React'],
      github:'https://github.com/Sk2059/DentalProject', live:null,
      overview:'A client-facing website for a dental hospital, focused on presenting services clearly and letting patients request appointments.',
      problem:'The hospital needed an approachable, modern web presence with a working appointment flow, not just a static brochure site.',
      solution:'A TypeScript + React frontend structured around services, doctors, and an appointment request form.',
      features:['Service & doctor listings','Appointment request form','Responsive, patient-friendly layout'],
      flow:['React (TypeScript)','Appointment Form','Backend/API'],
      challenges:'Keeping the interface calm and easy to navigate for a non-technical patient audience.',
      results:'Delivered as part of ClickDigitals freelance/client portfolio work.'
    },
    {
      slug:'blog-api-platform', category:'Backend · API',
      title:'Professional Blog API Platform', colors:['#22D3EE','#7C5CFF'],
      desc:'A documented, production-style blog backend built with FastAPI, async SQLAlchemy, Redis, and Docker.',
      stack:['FastAPI','PostgreSQL','SQLAlchemy','Redis','Docker'],
      github:null, live:null,
      overview:'A backend-focused project modeling a real blogging platform: posts, authors, and caching, built the way a production API would be.',
      problem:'Wanted a reference-quality FastAPI project demonstrating async patterns, caching, and containerized deployment rather than a toy CRUD demo.',
      solution:'FastAPI with async SQLAlchemy models backed by PostgreSQL, Redis for caching hot reads, and Docker for reproducible environments.',
      features:['Async request handling','Redis-backed caching layer','Dockerized local & deployment environment','18-page written documentation with a Level-0 context diagram'],
      flow:['FastAPI','SQLAlchemy (async)','PostgreSQL','Redis Cache'],
      challenges:'Designing the caching layer so it invalidates correctly without stale reads.',
      results:'Documented end-to-end with architecture diagrams as a portfolio reference project.'
    },
    {
      slug:'nepal-house-price', category:'Machine Learning',
      title:'Nepal House Price Prediction', colors:['#C9A961','#7C5CFF'],
      desc:'A machine learning model predicting house prices from real estate data scraped for the Nepali market.',
      stack:['Python','XGBoost','scikit-learn','pandas'],
      github:'https://github.com/Sk2059/Nepal-House-Price-Prediction', live:null,
      overview:'An ML project estimating property prices in Nepal, built on a self-scraped real-estate dataset.',
      problem:'Public, structured housing price data for the Nepali market is scarce, making price estimation guesswork.',
      solution:'Scraped listing data, engineered features from it, and trained an XGBoost regression model with scikit-learn and pandas for preprocessing.',
      features:['Custom data scraping pipeline','Feature engineering on location & property attributes','XGBoost regression model','Evaluation against baseline models'],
      flow:['Scraper','pandas (cleaning)','XGBoost Model','Prediction Output'],
      challenges:'Handling inconsistent and incomplete listing data from scraped sources.',
      results:'A working end-to-end pipeline from raw scraped data to price prediction.'
    },
    {
      slug:'customer-segmentation', category:'Machine Learning · Django',
      title:'Customer Segmentation Engine', colors:['#7C5CFF','#C9A961'],
      desc:'An RFM-based customer segmentation tool with KMeans/Agglomerative/DBSCAN clustering, integrated into Django.',
      stack:['Django','scikit-learn','pandas','KMeans/DBSCAN'],
      github:'https://github.com/Sk2059/customer-segmentation-django-ml', live:null,
      overview:'A customer segmentation tool built on RFM analysis (Recency, Frequency, Monetary) over the UCI Online Retail dataset.',
      problem:'Businesses often treat all customers the same, missing opportunities to tailor engagement to distinct behavior groups.',
      solution:'An RFM feature pipeline feeding KMeans, Agglomerative, and DBSCAN clustering, wrapped in a Django integration layer with a prediction view and forms.',
      features:['RFM feature engineering','Multiple clustering algorithms compared','Django ML utility singleton for serving predictions','CI/CD pipeline with a pytest suite'],
      flow:['Django Form','ML Utility (singleton)','Clustering Model','Segment Result'],
      challenges:'Wrapping a notebook-based ML workflow into a testable, production-style Django integration.',
      results:'Full Django integration completed with a working prediction view, forms, and automated test suite.'
    },
    {
      slug:'churn-prediction', category:'Machine Learning',
      title:'Customer Churn Prediction', colors:['#3E7BFA','#C9A961'],
      desc:'A churn prediction system with an interactive Streamlit interface for exploring model predictions.',
      stack:['Python','scikit-learn','Streamlit'],
      github:'https://github.com/Sk2059/CostomerChurnPredictionSystem', live:null,
      overview:'A classification project predicting which customers are likely to churn, with an interactive Streamlit app for exploring results.',
      problem:'Identifying at-risk customers early is more useful than reacting after they leave.',
      solution:'A scikit-learn classification model trained on customer behavior data, wrapped in a Streamlit interface for interactive exploration.',
      features:['Churn classification model','Interactive Streamlit UI','Exploratory data analysis'],
      flow:['Customer Data','scikit-learn Model','Streamlit Interface'],
      challenges:'Balancing the dataset so the model does not simply predict the majority class.',
      results:'A usable, interactive demo rather than a notebook-only result.'
    }
  ];

  var projectsGrid = document.getElementById('projects-grid');
  function stackChip(t){
    var icon = techIcon(t, 13);
    return '<span class="stack-chip">'+(icon?icon+' ':'')+t+'</span>';
  }
  projects.forEach(function(p, idx){
    var card = document.createElement('div');
    card.className = 'project-card fade-up' + (p.featured ? ' featured' : '');
    card.style.transitionDelay = Math.min(idx*70,300) + 'ms';
    card.style.setProperty('--pc1', p.colors[0]);
    card.style.setProperty('--pc2', p.colors[1]);
    var liveBtn = p.live ? '<a class="btn btn-ghost" href="'+p.live+'" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>' : '<button class="btn btn-ghost" disabled title="Not deployed yet">Live Demo ↗</button>';
    var ghBtn = p.github ? '<a class="btn btn-ghost" href="'+p.github+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a>' : '<button class="btn btn-ghost" disabled title="Private repository">GitHub ↗</button>';
    card.innerHTML =
      '<div class="project-media">'+ (p.featured ? '<span class="project-tag">Featured</span>' : '') +'<span class="project-media-icon">'+p.category+'</span></div>'+
      '<div class="project-body">'+
        '<h3 class="project-title">'+p.title+'</h3>'+
        '<p class="project-desc">'+p.desc+'</p>'+
        '<div class="project-stack">'+p.stack.map(stackChip).join('')+'</div>'+
        '<div class="project-actions">'+ghBtn+liveBtn+'<button class="btn btn-primary" data-view="'+idx+'">View Details →</button></div>'+
      '</div>';
    if(!reduceMotion && !isMobile){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - 0.5;
        var y = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = 'rotateY('+(x*6)+'deg) rotateX('+(-y*6)+'deg)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    }
    projectsGrid.appendChild(card);
    revealIO.observe(card);
  });

  /* ============ PROJECT MODAL ============ */
  var modalOverlay = document.getElementById('project-modal');
  var modalBody = document.getElementById('modal-body');
  var modalTitle = document.getElementById('modal-title');
  var modalCat = document.getElementById('m-cat');
  var lastFocused = null;

  function openModal(p){
    lastFocused = document.activeElement;
    modalTitle.textContent = p.title;
    modalCat.textContent = p.category;
    var ghLink = p.github ? '<a class="btn btn-ghost" href="'+p.github+'" target="_blank" rel="noopener noreferrer">GitHub Repository ↗</a>' : '';
    var liveLink = p.live ? '<a class="btn btn-primary" href="'+p.live+'" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>' : '';
    modalBody.innerHTML =
      '<div class="modal-section"><h4>Overview</h4><p>'+p.overview+'</p></div>'+
      '<div class="modal-section"><h4>Problem</h4><p>'+p.problem+'</p></div>'+
      '<div class="modal-section"><h4>Solution</h4><p>'+p.solution+'</p></div>'+
      '<div class="modal-section"><h4>Features</h4><ul>'+p.features.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul></div>'+
      '<div class="modal-section"><h4>Architecture</h4><div class="m-flow">'+p.flow.map(function(f,i){return '<span>'+f+'</span>'+(i<p.flow.length-1?'<i>→</i>':'');}).join('')+'</div></div>'+
      '<div class="modal-section"><h4>Tech Stack</h4><div class="project-stack">'+p.stack.map(stackChip).join('')+'</div></div>'+
      '<div class="modal-section"><h4>Challenges</h4><p>'+p.challenges+'</p></div>'+
      '<div class="modal-section"><h4>Results &amp; Learnings</h4><p>'+p.results+'</p></div>'+
      '<div class="modal-links">'+ghLink+liveLink+'</div>';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
  }
  function closeModal(){
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
  }

  // Focus trap: keep keyboard focus inside modal while it is open
  modalOverlay.addEventListener('keydown', function(e){
    if(!modalOverlay.classList.contains('open')) return;
    if(e.key !== 'Tab') return;
    var focusable = modalOverlay.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if(!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if(e.shiftKey){
      if(document.activeElement === first){ e.preventDefault(); last.focus(); }
    } else {
      if(document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  projectsGrid.addEventListener('click', function(e){
    var btn = e.target.closest('[data-view]');
    if(!btn) return;
    openModal(projects[parseInt(btn.dataset.view,10)]);
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e){ if(e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal(); });

  /* ============ CONTACT FORM ============ */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  function validateField(id, test){
    var group = document.getElementById(id).closest('.form-group');
    var ok = test();
    group.classList.toggle('invalid', !ok);
    return ok;
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var email = document.getElementById('f-email').value.trim();
    var subject = document.getElementById('f-subject').value.trim();
    var message = document.getElementById('f-message').value.trim();

    var validName = validateField('f-name', function(){ return name.length > 1; });
    var validEmail = validateField('f-email', function(){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); });
    var validSubject = validateField('f-subject', function(){ return subject.length > 1; });
    var validMessage = validateField('f-message', function(){ return message.length >= 10; });

    if(!(validName && validEmail && validSubject && validMessage)){
      statusEl.className = 'form-status show error';
      statusEl.textContent = 'Please fix the highlighted fields above.';
      return;
    }

    statusEl.className = 'form-status show loading';
    statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending your message…';
    submitBtn.disabled = true;

    if(CONTACT_ENDPOINT){
      // Production mode: POST to configured endpoint
      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
      })
      .then(function(res){
        submitBtn.disabled = false;
        if(res.ok){
          statusEl.className = 'form-status show success';
          statusEl.textContent = '✓ Message sent — thanks, '+name.split(' ')[0]+'! I\'ll get back to you soon.';
          form.reset();
        } else {
          statusEl.className = 'form-status show error';
          statusEl.textContent = '✕ Something went wrong. Please try emailing directly.';
        }
      })
      .catch(function(){
        submitBtn.disabled = false;
        statusEl.className = 'form-status show error';
        statusEl.textContent = '✕ Network error. Please try again or email directly.';
      });
    } else {
      // Demo mode: simulated response (configure CONTACT_ENDPOINT for production)
      setTimeout(function(){
        submitBtn.disabled = false;
        statusEl.className = 'form-status show success';
        statusEl.textContent = '✓ Message received — thanks, '+name.split(' ')[0]+'! I\'ll get back to you soon.';
        form.reset();
      }, 1200);
    }
  });

  /* ============ THREE.JS: SHARED HELPERS ============ */
  // Defers 3D init until THREE is confirmed available (primary or fallback CDN),
  // so a slow/failed primary CDN doesn't permanently disable 3D if the fallback succeeds.
  var threeReadyQueue = [];
  var threeResolved = false;
  function onThreeReady(cb){
    if(typeof THREE !== 'undefined'){ cb(); return; }
    threeReadyQueue.push(cb);
  }
  function resolveThreeReady(){
    if(threeResolved) return;
    threeResolved = true;
    var q = threeReadyQueue; threeReadyQueue = [];
    q.forEach(function(cb){ cb(); });
  }
  window.addEventListener('load', resolveThreeReady);
  setTimeout(resolveThreeReady, 4000); // hard safety net regardless of load timing

  function safeInitCanvas(canvasEl, fn){
    if(!canvasEl) return;
    if(!hasWebGL){ canvasEl.style.display = 'none'; return; }
    onThreeReady(function(){
      if(typeof THREE === 'undefined'){ canvasEl.style.display = 'none'; return; }
      try{ fn(); }
      catch(err){ console.warn('3D init failed, falling back.', err); canvasEl.style.display = 'none'; }
    });
  }

  /* ============ HERO 3D SCENE ============ */
  safeInitCanvas(document.getElementById('hero-canvas'), function(){
    var canvas = document.getElementById('hero-canvas');
    var heroSection = document.getElementById('home');
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    function size(){
      var w = heroSection.clientWidth, h = heroSection.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w/h; camera.updateProjectionMatrix();
    }
    size();
    window.addEventListener('resize', size);

    // AI Core
    var coreGeo = new THREE.IcosahedronGeometry(1.32, 1);
    var coreMat = new THREE.MeshBasicMaterial({ color:0x3E7BFA, wireframe:true, transparent:true, opacity:0.88 });
    var core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(isMobile ? 0 : 2.5, 0.2, -1.2);
    scene.add(core);

    var coreGlowGeo = new THREE.IcosahedronGeometry(1.62, 1);
    var coreGlowMat = new THREE.MeshBasicMaterial({ color:0x7C5CFF, wireframe:true, transparent:true, opacity:0.22 });
    var coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    coreGlow.position.copy(core.position);
    scene.add(coreGlow);

    var coreInnerGeo = new THREE.IcosahedronGeometry(0.72, 0);
    var coreInnerMat = new THREE.MeshBasicMaterial({ color:0x22D3EE, wireframe:true, transparent:true, opacity:0.5 });
    var coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
    coreInner.position.copy(core.position);
    scene.add(coreInner);

    // Orbital rings representing system layers
    var ringColors = [0x22D3EE, 0x3E7BFA, 0x7C5CFF, 0xC9A961];
    var rings = [];
    for(var i=0;i<4;i++){
      var ringGeo = new THREE.TorusGeometry(1.85 + i*0.4, 0.007, 8, 100);
      var ringMat = new THREE.MeshBasicMaterial({ color: ringColors[i], transparent:true, opacity:0.5 - i*0.08 });
      var ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI/2 + i*0.32;
      ring.rotation.y = i*0.55;
      ring.position.copy(core.position);
      scene.add(ring);
      rings.push(ring);
    }

    // Particle field
    var particleCount = isMobile ? 220 : 650;
    var pGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount*3);
    for(var p=0;p<particleCount;p++){
      positions[p*3] = (Math.random()-0.5)*16;
      positions[p*3+1] = (Math.random()-0.5)*10;
      positions[p*3+2] = (Math.random()-0.5)*10 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    var pMat = new THREE.PointsMaterial({ color:0x8FB4FF, size:0.028, transparent:true, opacity:0.5 });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Constellation network — nodes with connecting edges near the core, computed once
    var netGroup = new THREE.Group();
    netGroup.position.copy(core.position);
    var netCount = isMobile ? 26 : 46;
    var netPts = [];
    for(var n=0;n<netCount;n++){
      var v = new THREE.Vector3((Math.random()-0.5)*5.4,(Math.random()-0.5)*3.6,(Math.random()-0.5)*4);
      netPts.push(v);
    }
    var netPosArr = new Float32Array(netCount*3);
    netPts.forEach(function(v,i){ netPosArr[i*3]=v.x; netPosArr[i*3+1]=v.y; netPosArr[i*3+2]=v.z; });
    var netPGeo = new THREE.BufferGeometry();
    netPGeo.setAttribute('position', new THREE.BufferAttribute(netPosArr,3));
    var netPMat = new THREE.PointsMaterial({ color:0x22D3EE, size:0.05, transparent:true, opacity:0.85 });
    netGroup.add(new THREE.Points(netPGeo, netPMat));

    var linePositions = [];
    var maxDist = 1.7;
    for(var a=0;a<netPts.length;a++){
      for(var b=a+1;b<netPts.length;b++){
        if(netPts[a].distanceTo(netPts[b]) < maxDist){
          linePositions.push(netPts[a].x,netPts[a].y,netPts[a].z, netPts[b].x,netPts[b].y,netPts[b].z);
        }
      }
    }
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions),3));
    var lineMat = new THREE.LineBasicMaterial({ color:0x3E7BFA, transparent:true, opacity:0.22 });
    netGroup.add(new THREE.LineSegments(lineGeo, lineMat));
    scene.add(netGroup);

    // Data stream lines (API node connections)
    var streamGroup = new THREE.Group();
    var streamGeo = new THREE.BufferGeometry();
    var streamCount = isMobile ? 30 : 90;
    var streamPos = new Float32Array(streamCount*3);
    for(var s=0;s<streamCount;s++){
      var ang = Math.random()*Math.PI*2;
      var rad = 2.2 + Math.random()*2.2;
      streamPos[s*3] = core.position.x + Math.cos(ang)*rad;
      streamPos[s*3+1] = core.position.y + (Math.random()-0.5)*3;
      streamPos[s*3+2] = core.position.z + Math.sin(ang)*rad;
    }
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos,3));
    var streamMat = new THREE.PointsMaterial({ color:0x22D3EE, size:0.045, transparent:true, opacity:0.75 });
    var streamPoints = new THREE.Points(streamGeo, streamMat);
    streamGroup.add(streamPoints);
    scene.add(streamGroup);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function(e){
      mouseX = (e.clientX/window.innerWidth - 0.5);
      mouseY = (e.clientY/window.innerHeight - 0.5);
    });

    var visible = true;
    new IntersectionObserver(function(entries){ visible = entries[0].isIntersecting; }, {threshold:0}).observe(heroSection);

    var clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      if(!visible) return;
      var t = reduceMotion ? 0 : clock.getElapsedTime();
      core.rotation.y = t*0.18;
      core.rotation.x = t*0.09;
      coreGlow.rotation.y = -t*0.1;
      coreInner.rotation.y = t*0.3;
      coreInner.rotation.x = -t*0.22;
      rings.forEach(function(r,i){ r.rotation.z = t*(0.06+i*0.03); });
      particles.rotation.y = t*0.015;
      pMat.opacity = 0.4 + Math.sin(t*0.6)*0.12;
      streamGroup.rotation.y = t*0.12;
      netGroup.rotation.y = t*0.14;
      netGroup.rotation.x = Math.sin(t*0.3)*0.08;
      camera.position.x += (mouseX*1.4 - camera.position.x)*0.03;
      camera.position.y += (-mouseY*0.8 - camera.position.y)*0.03;
      camera.lookAt(core.position);
      renderer.render(scene, camera);
    }
    animate();
  });

  /* ============ CONTACT ORB 3D ============ */
  safeInitCanvas(document.getElementById('contact-canvas'), function(){
    var canvas = document.getElementById('contact-canvas');
    var wrap = canvas.parentElement;
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 4.6;

    function size(){
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      camera.aspect = wrap.clientWidth/wrap.clientHeight; camera.updateProjectionMatrix();
    }
    size();
    window.addEventListener('resize', size);

    var orbGeo = new THREE.SphereGeometry(1.05, 24, 24);
    var orbMat = new THREE.MeshBasicMaterial({ color:0x22D3EE, wireframe:true, transparent:true, opacity:0.7 });
    var orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.5,0.008,8,100), new THREE.MeshBasicMaterial({color:0x7C5CFF, transparent:true, opacity:0.6}));
    ring.rotation.x = Math.PI/2.4;
    scene.add(ring);
    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.85,0.006,8,100), new THREE.MeshBasicMaterial({color:0x3E7BFA, transparent:true, opacity:0.4}));
    ring2.rotation.x = Math.PI/1.7;
    scene.add(ring2);

    var packetGeo = new THREE.BufferGeometry();
    var packets = 26;
    var packetPos = new Float32Array(packets*3);
    for(var i=0;i<packets;i++){ packetPos[i*3]=0; packetPos[i*3+1]=0; packetPos[i*3+2]=0; }
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos,3));
    var packetMat = new THREE.PointsMaterial({ color:0xC9A961, size:0.06 });
    var packetPoints = new THREE.Points(packetGeo, packetMat);
    scene.add(packetPoints);

    var mx=0,my=0;
    wrap.addEventListener('mousemove', function(e){
      var r = wrap.getBoundingClientRect();
      mx = (e.clientX-r.left)/r.width - 0.5;
      my = (e.clientY-r.top)/r.height - 0.5;
    });

    var visible = true;
    new IntersectionObserver(function(entries){ visible = entries[0].isIntersecting; }, {threshold:0}).observe(wrap);
    var clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      if(!visible) return;
      var t = reduceMotion ? 0 : clock.getElapsedTime();
      orb.rotation.y = t*0.3;
      ring.rotation.z = t*0.2;
      ring2.rotation.z = -t*0.15;
      var posAttr = packetGeo.attributes.position;
      for(var i=0;i<packets;i++){
        var ang = t*0.8 + i*(Math.PI*2/packets);
        var rad = 1.5 + Math.sin(t+i)*0.15;
        posAttr.array[i*3] = Math.cos(ang)*rad;
        posAttr.array[i*3+1] = Math.sin(ang*1.3)*0.5;
        posAttr.array[i*3+2] = Math.sin(ang)*rad;
      }
      posAttr.needsUpdate = true;
      scene.rotation.y += (mx*0.6 - scene.rotation.y)*0.04;
      scene.rotation.x += (-my*0.4 - scene.rotation.x)*0.04;
      renderer.render(scene, camera);
    }
    animate();
  });

  /* ============ FOOTER MINI 3D ============ */
  safeInitCanvas(document.getElementById('footer-canvas'), function(){
    var canvas = document.getElementById('footer-canvas');
    var wrap = canvas.parentElement;
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
    camera.position.z = 3.2;
    function size(){ renderer.setSize(44,44); camera.aspect=1; camera.updateProjectionMatrix(); }
    size();
    var mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), new THREE.MeshBasicMaterial({color:0x3E7BFA, wireframe:true}));
    scene.add(mesh);
    var visible = true;
    new IntersectionObserver(function(entries){ visible = entries[0].isIntersecting; }, {threshold:0}).observe(wrap);
    var clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      if(!visible) return;
      var t = reduceMotion ? 0 : clock.getElapsedTime();
      mesh.rotation.y = t*0.4; mesh.rotation.x = t*0.25;
      renderer.render(scene, camera);
    }
    animate();
  });

})();