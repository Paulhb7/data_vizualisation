// Visualisation de Galaxie
function initGalaxy() {
    let controls = null;
    let galaxyMesh = null;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x201919);
    currentScene = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4, 2, 5);
    currentCamera = camera;

    // Créer le renderer
    const container = document.getElementById('canvas-container');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    currentRenderer = renderer;

    // Shaders pour la galaxie (améliorés selon le code original)
    const vertexShader = `
        attribute float aRadiusRatio;
        attribute float aBranchIndex;
        attribute vec3 aRandomOffset;
        
        uniform float uTime;
        uniform float uSize;
        uniform int uBranches;
        
        varying float vRadiusRatio;
        
        void main() {
            vRadiusRatio = aRadiusRatio;
            
            // Calculer l'angle de la branche
            float branchAngle = float(aBranchIndex) * (2.0 * 3.14159 / float(uBranches));
            float angle = branchAngle + uTime * (1.0 - aRadiusRatio);
            
            // Position sur le cercle avec pow(1.5) comme dans le code original
            float radius = pow(aRadiusRatio, 1.5) * 5.0;
            vec3 position = vec3(
                cos(angle),
                0.0,
                sin(angle)
            ) * radius;
            
            // Ajouter l'offset aléatoire (pow3 et add 0.2 comme dans le code original)
            vec3 randomPow3 = aRandomOffset * aRandomOffset * aRandomOffset;
            vec3 randomOffset = randomPow3 * aRadiusRatio + vec3(0.2);
            position += randomOffset;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = uSize * 300.0 * (1.0 / -mvPosition.z);
        }
    `;

    const fragmentShader = `
        uniform vec3 uColorInside;
        uniform vec3 uColorOutside;
        
        varying float vRadiusRatio;
        
        void main() {
            // Mélanger les couleurs selon le rayon (comme dans le code original)
            // radiusRatio.oneMinus().pow(2).oneMinus()
            float oneMinusRatio = 1.0 - vRadiusRatio;
            float colorMix = 1.0 - pow(oneMinusRatio, 2.0);
            vec3 color = mix(uColorInside, uColorOutside, colorMix);
            
            // Alpha basé sur la distance du centre (comme dans le code original)
            // 0.1 / (uv - 0.5).length() - 0.2
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            float alpha = 0.1 / dist - 0.2;
            alpha = clamp(alpha, 0.0, 1.0);
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    // Créer la géométrie et les attributs
    const particleCount = 20000;
    const branches = 3;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const radiusRatios = new Float32Array(particleCount);
    const branchIndices = new Float32Array(particleCount);
    const randomOffsets = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Ratio de rayon (0 à 1)
        const radiusRatio = Math.random();
        radiusRatios[i] = radiusRatio;
        
        // Index de branche
        branchIndices[i] = Math.floor(Math.random() * branches);
        
        // Offset aléatoire (range -1 à 1 comme dans le code original)
        randomOffsets[i3] = Math.random() * 2.0 - 1.0;
        randomOffsets[i3 + 1] = Math.random() * 2.0 - 1.0;
        randomOffsets[i3 + 2] = Math.random() * 2.0 - 1.0;
        
        // Position initiale (sera calculée dans le shader)
        positions[i3] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRadiusRatio', new THREE.BufferAttribute(radiusRatios, 1));
    geometry.setAttribute('aBranchIndex', new THREE.BufferAttribute(branchIndices, 1));
    geometry.setAttribute('aRandomOffset', new THREE.BufferAttribute(randomOffsets, 3));

    // Matériau avec couleurs modifiées
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 0.08 },
            uBranches: { value: branches },
            uColorInside: { value: new THREE.Color(0xffa575) }, // Couleur originale
            uColorOutside: { value: new THREE.Color(0x311599) }  // Couleur originale
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
    });

    // Créer les particules
    galaxyMesh = new THREE.Points(geometry, material);
    scene.add(galaxyMesh);

    // Contrôles de caméra (OrbitControls simplifié)
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let spherical = new THREE.Spherical(5, Math.PI / 3, 0);

    function updateCameraPosition() {
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
    }
    updateCameraPosition();

    const canvas = renderer.domElement;
    
    const onMouseDown = (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            updateCameraPosition();
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    };

    const onMouseUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    };

    const onMouseLeave = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    };

    const onWheel = (e) => {
        e.preventDefault();
        spherical.radius += e.deltaY * 0.01;
        spherical.radius = Math.max(0.1, Math.min(50, spherical.radius));
        updateCameraPosition();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel', onWheel);

    currentEventListeners.push(
        { element: canvas, event: 'mousedown', handler: onMouseDown },
        { element: canvas, event: 'mousemove', handler: onMouseMove },
        { element: canvas, event: 'mouseup', handler: onMouseUp },
        { element: canvas, event: 'mouseleave', handler: onMouseLeave },
        { element: canvas, event: 'wheel', handler: onWheel }
    );

    // Redimensionnement
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);
    currentEventListeners.push({ element: window, event: 'resize', handler: onWindowResize });

    // Animation
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // Mettre à jour le temps
        material.uniforms.uTime.value = Date.now() * 0.001;
        
        renderer.render(scene, camera);
    }
    animate();
    
    currentVisualization = 'galaxy';
}

