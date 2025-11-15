// Visualisation de Particules
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Créer un cercle dégradé
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function initParticles() {
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let material = null;
    let particles = null;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    currentScene = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.z = 1000;
    currentCamera = camera;

    // Créer le renderer
    const container = document.getElementById('canvas-container');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    currentRenderer = renderer;

    // Créer la géométrie des particules
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 10000;

    for (let i = 0; i < particleCount; i++) {
        const x = 2000 * Math.random() - 1000;
        const y = 2000 * Math.random() - 1000;
        const z = 2000 * Math.random() - 1000;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Créer la texture de particule
    const sprite = createParticleTexture();

    // Créer le matériau
    material = new THREE.PointsMaterial({
        size: 35,
        sizeAttenuation: true,
        map: sprite,
        alphaTest: 0.5,
        transparent: true
    });
    material.color.setHSL(1.0, 0.3, 0.7);

    // Créer les particules
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Gestion du mouvement de la souris
    function onPointerMove(event) {
        if (event.isPrimary === false) return;
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);
    currentEventListeners.push({ element: document.body, event: 'pointermove', handler: onPointerMove });

    // Redimensionnement
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);
    currentEventListeners.push({ element: window, event: 'resize', handler: onWindowResize });

    // Animation
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        const time = Date.now() * 0.00005;
        
        // Suivre la souris
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        // Changer la couleur avec le temps
        const h = (360 * (1.0 + time) % 360) / 360;
        material.color.setHSL(h, 0.5, 0.5);
        
        renderer.render(scene, camera);
    }
    animate();
    
    currentVisualization = 'particles';
}

