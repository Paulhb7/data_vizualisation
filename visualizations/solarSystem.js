// Visualisation du Système Solaire
function initSolarSystem() {
    // Configuration du système solaire
    const SOLAR_SYSTEM = {
        sun: {
            radius: 0.5,
            color: 0xffcc00
        },
        planets: [
            { name: 'Mercure', distance: 1.5, radius: 0.08, color: 0x8c7853 },
            { name: 'Vénus', distance: 2.0, radius: 0.1, color: 0xffc649 },
            { name: 'Terre', distance: 2.5, radius: 0.12, color: 0x4a90e2 },
            { name: 'Mars', distance: 3.2, radius: 0.1, color: 0xcd5c5c },
            { name: 'Jupiter', distance: 4.5, radius: 0.25, color: 0xd8ca9d },
            { name: 'Saturne', distance: 5.5, radius: 0.22, color: 0xfad5a5 },
            { name: 'Uranus', distance: 6.5, radius: 0.15, color: 0x4fd0e7 },
            { name: 'Neptune', distance: 7.5, radius: 0.14, color: 0x4b70dd }
        ]
    };

    const controls = {
        rotationX: 0,
        rotationY: 0,
        distance: 15
    };
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    currentScene = scene;

    // Créer la caméra
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    currentCamera = camera;

    function updateCameraPosition() {
        const x = Math.sin(controls.rotationY) * Math.cos(controls.rotationX) * controls.distance;
        const y = Math.sin(controls.rotationX) * controls.distance;
        const z = Math.cos(controls.rotationY) * Math.cos(controls.rotationX) * controls.distance;
        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
    }
    updateCameraPosition();

    // Créer le renderer
    const container = document.getElementById('canvas-container');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    currentRenderer = renderer;

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Créer le soleil
    const sunGeometry = new THREE.SphereGeometry(SOLAR_SYSTEM.sun.radius, 32, 32);
    const sunMaterial = new THREE.MeshPhongMaterial({ 
        color: SOLAR_SYSTEM.sun.color,
        emissive: SOLAR_SYSTEM.sun.color,
        emissiveIntensity: 0.5
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Créer les planètes
    SOLAR_SYSTEM.planets.forEach((planetData) => {
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.01, planetData.distance + 0.01, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x444455,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = -Math.PI / 2;
        scene.add(orbit);

        const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({ color: planetData.color });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.x = planetData.distance;
        scene.add(planet);
    });

    // Contrôles
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            controls.rotationY += deltaX * 0.01;
            controls.rotationX += deltaY * 0.01;
            controls.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.rotationX));
            updateCameraPosition();
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        controls.distance += e.deltaY * 0.01;
        controls.distance = Math.max(5, Math.min(30, controls.distance));
        updateCameraPosition();
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation
    function animate() {
        animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
    
    currentVisualization = 'solar';
}

