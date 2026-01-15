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

function Bear({ onInteract }: { onInteract: () => void }) {
    const headRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (headRef.current) {
            // Smooth look at mouse
            const targetX = (state.mouse.x * Math.PI) / 6;
            const targetY = (state.mouse.y * Math.PI) / 6;
            headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);
        }
    });

    return (
        <group
            onClick={onInteract}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            scale={hovered ? 1.1 : 1}
            position={[0, -1, 0]}
        >
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* Body Group */}
                <group ref={bodyRef}>
                    {/* Body */}
                    <mesh position={[0, 0, 0]}>
                        <capsuleGeometry args={[0.9, 1.2, 4, 8]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.6} />
                    </mesh>

                    {/* Belly */}
                    <mesh position={[0, 0, 0.85]}>
                        <sphereGeometry args={[0.6, 32, 32]} />
                        <meshStandardMaterial color="#D2b48C" />
                    </mesh>

                    {/* Arms */}
                    <mesh position={[-0.9, 0.2, 0]} rotation={[0, 0, -0.5]}>
                        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.9, 0.2, 0]} rotation={[0, 0, 0.5]}>
                        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>

                    {/* Legs */}
                    <mesh position={[-0.5, -0.8, 0.3]} rotation={[-0.5, 0, 0]}>
                        <capsuleGeometry args={[0.28, 0.6, 4, 8]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.5, -0.8, 0.3]} rotation={[-0.5, 0, 0]}>
                        <capsuleGeometry args={[0.28, 0.6, 4, 8]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                </group>

                {/* Head Group - Rotates to look at mouse */}
                <group ref={headRef} position={[0, 1.1, 0]}>
                    {/* Head Shape */}
                    <mesh>
                        <sphereGeometry args={[0.85, 32, 32]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.6} />
                    </mesh>

                    {/* Snout */}
                    <mesh position={[0, -0.1, 0.75]} scale={[1, 0.8, 1]}>
                        <sphereGeometry args={[0.35, 32, 32]} />
                        <meshStandardMaterial color="#D2b48C" />
                    </mesh>

                    {/* Nose */}
                    <mesh position={[0, 0, 1.05]}>
                        <sphereGeometry args={[0.1, 16, 16]} />
                        <meshStandardMaterial color="#3E2723" roughness={0.2} />
                    </mesh>

                    {/* Eyes */}
                    <mesh position={[-0.3, 0.2, 0.75]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial color="black" roughness={0.1} />
                    </mesh>
                    <mesh position={[0.3, 0.2, 0.75]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial color="black" roughness={0.1} />
                    </mesh>

                    {/* Ears */}
                    <mesh position={[-0.7, 0.6, 0]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[-0.7, 0.6, 0.2]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshStandardMaterial color="#D2b48C" />
                    </mesh>

                    <mesh position={[0.7, 0.6, 0]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.7, 0.6, 0.2]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshStandardMaterial color="#D2b48C" />
                    </mesh>
                </group>
            </Float>
        </group>
    );
}

export default function LovableBear3D() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    const handleInteract = () => {
        // Change phrase
        setPhraseIndex(prev => (prev + 1) % PHRASES.length);

        // Confetti explosion of hearts
        const scalar = 2;
        const heart = confetti.shapeFromText({ text: '❤️', scalar });

        confetti({
            particleCount: 30,
            scalar: 2,
            shapes: [heart],
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="w-full h-80 relative flex flex-col items-center justify-center animate-fade-in my-6">

            {/* 3D Scene */}
            <div className="w-full h-full absolute inset-0 z-10">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                    <Environment preset="city" />

                    <Bear onInteract={handleInteract} />

                    <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} />
                </Canvas>
            </div>

            {/* Speech Bubble Overlay */}
            <div className="z-20 absolute -top-4 md:right-1/4 pointer-events-none animate-bounce-slow">
                <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl rounded-bl-none shadow-lg border-2 border-brand-500/20 max-w-xs">
                    <p className="text-lg font-black text-brand-600 dark:text-brand-400 text-center leading-tight">
                        "{PHRASES[phraseIndex]}"
                    </p>
                </div>
            </div>

            <p className="z-20 absolute bottom-4 text-xs font-medium text-gray-400 dark:text-gray-500 pointer-events-none">
                ¡Haz click en mí! 👆
            </p>
        </div>
    );
}
