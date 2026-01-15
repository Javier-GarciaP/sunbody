import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

const PHRASES = [
    "¡Eres increíble!",
    "Te amo ❤️",
    "¡Sigue brillando!",
    "Tu esfuerzo vale la pena",
    "Eres capaz de todo",
    "¡Hoy será un gran día!",
    "Confío en ti",
    "Eres mi orgullo",
    "¡Nunca te rindas!",
    "Lo estás haciendo genial",
];

function Bear({ onInteract, isJumping }: { onInteract: () => void; isJumping: boolean }) {
    const headRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Warm colors
    const colors = {
        fur: "#D9A066", // Honey Brown
        belly: "#F5E6D3", // Cream
        nose: "#5D4037", // Dark Brown
        blush: "#FFB7B2", // Soft Pink
    };

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Breathing animation (subtle scale)
        if (bodyRef.current) {
            const scale = 1 + Math.sin(time * 2) * 0.02;
            bodyRef.current.scale.set(scale, scale, scale);
        }

        // Head follow mouse with dampening
        if (headRef.current) {
            const targetX = (state.mouse.x * Math.PI) / 8;
            const targetY = (state.mouse.y * Math.PI) / 8;
            headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);

            // Subtle head bob
            headRef.current.position.y = 1.05 + Math.sin(time * 1.5) * 0.02;
        }

        // Jump animation handling
        if (groupRef.current && isJumping) {
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
        }
    });

    // Jump effect logic is handled by the parent trigger rerendering position, 
    // or we can use a spring lib. For simplicity, we'll use a basic group position for 'float' and manual offset.
    // Actually, Float handles the idle float. We can add an extra bounce in logic if needed, 
    // but the 'scale' on click or 'isJumping' could be just a quick visual pop.

    // Using a simple spring-like motion for jump would be better with useSpring but trying to keep deps low.
    // Let's stick to the subtle animations and the "pop" on click via scale/position in local state if needed.

    return (
        <group
            ref={groupRef}
            onClick={onInteract}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            scale={hovered ? 1.05 : 1}
            position={[0, -0.8, 0]}
        >
            <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.3} floatingRange={[0, 0.2]}>
                {/* Body Group */}
                <group ref={bodyRef}>
                    {/* Main Body - Rounder */}
                    <mesh position={[0, -0.2, 0]}>
                        <sphereGeometry args={[0.95, 32, 32]} />
                        <meshStandardMaterial color={colors.fur} roughness={0.7} />
                    </mesh>

                    {/* Belly - Soft Cream */}
                    <mesh position={[0, -0.2, 0.4]}>
                        <sphereGeometry args={[0.65, 32, 32]} />
                        <meshStandardMaterial color={colors.belly} roughness={0.8} />
                    </mesh>

                    {/* Arms - Rounded and cute */}
                    <mesh position={[-0.85, 0.1, 0.1]} rotation={[0, 0, -0.8]}>
                        <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>
                    <mesh position={[0.85, 0.1, 0.1]} rotation={[0, 0, 0.8]}>
                        <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>

                    {/* Legs - Stubby */}
                    <mesh position={[-0.5, -0.9, 0.3]} rotation={[-0.3, 0, -0.1]}>
                        <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>
                    <mesh position={[0.5, -0.9, 0.3]} rotation={[-0.3, 0, 0.1]}>
                        <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>
                </group>

                {/* Head Group */}
                <group ref={headRef} position={[0, 1.05, 0]}>
                    {/* Head Shape - Big and Round */}
                    <mesh>
                        <sphereGeometry args={[0.9, 32, 32]} />
                        <meshStandardMaterial color={colors.fur} roughness={0.7} />
                    </mesh>

                    {/* Snout */}
                    <mesh position={[0, -0.15, 0.8]} scale={[1, 0.75, 0.6]}>
                        <sphereGeometry args={[0.4, 32, 32]} />
                        <meshStandardMaterial color={colors.belly} />
                    </mesh>

                    {/* Nose - Heart shape-ish triangle or just soft round */}
                    <mesh position={[0, -0.1, 1.02]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshStandardMaterial color={colors.nose} roughness={0.3} />
                    </mesh>

                    {/* Eyes - Shiny */}
                    <group position={[0, 0.1, 0.85]}>
                        {/* Left Eye */}
                        <mesh position={[-0.35, 0, 0]}>
                            <sphereGeometry args={[0.09, 16, 16]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
                        </mesh>
                        <mesh position={[-0.32, 0.04, 0.07]}>
                            <sphereGeometry args={[0.03, 8, 8]} />
                            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                        </mesh>

                        {/* Right Eye */}
                        <mesh position={[0.35, 0, 0]}>
                            <sphereGeometry args={[0.09, 16, 16]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
                        </mesh>
                        <mesh position={[0.38, 0.04, 0.07]}>
                            <sphereGeometry args={[0.03, 8, 8]} />
                            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                        </mesh>
                    </group>

                    {/* Blush Cheeks */}
                    <mesh position={[-0.55, -0.1, 0.75]} scale={[1, 0.6, 1]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color={colors.blush} transparent opacity={0.6} />
                    </mesh>
                    <mesh position={[0.55, -0.1, 0.75]} scale={[1, 0.6, 1]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color={colors.blush} transparent opacity={0.6} />
                    </mesh>

                    {/* Ears - Rounder */}
                    <mesh position={[-0.7, 0.7, 0]}>
                        <sphereGeometry args={[0.32, 32, 32]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>
                    <mesh position={[-0.7, 0.7, 0.25]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshStandardMaterial color={colors.belly} />
                    </mesh>

                    <mesh position={[0.7, 0.7, 0]}>
                        <sphereGeometry args={[0.32, 32, 32]} />
                        <meshStandardMaterial color={colors.fur} />
                    </mesh>
                    <mesh position={[0.7, 0.7, 0.25]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshStandardMaterial color={colors.belly} />
                    </mesh>
                </group>
            </Float>
        </group>
    );
}

export default function LovableBear3D() {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isJumping, setIsJumping] = useState(false);

    const handleInteract = () => {
        // Change phrase
        setPhraseIndex(prev => (prev + 1) % PHRASES.length);

        // Trigger jump state (reset after short delay)
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 300);

        // Confetti explosion of hearts
        const scalar = 2;
        const heart = confetti.shapeFromText({ text: '❤️', scalar });

        confetti({
            particleCount: 35,
            scalar: 2.5,
            shapes: [heart],
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FFB7B2', '#FF69B4', '#FFC0CB']
        });
    };

    return (
        <div className="w-full h-80 relative flex flex-col items-center justify-center animate-fade-in my-8">

            {/* 3D Scene */}
            <div className="w-full h-full absolute inset-0 z-10 transition-transform duration-300 hover:scale-[1.02]">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={45} />

                    {/* Warmer Lighting */}
                    <ambientLight intensity={0.8} color="#FFF3E0" />
                    <spotLight
                        position={[5, 10, 5]}
                        angle={0.2}
                        penumbra={1}
                        intensity={1.2}
                        color="#FFD54F"
                        castShadow
                        shadow-mapSize={1024}
                    />
                    <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFE0B2" />

                    <Environment preset="city" />

                    <Bear onInteract={handleInteract} isJumping={isJumping} />

                    <ContactShadows position={[0, -2, 0]} opacity={0.35} scale={10} blur={2.5} far={4} color="#5D4037" />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 2.2}
                        maxPolarAngle={Math.PI / 1.8}
                        minAzimuthAngle={-Math.PI / 4}
                        maxAzimuthAngle={Math.PI / 4}
                    />
                </Canvas>
            </div>

            {/* Speech Bubble Overlay */}
            <div className="z-20 absolute -top-6 md:right-1/4 pointer-events-none">
                <div className="animate-bounce-slow bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-bl-sm shadow-xl border border-orange-100 dark:border-gray-700 max-w-xs transform hover:scale-105 transition-transform duration-300">
                    <p className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent text-center leading-tight">
                        "{PHRASES[phraseIndex]}"
                    </p>
                </div>
            </div>

            <p className="z-20 absolute bottom-2 text-sm font-medium text-orange-400 dark:text-orange-300/60 pointer-events-none animate-pulse">
                ✨ ¡Haz click para amor! ✨
            </p>
        </div>
    );
}
