# Sabinam Mahato | Portfolio

A single-page personal portfolio website for Sabinam Mahato, a Full-Stack AI Engineer. It is built with plain HTML, CSS, and JavaScript, with 3D visuals made using Three.js.

It includes Home, About, Skills, Projects, and Contact sections, and works on both desktop and mobile.

## Project Structure

```
myself/
├── index.html              # Main page
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── scripts.js          # Interactions, skills/projects data, form, 3D scenes
│   └── three-fallback.js   # Backup CDN loader for Three.js
└── images/
    ├── portrait.jpg        # Desktop portrait
    └── portrait-mobile.jpg # Mobile portrait
```

## Run it

Open `index.html` in any browser. No install or build step is needed. An internet connection is required for the fonts and Three.js.

## Note

The contact form only simulates sending a message. To make it work, connect it to a backend or a form service such as Formspree or EmailJS in `js/scripts.js`.