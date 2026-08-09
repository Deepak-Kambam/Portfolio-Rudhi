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
// 4. THREE.JS ABSTRACT BACKGROUND
// ----------------------------------------------------
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0B090C);
scene.fog = new THREE.FogExp2(0x0B090C, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Abstract Background Particles
const particles = new THREE.Group();
scene.add(particles);

const geo = new THREE.OctahedronGeometry(0.5, 0);
const mat1 = new THREE.MeshPhysicalMaterial({ color: 0x30242D, roughness: 0.4, transmission: 0.9, ior: 1.5 });
const mat2 = new THREE.MeshStandardMaterial({ color: 0xE58AA8, roughness: 0.2, metalness: 0.8 });

for(let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(geo, Math.random() > 0.8 ? mat2 : mat1);
    mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 5);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const scale = Math.random() * 2.5 + 0.5; // Larger organic shapes
    mesh.scale.set(scale, scale, scale);
    particles.add(mesh);
}

// Play Reel 3D Object (Wireframe Torus Knot)
const reelGeo = new THREE.TorusKnotGeometry(2, 0.4, 128, 16);
const reelMat = new THREE.MeshBasicMaterial({ color: 0xE99AB4, wireframe: true, transparent: true, opacity: 0.4 });
window.reelObject = new THREE.Mesh(reelGeo, reelMat);
window.reelObject.position.set(0, 0, -5);
scene.add(window.reelObject);

// Lighting
scene.add(new THREE.AmbientLight(0xFAF7F8, 1.0));
const pointLight = new THREE.PointLight(0xF3C7D6, 4.0, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Mouse Parallax for Background (Aggressive for Lusion feel)
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Render Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Fast rotation of the background group (Lusion organic feel)
    particles.rotation.y = time * 0.15;
    particles.rotation.x = time * 0.1;
    
    // Aggressive parallax effect tied to mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
