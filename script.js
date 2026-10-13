/* ============================================================
   RAHUL_DEV PORTFOLIO — script.js
   All JavaScript for the portfolio. Loaded after EmailJS CDN.
   ============================================================ */

/* ---- LOADER LOGIC ---- */
(function () {
    var loader = document.getElementById('site-loader');
    var bar = document.getElementById('loader-bar');
    var pct = document.getElementById('loader-pct');
    var typed = document.getElementById('loader-typed');
    var title = document.getElementById('loader-title');
    var clockEl = document.getElementById('loader-clock');
    var logLines = document.querySelectorAll('#loader-log .log-line');

    var FULL_TEXT = 'RAHUL_DEV';
    var DURATION = 3200;
    var start = performance.now();

    function tickClock() {
        var d = new Date();
        var hh = String(d.getHours()).padStart(2, '0');
        var mm = String(d.getMinutes()).padStart(2, '0');
        var ss = String(d.getSeconds()).padStart(2, '0');
        if (clockEl) clockEl.textContent = hh + ':' + mm + ':' + ss;
    }
    tickClock();
    var clockTimer = setInterval(tickClock, 1000);

    var typeIdx = 0;
    var glitchChars = '!@#$%^&*<>?/\\|~';
    function randomGlitch() {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }
    function typeNext() {
        if (typeIdx < FULL_TEXT.length) {
            var glitch = randomGlitch();
            typed.textContent = FULL_TEXT.slice(0, typeIdx) + glitch;
            title.dataset.text = typed.textContent;
            setTimeout(function () {
                typeIdx++;
                typed.textContent = FULL_TEXT.slice(0, typeIdx);
                title.dataset.text = typed.textContent;
                setTimeout(typeNext, 80 + Math.random() * 60);
            }, 40);
        }
    }
    setTimeout(typeNext, 300);

    logLines.forEach(function (line) {
        var delay = parseInt(line.dataset.delay, 10) || 0;
        setTimeout(function () { line.classList.add('visible'); }, delay);
    });

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function animateBar(ts) {
        var elapsed = ts - start;
        var raw = Math.min(elapsed / DURATION, 1);
        var v = Math.round(easeOut(raw) * 100);
        bar.style.width = v + '%';
        pct.textContent = v + '%';
        if (raw < 1) {
            requestAnimationFrame(animateBar);
        } else {
            setTimeout(function () {
                loader.classList.add('loader-hidden');
                clearInterval(clockTimer);
                setTimeout(function () { loader.remove(); }, 700);
            }, 400);
        }
    }
    requestAnimationFrame(animateBar);
})();

/* ---- THREE.JS HERO ---- */
(function () {
    const container = document.getElementById('threejs-container');
    if (!container || typeof THREE === 'undefined') return;

    function getSize() {
        const rect = container.getBoundingClientRect();
        return {
            width: Math.max(rect.width || container.clientWidth || 300, 100),
            height: Math.max(rect.height || container.clientHeight || 300, 100)
        };
    }

    const initialSize = getSize();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, initialSize.width / initialSize.height, 0.1, 1000);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(initialSize.width, initialSize.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Dynamic Lighting (adds rich 3D volumetric depth)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xCCFF00, 1.8, 7);
    pointLight.position.set(0, 0, 0);
    worldGroup.add(pointLight);

    // Geometry presets
    const shapes = [
        {
            name: 'ICOSA',
            createCage: () => new THREE.IcosahedronGeometry(1.6, 1),
            createCore: () => new THREE.OctahedronGeometry(0.85, 0)
        },
        {
            name: 'KNOT',
            createCage: () => new THREE.TorusKnotGeometry(1.15, 0.28, 64, 8),
            createCore: () => new THREE.TetrahedronGeometry(0.85, 0)
        },
        {
            name: 'CUBE',
            createCage: () => new THREE.BoxGeometry(1.8, 1.8, 1.8, 2, 2, 2),
            createCore: () => new THREE.SphereGeometry(0.8, 16, 16)
        },
        {
            name: 'DODECA',
            createCage: () => new THREE.DodecahedronGeometry(1.5, 0),
            createCore: () => new THREE.IcosahedronGeometry(0.8, 0)
        }
    ];

    let currentShapeIdx = 0;
    let isWireframe = true;
    let speedMultiplier = 1.0;

    // Theme-adaptive wireframe color (crisp off-white in dark mode, deep slate in light mode)
    function getWireframeColor() {
        return document.documentElement.classList.contains('dark-mode') ? 0xe8e8e4 : 0x1a1c1a;
    }

    // Outer cage mesh
    const cageMat = new THREE.MeshBasicMaterial({
        color: getWireframeColor(),
        wireframe: true,
        wireframeLinewidth: 2
    });
    let cageMesh = new THREE.Mesh(shapes[0].createCage(), cageMat);
    worldGroup.add(cageMesh);

    // Dynamic sync when theme toggles
    function updateWireframeTheme() {
        if (cageMat) {
            cageMat.color.setHex(getWireframeColor());
        }
    }
    window.updateThreeTheme = updateWireframeTheme;

    if (typeof MutationObserver !== 'undefined') {
        const themeObserver = new MutationObserver(function (mutations) {
            for (let i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'class') {
                    updateWireframeTheme();
                    break;
                }
            }
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    // Orbit ring 1
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.012, 8, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xCCFF00, opacity: 0.35, transparent: true });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    worldGroup.add(ring1);

    // Orbit ring 2
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.008, 8, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xCCFF00, opacity: 0.18, transparent: true });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 5;
    ring2.rotation.y = Math.PI / 4;
    worldGroup.add(ring2);

    // Inner Core with faceted metallic shader
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xCCFF00,
        roughness: 0.22,
        metalness: 0.65,
        flatShading: true
    });
    let coreMesh = new THREE.Mesh(shapes[0].createCore(), coreMat);
    worldGroup.add(coreMesh);

    // Interactive Shockwave Ring (triggers on canvas click)
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xCCFF00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        wireframe: true
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    worldGroup.add(shockwaveMesh);
    let shockwaveProgress = 1.0; // 0..1, 1 means idle

    // Floating dynamic particle dots
    const particleCount = 75;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleBaseData = [];
    for (let i = 0; i < particleCount; i++) {
        const r = 2.4 + Math.random() * 1.3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particleBaseData.push({
            r: r,
            theta: theta,
            phi: phi,
            speed: 0.9 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2
        });
        particlePositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xCCFF00, size: 0.048, transparent: true, opacity: 0.75 });
    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // Color palettes
    const palettes = [
        { label: 'LIME', hex: 0xCCFF00 },
        { label: 'CYAN', hex: 0x00F0FF },
        { label: 'AMBER', hex: 0xFF6B35 }
    ];
    let currentPaletteIdx = 0;

    // Pulse trigger and Living Core state
    let pulseScale = 0.0;
    function triggerCanvasShockwave() {
        shockwaveProgress = 0.0;
        pulseScale = 0.32;
        if (window.playTerminalSFX) window.playTerminalSFX('keydown');
    }
    container.addEventListener('click', triggerCanvasShockwave);
    window.pulseHeroSimulation = function () {
        pulseScale = 0.26;
    };

    // Controls setup
    const shapeBtn = document.getElementById('canvas-shape-btn');
    if (shapeBtn) {
        shapeBtn.addEventListener('click', function () {
            currentShapeIdx = (currentShapeIdx + 1) % shapes.length;
            const currentPreset = shapes[currentShapeIdx];
            cageMesh.geometry.dispose();
            cageMesh.geometry = currentPreset.createCage();
            coreMesh.geometry.dispose();
            coreMesh.geometry = currentPreset.createCore();
            shapeBtn.textContent = '[ GEOMETRY: ' + currentPreset.name + ' ]';
            pulseScale = 0.25;
        });
    }

    const wireBtn = document.getElementById('canvas-wire-btn');
    if (wireBtn) {
        wireBtn.addEventListener('click', function () {
            isWireframe = !isWireframe;
            cageMat.wireframe = isWireframe;
            wireBtn.textContent = isWireframe ? '[ WIRE: ON ]' : '[ WIRE: OFF ]';
            pulseScale = 0.2;
        });
    }

    const speedBtn = document.getElementById('canvas-speed-btn');
    if (speedBtn) {
        speedBtn.addEventListener('click', function () {
            speedMultiplier = speedMultiplier === 1.0 ? 2.5 : 1.0;
            speedBtn.textContent = speedMultiplier === 1.0 ? '[ SPD: 1X ]' : '[ SPD: 2.5X ]';
            pulseScale = 0.2;
        });
    }

    const colorBtn = document.getElementById('canvas-color-btn');
    if (colorBtn) {
        colorBtn.addEventListener('click', function () {
            currentPaletteIdx = (currentPaletteIdx + 1) % palettes.length;
            const p = palettes[currentPaletteIdx];
            coreMat.color.setHex(p.hex);
            ring1Mat.color.setHex(p.hex);
            ring2Mat.color.setHex(p.hex);
            particleMat.color.setHex(p.hex);
            pointLight.color.setHex(p.hex);
            shockwaveMat.color.setHex(p.hex);
            colorBtn.textContent = '[ COLOR: ' + p.label + ' ]';
            pulseScale = 0.3;
        });
    }

    // Pointer tracking
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    function updatePointer(clientX, clientY) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        }
    }
    window.addEventListener('mousemove', (e) => { updatePointer(e.clientX, e.clientY); });
    container.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    function onWindowResize() {
        const size = getSize();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        renderer.setSize(size.width, size.height, false);
    }
    window.addEventListener('resize', onWindowResize);

    // Battery & GPU Optimization via IntersectionObserver
    let isHeroVisible = true;
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                isHeroVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });
        observer.observe(container);
    }

    const clock = new THREE.Clock();
    let lastTime = 0;

    function animate() {
        requestAnimationFrame(animate);

        // Pause GPU pipeline when hero is off-screen
        if (!isHeroVisible) return;

        const totalElapsed = clock.getElapsedTime();
        const delta = Math.min(totalElapsed - lastTime, 0.1);
        lastTime = totalElapsed;
        const elapsed = totalElapsed * speedMultiplier;

        // Rotations
        cageMesh.rotation.x  = elapsed * 0.25;
        cageMesh.rotation.y  = elapsed * 0.35;
        coreMesh.rotation.x  = -elapsed * 0.4;
        coreMesh.rotation.z  = elapsed * 0.5;
        ring1.rotation.z     = elapsed * 0.2;
        ring2.rotation.z     = -elapsed * 0.15;
        particles.rotation.y = elapsed * 0.08;

        // Harmonic breathing & interactive pulse
        pulseScale *= 0.91;
        const breath = 1.0 + Math.sin(elapsed * 2.6) * 0.07;
        const currentScale = Math.max(0.6, breath + pulseScale);
        coreMesh.scale.set(currentScale, currentScale, currentScale);

        // Fluid particle wave dynamics
        const posAttr = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const p = particleBaseData[i];
            const currentR = p.r + Math.sin(elapsed * p.speed + p.phase) * 0.16;
            posAttr[i * 3]     = currentR * Math.sin(p.phi) * Math.cos(p.theta);
            posAttr[i * 3 + 1] = currentR * Math.sin(p.phi) * Math.sin(p.theta);
            posAttr[i * 3 + 2] = currentR * Math.cos(p.phi);
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Shockwave expansion & decay
        if (shockwaveProgress < 1.0) {
            shockwaveProgress += delta * 2.2;
            const swScale = 1.0 + shockwaveProgress * 24;
            shockwaveMesh.scale.set(swScale, swScale, 1.0);
            shockwaveMat.opacity = Math.max(0, 0.85 * (1.0 - shockwaveProgress));
        } else {
            shockwaveMat.opacity = 0;
        }

        // Pointer lerp smoothing
        targetX += (mouseX * 0.6 - targetX) * 0.08;
        targetY += (mouseY * 0.6 - targetY) * 0.08;
        worldGroup.rotation.y = targetX;
        worldGroup.rotation.x = -targetY;

        renderer.render(scene, camera);
    }
    animate();
})();

/* ---- MENU LOGIC ---- */
(function () {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('nav-open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        const icon = menuToggle.querySelector('.menu-icon');
        if (icon) icon.textContent = isOpen ? '[ CLOSE ✕ ]' : '[ MENU ☰ ]';
    });

    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('nav-open') &&
            !navLinks.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            navLinks.classList.remove('nav-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('.menu-icon');
            if (icon) icon.textContent = '[ MENU ☰ ]';
        }
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('nav-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('.menu-icon');
            if (icon) icon.textContent = '[ MENU ☰ ]';
        });
    });
})();

/* ---- SCROLL REVEAL ---- */
(function () {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    items.forEach(function (el) { io.observe(el); });
})();

/* ---- SKILL BAR ANIMATION (scroll-triggered) ---- */
(function () {
    var bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('skill-bar-animated');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(function (b) { io.observe(b); });
})();

/* ---- STATS COUNTER ANIMATION (scroll-triggered) ---- */
(function () {
    var statNums = document.querySelectorAll('.about-stat-num[data-target]');
    if (!statNums.length) return;

    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';

        if (prefersReduced) {
            el.textContent = prefix + target + suffix;
            return;
        }

        var duration = 950;
        var startVal = 0;
        var startTime = null;

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var current = Math.round(startVal + (target - startVal) * easeOutExpo(progress));
            el.textContent = prefix + current + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = prefix + target + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    var statsContainer = document.querySelector('.about-stats');
    if (!statsContainer) return;

    if (!('IntersectionObserver' in window)) {
        statNums.forEach(animateCounter);
        return;
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                statNums.forEach(animateCounter);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    io.observe(statsContainer);
})();

/* ---- SCROLL-SPY NAV ---- */
(function () {
    var spyLinks = document.querySelectorAll('.nav-spy');
    if (!spyLinks.length) return;

    var sectionIds = Array.from(spyLinks)
        .map(function (a) { return a.getAttribute('data-section'); })
        .filter(Boolean);
    var sections = sectionIds
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    function updateSpy() {
        var scrollY = window.scrollY + 120;
        var current = '';
        sections.forEach(function (sec) {
            if (sec && sec.offsetTop <= scrollY) current = sec.id;
        });
        spyLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-section') === current);
        });
    }

    window.addEventListener('scroll', updateSpy, { passive: true });
    updateSpy();
})();

/* ---- RETURN TO START / TOP HANDLERS ---- */
(function () {
    var backToTopBtn = document.getElementById('btn-back-to-top');
    var brandLogo = document.getElementById('brand-logo');

    function scrollToTop(e) {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (backToTopBtn) {
        function toggleFloatingBtn() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        window.addEventListener('scroll', toggleFloatingBtn, { passive: true });
        toggleFloatingBtn();
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    if (brandLogo) {
        brandLogo.addEventListener('click', scrollToTop);
    }
})();

/* ---- DARK MODE TOGGLE ---- */
(function () {
    var btn = document.getElementById('dark-mode-toggle');
    var root = document.documentElement;
    var stored = localStorage.getItem('rahul-theme');
    if (stored === 'dark') root.classList.add('dark-mode');

    function updateThemeUI() {
        if (!btn) return;
        var isDark = root.classList.contains('dark-mode');
        var full = btn.querySelector('.btn-text-full');
        var short = btn.querySelector('.btn-text-short');
        if (full) full.textContent = isDark ? '[ ☼ LIGHT ]' : '[ ◐ DARK ]';
        if (short) short.textContent = isDark ? '☼' : '◐';
        btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        if (window.updateThreeTheme) window.updateThreeTheme();
    }
    updateThemeUI();

    if (btn) {
        btn.addEventListener('click', function () {
            var isDark = root.classList.toggle('dark-mode');
            localStorage.setItem('rahul-theme', isDark ? 'dark' : 'light');
            updateThemeUI();
        });
    }
})();

/* ---- CONTACT FORM (EmailJS) ---- */
(function () {
    // Initialise EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: '5lO3lmt-LZbpuQD0b' });
    }

    var form   = document.getElementById('contact-form');
    var submit = document.getElementById('cf-submit');
    var status = document.getElementById('cf-status');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        submit.disabled = true;
        submit.textContent = '[ TRANSMITTING... ]';
        status.textContent = '';

        if (typeof emailjs === 'undefined') {
            // Fallback: open mailto link
            var name  = document.getElementById('cf-name').value;
            var email = document.getElementById('cf-email').value;
            var msg   = document.getElementById('cf-msg').value;
            window.location.href =
                'mailto:rahulbiswal196@gmail.com?subject=Portfolio%20Contact%20from%20' +
                encodeURIComponent(name) +
                '&body=' +
                encodeURIComponent(msg + '\n\nReply to: ' + email);
            status.textContent = '✓ MAILTO OPENED';
            status.style.color = 'var(--primary)';
            submit.disabled = false;
            submit.textContent = '[ EXECUTE DISPATCH ↵ ]';
            return;
        }

        // EmailJS send
        emailjs.sendForm('service_5ggcecs', 'template_ydh7hon', form)
            .then(function () {
                status.textContent = "✓ MESSAGE SENT — I'll reply within 24 hrs";
                status.style.color = 'var(--primary)';
                form.reset();
            })
            .catch(function (err) {
                status.textContent = '✗ SEND FAILED — try emailing directly';
                status.style.color = 'var(--secondary)';
                console.error('EmailJS error:', err);
            })
            .finally(function () {
                submit.disabled = false;
                submit.textContent = '[ EXECUTE DISPATCH ↵ ]';
            });
    });
})();

/* ---- SYNTHESIZED MECHANICAL AUDIO (SFX) ---- */
(function () {
    var sfxBtn = document.getElementById('sfx-toggle');
    var savedSfx = localStorage.getItem('rahul-sfx');
    var isSfxEnabled = savedSfx === null ? true : (savedSfx === 'true');
    var audioCtx = null;

    function initAudioContext() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioCtxClass();
        }
    }

    function playKeyClick(type) {
        if (!isSfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            var now = audioCtx.currentTime;

            // Master volume gain - substantially boosted for clear, punchy audibility
            var masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.42, now);
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
            masterGain.connect(audioCtx.destination);

            // 1. Resonant switch body tone (bottom-out thud)
            var osc = audioCtx.createOscillator();
            var oscGain = audioCtx.createGain();
            var baseFreq = type === 'keydown' ? (920 + Math.random() * 220) : (580 + Math.random() * 120);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);
            oscGain.gain.setValueAtTime(0.85, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.055);
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.065);

            // 2. High-frequency crisp tactile snap (switch actuation click)
            var snapOsc = audioCtx.createOscillator();
            var snapGain = audioCtx.createGain();
            snapOsc.type = 'sine';
            snapOsc.frequency.setValueAtTime(type === 'keydown' ? 2400 : 1700, now);
            snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.02);
            snapGain.gain.setValueAtTime(0.7, now);
            snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);
            snapOsc.connect(snapGain);
            snapGain.connect(masterGain);
            snapOsc.start(now);
            snapOsc.stop(now + 0.03);
        } catch (e) {}
    }

    function updateSfxButtonUI() {
        if (!sfxBtn) return;
        var full = sfxBtn.querySelector('.btn-text-full');
        var short = sfxBtn.querySelector('.btn-text-short');
        if (isSfxEnabled) {
            if (full) full.textContent = '[ 🔊 SFX: ON ]';
            if (short) short.textContent = '🔊';
            if (!full && !short) sfxBtn.textContent = '[ 🔊 SFX: ON ]';
            sfxBtn.classList.add('sfx-enabled');
            sfxBtn.setAttribute('title', 'Mechanical Sound Effects: ON');
        } else {
            if (full) full.textContent = '[ 🔈 SFX: OFF ]';
            if (short) short.textContent = '🔈';
            if (!full && !short) sfxBtn.textContent = '[ 🔈 SFX: OFF ]';
            sfxBtn.classList.remove('sfx-enabled');
            sfxBtn.setAttribute('title', 'Mechanical Sound Effects: OFF');
        }
    }

    if (sfxBtn) {
        updateSfxButtonUI();
        sfxBtn.addEventListener('click', function () {
            isSfxEnabled = !isSfxEnabled;
            localStorage.setItem('rahul-sfx', isSfxEnabled ? 'true' : 'false');
            updateSfxButtonUI();
            if (isSfxEnabled) playKeyClick('keydown');
        });
    }

    // Play tactile sound on interactive button & link clicks
    document.addEventListener('click', function (e) {
        if (!isSfxEnabled) return;
        var target = e.target.closest('button, a, .card, .project-card, .social-card');
        if (target && target !== sfxBtn) {
            playKeyClick('keydown');
        }
    });

    window.playTerminalSFX = playKeyClick;
})();

/* ---- INTERACTIVE DEVELOPER TERMINAL CLI ---- */
(function () {
    var cliForm = document.getElementById('cli-form');
    var cliInput = document.getElementById('cli-input');
    var cliOutput = document.getElementById('cli-output');
    var cliClearBtn = document.getElementById('cli-clear-btn');
    if (!cliForm || !cliInput || !cliOutput) return;

    var commandHistory = [];
    var historyIndex = -1;

    function appendRow(content, className) {
        var row = document.createElement('div');
        row.className = 'cli-row ' + (className || '');
        row.innerHTML = content;
        cliOutput.appendChild(row);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }

    var commands = {
        help: function () {
            return '<div class="cli-output-line">AVAILABLE COMMANDS:\n' +
                   '  • <strong>about</strong>      : Developer background & profile\n' +
                   '  • <strong>skills</strong>     : Technical competencies & stack\n' +
                   '  • <strong>projects</strong>   : Selected portfolio projects\n' +
                   '  • <strong>resume</strong>     : Open/download resume (PDF)\n' +
                   '  • <strong>theme</strong>      : Toggle dark / light mode\n' +
                   '  • <strong>contact</strong>    : Scroll to direct message form\n' +
                   '  • <strong>socials</strong>    : Online handles & profiles\n' +
                   '  • <strong>clear</strong>      : Clear console output\n' +
                   '  • <strong>sudo hire rahul</strong> : Clearance authorization check</div>';
        },
        about: function () {
            return '<div class="cli-output-line">RAHUL BISWAL // FRONTEND DEVELOPER\n' +
                   'Education: CS Graduate (2024)\n' +
                   'Location:  New Delhi, India\n' +
                   'Focus:     Fast, accessible, and delightful web interfaces with React, modern CSS, and JavaScript.</div>';
        },
        skills: function () {
            return '<div class="cli-output-line">CORE CAPABILITIES:\n' +
                   '  [LANGUAGES]    JavaScript (ES6+), TypeScript, HTML5, CSS3/SCSS\n' +
                   '  [FRAMEWORKS]   React, Next.js, Redux, Tailwind CSS\n' +
                   '  [TOOLS]        Git, Vite, Webpack, Figma, Three.js\n' +
                   '  [STANDARDS]    REST APIs, Responsive Design, WCAG 2.1 AA</div>';
        },
        projects: function () {
            return '<div class="cli-output-line">SELECTED ARCHIVES:\n' +
                   '  01. DevPortfolio   - Neo-brutalist interactive portfolio with Three.js\n' +
                   '  02. TaskFlow Pro   - Agile Kanban application with React & DnD\n' +
                   '  03. CodeSnippet Hub - Code vault with real-time syntax highlighting</div>';
        },
        resume: function () {
            var resumeLink = document.querySelector('.desktop-resume');
            if (resumeLink) {
                window.open(resumeLink.href, '_blank', 'noopener,noreferrer');
                return '<div class="cli-success">✓ Launching resume document in new tab...</div>';
            }
            return '<div class="cli-output-line">Resume link: <a href="https://drive.google.com/file/d/1n7d59a4CFpltR-WWjDoX4-RBCaL2yfVU/view?usp=sharing" target="_blank" rel="noopener noreferrer" style="color:var(--primary-container);">[ RESUME.PDF ↗ ]</a></div>';
        },
        theme: function () {
            var themeBtn = document.getElementById('dark-mode-toggle');
            if (themeBtn) themeBtn.click();
            var isDark = document.documentElement.classList.contains('dark-mode');
            return '<div class="cli-success">✓ Theme switched to ' + (isDark ? 'DARK' : 'LIGHT') + ' mode.</div>';
        },
        contact: function () {
            var nameField = document.getElementById('cf-name');
            if (nameField) {
                nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function () { nameField.focus(); }, 400);
            }
            return '<div class="cli-success">✓ Jumped to direct message dispatch form below.</div>';
        },
        socials: function () {
            return '<div class="cli-output-line">CONNECT WITH RAHUL KUMAR BISWAL:\n' +
                   '  • GitHub   : <a href="https://github.com/Rahul-biswal" target="_blank" rel="noopener" style="color:var(--primary-container);">github.com/Rahul-biswal</a>\n' +
                   '  • LinkedIn : <a href="https://www.linkedin.com/in/rahulkumarbiswal" target="_blank" rel="noopener" style="color:var(--primary-container);">linkedin.com/in/rahulkumarbiswal</a>\n' +
                   '  • X/Twitter: <a href="https://x.com/Rahulku89844866" target="_blank" rel="noopener" style="color:var(--primary-container);">@Rahulku89844866</a>\n' +
                   '  • Email    : <a href="mailto:rahulbiswal196@gmail.com" style="color:var(--primary-container);">rahulbiswal196@gmail.com</a></div>';
        },
        clear: function () {
            cliOutput.innerHTML = '<div class="cli-row cli-welcome">// rahul_dev bash shell v2.4 initialized. System online.</div>' +
                                  '<div class="cli-row cli-hint">Type <span class="cli-cmd-highlight">\'help\'</span> for commands.</div>';
            return null;
        }
    };

    function handleCommand(rawCmd) {
        var cmd = rawCmd.trim().toLowerCase();
        if (!cmd) return;

        appendRow('<span style="color:#ccff00;">rahul@portfolio:~$</span> ' + rawCmd, 'cli-input-echo');

        if (cmd === 'sudo hire rahul' || cmd === 'hire rahul' || cmd === 'hire') {
            appendRow('<div class="cli-success">🎉 [PERMISSION GRANTED: S-TIER CANDIDATE APPROVED]\n' +
                      'STATUS: Open to Frontend Roles & Internships.\n' +
                      'Let\'s build something exceptional together! Dispatching priority coordinates...</div>', 'cli-success');
            var contactForm = document.getElementById('contact-form');
            if (contactForm) {
                setTimeout(function () {
                    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
            return;
        }

        if (commands[cmd]) {
            var res = commands[cmd]();
            if (res) appendRow(res);
        } else {
            appendRow('bash: ' + rawCmd + ': command not found. Type <span class="cli-cmd-highlight">\'help\'</span> for list of commands.', 'cli-error');
        }
    }

    cliForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = cliInput.value;
        if (!val.trim()) return;
        commandHistory.push(val);
        historyIndex = commandHistory.length;
        handleCommand(val);
        cliInput.value = '';
        if (window.playTerminalSFX) window.playTerminalSFX('keydown');
        if (window.pulseHeroSimulation) window.pulseHeroSimulation();
    });

    cliInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                cliInput.value = commandHistory[historyIndex] || '';
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                cliInput.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length;
                cliInput.value = '';
            }
            e.preventDefault();
        }
    });

    if (cliClearBtn) {
        cliClearBtn.addEventListener('click', function () {
            commands.clear();
        });
    }
})();

