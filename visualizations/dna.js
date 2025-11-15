// Visualisation de l'ADN
function initDNA() {
    const DNA_CONFIG = {
        helixRadius: 0.8,
        basePairs: 30,
        helixHeight: 0.25,
        baseRadius: 0.12,
        sugarPhosphateRadius: 0.06
    };

    const controls = {
        rotationX: 0.3,
        rotationY: 0,
        distance: 10
    };
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let dnaGroup = null;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a2e);
    currentScene = scene;

    // Fond dégradé
    const gradientGeometry = new THREE.PlaneGeometry(200, 200);
    const gradientMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x0a1a2e) },
            color2: { value: new THREE.Color(0x1a3a4e) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
    const gradientPlane = new THREE.Mesh(gradientGeometry, gradientMaterial);
    gradientPlane.position.z = -50;
    scene.add(gradientPlane);

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

    // Lumière
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight1.position.set(5, 8, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x88ccff, 0.4);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);

    // Créer l'ADN
    dnaGroup = new THREE.Group();
    for (let i = 0; i < DNA_CONFIG.basePairs; i++) {
        const angle = (i / DNA_CONFIG.basePairs) * Math.PI * 4;
        const y = (i - DNA_CONFIG.basePairs / 2) * DNA_CONFIG.helixHeight;
        const x1 = Math.cos(angle) * DNA_CONFIG.helixRadius;
        const z1 = Math.sin(angle) * DNA_CONFIG.helixRadius;
        const x2 = Math.cos(angle + Math.PI) * DNA_CONFIG.helixRadius;
        const z2 = Math.sin(angle + Math.PI) * DNA_CONFIG.helixRadius;

        const base1 = new THREE.Mesh(
            new THREE.SphereGeometry(DNA_CONFIG.baseRadius, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0x4dd0e1,
                emissive: 0x00acc1,
                emissiveIntensity: 0.3,
                shininess: 100,
                specular: 0x88ccff
            })
        );
        base1.position.set(x1, y, z1);
        dnaGroup.add(base1);

        const base2 = new THREE.Mesh(
            new THREE.SphereGeometry(DNA_CONFIG.baseRadius, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0x4dd0e1,
                emissive: 0x00acc1,
                emissiveIntensity: 0.3,
                shininess: 100,
                specular: 0x88ccff
            })
        );
        base2.position.set(x2, y, z2);
        dnaGroup.add(base2);

        const bond = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, DNA_CONFIG.helixRadius * 2, 8),
            new THREE.MeshPhongMaterial({
                color: 0x666666,
                emissive: 0x333333,
                emissiveIntensity: 0.1,
                shininess: 50
            })
        );
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        bond.position.set(midX, y, midZ);
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.sqrt(dx * dx + dz * dz);
        bond.scale.y = length / (DNA_CONFIG.helixRadius * 2);
        bond.lookAt(x2, y, z2);
        bond.rotateX(Math.PI / 2);
        dnaGroup.add(bond);

        if (i > 0) {
            const prevAngle = ((i - 1) / DNA_CONFIG.basePairs) * Math.PI * 4;
            const prevX1 = Math.cos(prevAngle) * DNA_CONFIG.helixRadius;
            const prevZ1 = Math.sin(prevAngle) * DNA_CONFIG.helixRadius;
            const prevY = ((i - 1) - DNA_CONFIG.basePairs / 2) * DNA_CONFIG.helixHeight;
            const dx = x1 - prevX1;
            const dy = y - prevY;
            const dz = z1 - prevZ1;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const backbone1 = new THREE.Mesh(
                new THREE.CylinderGeometry(DNA_CONFIG.sugarPhosphateRadius, DNA_CONFIG.sugarPhosphateRadius, length, 16),
                new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    emissive: 0x111111,
                    emissiveIntensity: 0.1,
                    shininess: 80,
                    specular: 0x444444
                })
            );
            backbone1.position.set((prevX1 + x1) / 2, (prevY + y) / 2, (prevZ1 + z1) / 2);
            backbone1.lookAt(x1, y, z1);
            backbone1.rotateX(Math.PI / 2);
            dnaGroup.add(backbone1);

            const prevX2 = Math.cos(prevAngle + Math.PI) * DNA_CONFIG.helixRadius;
            const prevZ2 = Math.sin(prevAngle + Math.PI) * DNA_CONFIG.helixRadius;
            const dx2 = x2 - prevX2;
            const dy2 = y - prevY;
            const dz2 = z2 - prevZ2;
            const length2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);
            const backbone2 = new THREE.Mesh(
                new THREE.CylinderGeometry(DNA_CONFIG.sugarPhosphateRadius, DNA_CONFIG.sugarPhosphateRadius, length2, 16),
                new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    emissive: 0x111111,
                    emissiveIntensity: 0.1,
                    shininess: 80,
                    specular: 0x444444
                })
            );
            backbone2.position.set((prevX2 + x2) / 2, (prevY + y) / 2, (prevZ2 + z2) / 2);
            backbone2.lookAt(x2, y, z2);
            backbone2.rotateX(Math.PI / 2);
            dnaGroup.add(backbone2);
        }
    }
    scene.add(dnaGroup);

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
        controls.distance = Math.max(5, Math.min(25, controls.distance));
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
        dnaGroup.rotation.y += 0.003;
        renderer.render(scene, camera);
    }
    animate();
    
    currentVisualization = 'dna';
}

