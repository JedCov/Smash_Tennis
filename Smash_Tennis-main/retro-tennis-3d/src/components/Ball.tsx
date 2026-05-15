import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface BallHandle {
  reset: (pos: [number, number, number], vel: [number, number, number]) => void;
  getPosition: () => THREE.Vector3;
  getVelocity: () => THREE.Vector3;
  setVelocity: (vel: THREE.Vector3) => void;
}

interface BallProps {
  isActive?: boolean;
  timeScale?: number;
  isHighlighted?: boolean;
}

export const Ball = forwardRef<BallHandle, BallProps>(({ isActive = true, timeScale = 1, isHighlighted = false }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const gravity = -1.5; // Extremly slow gravity for high-accessibility play

  useImperativeHandle(ref, () => ({
    reset: (pos, vel) => {
      if (meshRef.current) {
        meshRef.current.position.set(...pos);
      }
      velocity.current.set(...vel);
    },
    getPosition: () => meshRef.current?.position.clone() || new THREE.Vector3(),
    getVelocity: () => velocity.current.clone(),
    setVelocity: (vel: THREE.Vector3) => {
        velocity.current.copy(vel);
    }
  }));

  useFrame((_, delta) => {
    if (!meshRef.current || !shadowRef.current) return;

    if (isActive) {
        // Apply gravity
        const scaledDelta = delta * timeScale;
        velocity.current.y += gravity * scaledDelta;

        // Apply velocity
        meshRef.current.position.addScaledVector(velocity.current, scaledDelta);

        // Bounce on floor
        if (meshRef.current.position.y < 0.1) {
            meshRef.current.position.y = 0.1;
            velocity.current.y = Math.abs(velocity.current.y) * 0.7; // bounce damping
        }
    }

    const pulse = 1 + Math.sin(Date.now() * 0.02) * 0.12;
    meshRef.current.scale.setScalar(isHighlighted ? pulse * 1.35 : 1);
    if (glowRef.current) {
        glowRef.current.visible = isHighlighted;
        glowRef.current.position.copy(meshRef.current.position);
        glowRef.current.scale.setScalar(pulse);
    }

    // Shadow following ball on floor
    shadowRef.current.position.x = meshRef.current.position.x;
    shadowRef.current.position.z = meshRef.current.position.z;
    shadowRef.current.scale.setScalar(1 / (meshRef.current.position.y + 1));
  });

  return (
    <group>
        <mesh ref={meshRef} position={[0, 5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={isHighlighted ? "#fef08a" : "#bef264"} emissive={isHighlighted ? "#f97316" : "#000000"} emissiveIntensity={isHighlighted ? 0.7 : 0} /> {/* Tennis ball yellow-green */}
        </mesh>
        <mesh ref={glowRef} visible={false}>
            <sphereGeometry args={[0.34, 24, 24]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.35} />
        </mesh>
        <mesh
            ref={shadowRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
        >
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.3} />
        </mesh>
    </group>
  );
});
