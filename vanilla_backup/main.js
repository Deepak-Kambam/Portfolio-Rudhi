import * as THREE from 'three';
import { projects } from './src/data/projects.js';
import { skills } from './src/data/skills.js';
import { contactLinks } from './src/data/contact.js';

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 0. LENIS SMOOTH SCROLL (LUSION PHYSICS)
// ----------------------------------------------------
let lenis;
try {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
        gsap.ticker.lagSmoothing(0);
    }
} catch (e) {
    console.warn("Lenis could not be initialized", e);
}

// ----------------------------------------------------
// 1. DATA INJECTION (HTML UI)
// ----------------------------------------------------

// Inject Projects
const projectsGrid = document.getElementById('projects-grid');
projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card reveal-up interactive';
    card.innerHTML = `
        <div class="project-image-wrapper">
            <div class="project-image">
                <h3 class="editorial" style="color:var(--surface-tertiary); font-size: 4rem; opacity: 0.2;">${proj.title}</h3>
            </div>
        </div>
        <div class="project-content">
            <span class="project-category">${proj.category}</span>
            <h3 class="project-title editorial">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            <div class="project-tech">
                ${proj.technologies.slice(0, 4).map(t => `<span class="tech-pill">${t}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${proj.demoUrl}" target="_blank" class="card-btn interactive">Live</a>
                <a href="${proj.sourceUrl}" target="_blank" class="card-btn interactive">Source</a>
            </div>
        </div>
    `;
    projectsGrid.appendChild(card);
});

// Inject Skills
const skillsGrid = document.getElementById('skills-grid');
skills.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card interactive reveal-up';
    card.innerHTML = `
        <h3 class="skill-name">${skill.name}</h3>
        <p class="skill-desc">${skill.description}</p>
    `;
    skillsGrid.appendChild(card);
});

// Inject Contact
const contactGrid = document.getElementById('contact-links');
Object.entries(contactLinks).forEach(([key, url]) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.className = 'btn primary-btn interactive reveal-up';
    link.textContent = key;
    contactGrid.appendChild(link);
});

// ----------------------------------------------------
// 2. GSAP SCROLL ANIMATIONS
// ----------------------------------------------------

setTimeout(() => {
    // Hide Loader
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);

    // Animate HTML elements on scroll
    gsap.utils.toArray('.reveal-up').forEach(elem => {
        gsap.to(elem, {
            scrollTrigger: { trigger: elem, start: "top 85%" },
            y: 0, opacity: 1, duration: 1, ease: "power3.out"
        });
    });

    // ----------------------------------------------------
    // LUSION ARCHITECTURE: PLAY REEL
    // ----------------------------------------------------

    // Lusion Mask Reveals for Headers
    gsap.utils.toArray('.reveal-mask').forEach(elem => {
        const text = elem.innerHTML;
        elem.innerHTML = `<span class="mask-container"><span class="reveal-mask-inner" style="display:block; transform: translateY(120%); opacity:0;">${text}</span></span>`;
        const inner = elem.querySelector('.reveal-mask-inner');
        
        gsap.to(inner, {
            scrollTrigger: { trigger: elem, start: "top 85%" },
            y: '0%', opacity: 1, duration: 1.2, ease: "power4.out"
        });
    });
}, 500);

// ----------------------------------------------------
// 3. SENIOR UX CURSOR
// ----------------------------------------------------
const cursorDot = document.querySelector('#cursor-dot');
const cursorRing = document.querySelector('#cursor-ring');
const setDotX = gsap.quickSetter(cursorDot, "x", "px");
const setDotY = gsap.quickSetter(cursorDot, "y", "px");
const setRingX = gsap.quickSetter(cursorRing, "x", "px");
const setRingY = gsap.quickSetter(cursorRing, "y", "px");

document.addEventListener('mousemove', (e) => {
    setDotX(e.clientX);
    setDotY(e.clientY);
    gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
});

// Cursor Hover States
document.querySelectorAll('.interactive, a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Magnetic Buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        
        gsap.to(btn, { x: x, y: y, duration: 0.3, ease: "power2.out" });
    });
    
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
    });
});

// ----------------------------------------------------
// 4. THREE.JS EXACT COMPOSITIONAL HERO
// ----------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080817); // Deep cavern blue
scene.fog = new THREE.FogExp2(0x05050D, 0.012); // Midnight fog

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 45); // Centered for perfect frustum mapping

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// --- FRUSTUM COORDINATE MAPPER ---
// Maps 0.0-1.0 screen coordinates to exact world space at a given depth
function toWorld(nx, ny, targetZ) {
    const dist = camera.position.z - targetZ;
    const vFov = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * dist;
    const width = height * camera.aspect;
    return {
        x: (nx - 0.5) * width,
        y: (0.5 - ny) * height,
        z: targetZ,
        frustumWidth: width,
        frustumHeight: height
    };
}

// --- DEPTH LAYERS (For Parallax) ---
const layers = {
    bg: new THREE.Group(),      // z=-30
    cavern: new THREE.Group(),  // z=-15
    mid: new THREE.Group(),     // z=-5
    portrait: new THREE.Group(),// z=5
    crystals: new THREE.Group(),// z=10
    fg: new THREE.Group()       // z=25
};
Object.values(layers).forEach(layer => scene.add(layer));

// --- MATERIALS ---
const cavernMat = new THREE.MeshStandardMaterial({
    color: 0x0D0B20, roughness: 0.9, metalness: 0.1, flatShading: true
});
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x05050D, roughness: 0.2, metalness: 0.5, flatShading: true // Wet reflective rock
});
const createCrystalMat = (hexColor, trans) => {
    return new THREE.MeshPhysicalMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 0.2,
        metalness: 0.2,
        roughness: 0.15,
        transmission: trans,
        ior: 1.5,
        thickness: 5.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        flatShading: true
    });
};
const brightPink = createCrystalMat(0xD9659B, 0.7);
const midPink = createCrystalMat(0x982F6C, 0.6);
const darkPlum = createCrystalMat(0x4A163F, 0.5);

// --- GEOMETRY FACTORY ---
function createFacetedCrystal(mat, rBase, height) {
    const geo = new THREE.CylinderGeometry(rBase*0.3, rBase, height, 6);
    const pos = geo.attributes.position;
    for(let i=0; i<pos.count; i++) {
        if(pos.getY(i) > 0) {
            pos.setX(i, pos.getX(i) + (Math.random()-0.5)*rBase*0.5);
            pos.setZ(i, pos.getZ(i) + (Math.random()-0.5)*rBase*0.5);
        }
    }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
}

// --- CAVERN & BACKGROUND ---
for(let i=0; i<15; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(15 + Math.random()*10, 0), cavernMat);
    // Frame top and right side heavily
    const isTop = i < 8;
    const px = toWorld(isTop ? (0.3 + Math.random()*0.7) : (0.8 + Math.random()*0.3), isTop ? 0 : (0.2 + Math.random()*0.8), -15);
    rock.position.set(px.x, px.y + (isTop?5:0), px.z);
    rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    layers.cavern.add(rock);
}

// Floor (Wet reflective ground)
const floorPos = toWorld(0.5, 0.9, 10);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(150, 80, 20, 20), groundMat);
floor.rotation.x = -Math.PI/2;
const fPos = floor.geometry.attributes.position;
for(let i=0; i<fPos.count; i++) { fPos.setZ(i, fPos.getZ(i) + (Math.random()-0.5)*1.5); }
floor.geometry.computeVertexNormals();
floor.position.set(0, floorPos.y, -10);
layers.cavern.add(floor);

// --- EXACT COMPOSITIONAL PLACEMENTS ---
// 1. Primary Left Crystal (X=0.51, Y=0.50, Midground)
const leftPos = toWorld(0.51, 0.65, -5); // Y=0.65 for base
const leftCrystal = createFacetedCrystal(brightPink, leftPos.frustumWidth*0.06, leftPos.frustumHeight*0.4);
leftCrystal.position.set(leftPos.x, leftPos.y + leftPos.frustumHeight*0.2, leftPos.z);
leftCrystal.rotation.z = -0.2; // Leans slightly to center
layers.mid.add(leftCrystal);

// 2. Primary Central Crystal (X=0.77, Y=0.41, 35% height)
const centPos = toWorld(0.77, 0.65, 10);
const centralCrystal = createFacetedCrystal(midPink, centPos.frustumWidth*0.08, centPos.frustumHeight*0.35);
centralCrystal.position.set(centPos.x, centPos.y + centPos.frustumHeight*0.17, centPos.z);
centralCrystal.rotation.z = 0.1;
layers.crystals.add(centralCrystal);

// Add clusters around central crystal
for(let i=0; i<8; i++) {
    const clusterPos = toWorld(0.7 + Math.random()*0.2, 0.65 + Math.random()*0.1, 8 + Math.random()*4);
    const med = createFacetedCrystal(Math.random()>0.5?darkPlum:midPink, clusterPos.frustumWidth*0.03, clusterPos.frustumHeight*0.15);
    med.position.set(clusterPos.x, clusterPos.y, clusterPos.z);
    med.rotation.set((Math.random()-0.5)*0.5, Math.random()*Math.PI, (Math.random()-0.5)*0.5);
    layers.crystals.add(med);
}

// 3. Portrait Crystal Frame (X=0.72, 15% width)
const portPos = toWorld(0.72, 0.50, 5); // Z=5 (Portrait layer)
const portWidth = portPos.frustumWidth * 0.15;
const portHeight = portWidth * 1.25; // 4:5 aspect ratio

const portraitGroup = new THREE.Group();
portraitGroup.position.set(portPos.x, portPos.y, portPos.z);

const frameGeo = new THREE.PlaneGeometry(portWidth*1.15, portHeight*1.15);
const frameMat = darkPlum.clone(); frameMat.transmission = 0.9;
const frame = new THREE.Mesh(frameGeo, frameMat);
frame.position.z = -0.2;
portraitGroup.add(frame);

const placeholderGeo = new THREE.PlaneGeometry(portWidth, portHeight);
const placeholderMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.5, transparent: true });
const placeholder = new THREE.Mesh(placeholderGeo, placeholderMat);
portraitGroup.add(placeholder);

// Add text to placeholder
const canvas2d = document.createElement('canvas');
canvas2d.width = 512; canvas2d.height = 512;
const ctx = canvas2d.getContext('2d');
ctx.fillStyle = 'transparent'; ctx.fillRect(0,0,512,512);
ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '30px Inter'; ctx.textAlign = 'center'; ctx.textBaseline='middle';
ctx.fillText('PORTRAIT', 256, 230); ctx.fillText('IMAGE', 256, 270);
const textTex = new THREE.CanvasTexture(canvas2d);
const textMesh = new THREE.Mesh(placeholderGeo, new THREE.MeshBasicMaterial({map: textTex, transparent: true}));
textMesh.position.z = 0.05;
portraitGroup.add(textMesh);

const cover = new THREE.Mesh(placeholderGeo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.98, roughness: 0.05, transparent: true }));
cover.position.z = 0.1;
portraitGroup.add(cover);
layers.portrait.add(portraitGroup);

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0x111A45, 1.5)); // Cool blue environmental
const hemi = new THREE.HemisphereLight(0x273B78, 0x05050D, 1.0);
scene.add(hemi);

// Primary Pink Light (Inside Central Crystal)
const mainLight = new THREE.PointLight(0xD9659B, 2000.0, 50);
mainLight.position.set(centPos.x, centPos.y, centPos.z - 2);
layers.crystals.add(mainLight);

// Portrait Rim Light
const rimLight = new THREE.PointLight(0xF8D6E7, 800.0, 20);
rimLight.position.set(portPos.x - 2, portPos.y, portPos.z - 3);
layers.portrait.add(rimLight);

// White Highlight
const whiteKey = new THREE.DirectionalLight(0xFFFFFF, 2.0);
whiteKey.position.set(10, 20, 10);
whiteKey.lookAt(centPos.x, centPos.y, centPos.z);
scene.add(whiteKey);

// --- PARALLAX ---
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Scroll Dolly
setTimeout(() => {
    gsap.to(camera.position, {
        z: 30, x: 2, y: -1,
        ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 }
    });
}, 500);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;
    
    // Parallax Multipliers (Dampened depth movement)
    layers.cavern.position.set(mouseX * 1.5, mouseY * 1.5, 0);
    layers.mid.position.set(mouseX * 2.5, mouseY * 2.5, 0);
    layers.portrait.position.set(mouseX * 3.0, mouseY * 3.0, 0);
    layers.crystals.position.set(mouseX * 4.0, mouseY * 4.0, 0);
    layers.fg.position.set(mouseX * 5.0, mouseY * 5.0, 0);
    
    // Camera rotation (1-3 degrees)
    camera.rotation.y = -(mouseX * 0.03);
    camera.rotation.x = (mouseY * 0.02);
    
    // Lighting animation
    mainLight.intensity = 1800.0 + Math.sin(time*2)*400.0;
    
    // Wet floor reflection shimmer
    floor.position.y = floorPos.y + Math.sin(time*0.5)*0.1;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
