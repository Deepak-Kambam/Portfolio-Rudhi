# Samruddhi — Premium Product Engineering Portfolio

A high-end, award-winning style portfolio website built for Samruddhi. The architecture focuses on premium typography, smooth scroll physics, and a deeply interactive 3D WebGL background, inspired by top creative studios like Lusion.

## 🚀 Tech Stack

This project is built using a **"Buildless" Architecture**, meaning it requires no bundlers (like Webpack or Vite) or Node.js to run. It executes directly in any modern browser using native ES6 Modules and CDN imports.

### Core Web Technologies
* **HTML5**: Semantic structure and CSS Masking wrappers.
* **CSS3**: Advanced grid layouts, custom variables for the dark/rose design system, and cubic-bezier transitions.
* **Vanilla JavaScript (ES6)**: Modular architecture separating data (`src/data/`) from the UI logic (`main.js`).

### 3D & WebGL
* **Three.js**: Used to render the interactive abstract geometric background. Includes custom materials, fog, and mouse-driven parallax physics. 

### Animation & Physics Engine
* **GSAP (GreenSock)**: The core animation engine used for the custom liquid cursor, magnetic buttons, and cinematic typography reveals.
* **GSAP ScrollTrigger**: Used to tie DOM animations directly to the user's scroll progress.
* **Lenis**: A lightweight virtual scroll library used to override native rigid browser scrolling with buttery, fluid "liquid" scroll physics.

## 📁 Architecture

* `index.html`: The main UI shell containing the DOM structure.
* `style.css`: The premium design system tokens and responsive layouts.
* `main.js`: The central controller for Three.js, GSAP, Lenis, and DOM injection.
* `src/data/`: Decoupled data files (`projects.js`, `skills.js`) acting as a headless CMS.

## 🛠️ How to Run
Since it is buildless, you can run this project using any simple local server. For example:
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your browser.
