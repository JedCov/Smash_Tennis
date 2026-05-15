import { useMemo } from 'react';
import * as THREE from 'three';

export function Court() {
  const courtWidth = 10;
  const courtLength = 23.77; // Standard length
  const singlesWidth = 8.23;
  const doublesWidth = 10.97;
  const serviceLinePos = 6.4;
  const lineWidth = 0.08;

  return (
    <group>
      {/* Surrounding Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[40, 50]} />
        <meshStandardMaterial color="#1e40af" /> {/* Blue surrounding */}
      </mesh>

      {/* Main Playing Surface (Doubles) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[doublesWidth, courtLength]} />
        <meshStandardMaterial color="#166534" /> {/* Green court */}
      </mesh>

      {/* Lines Group */}
      <group position={[0, 0.01, 0]}>
        {/* Baselines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, courtLength / 2]}>
          <planeGeometry args={[doublesWidth, lineWidth]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -courtLength / 2]}>
          <planeGeometry args={[doublesWidth, lineWidth]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Doubles Sidelines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[doublesWidth / 2, 0, 0]}>
          <planeGeometry args={[lineWidth, courtLength]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-doublesWidth / 2, 0, 0]}>
          <planeGeometry args={[lineWidth, courtLength]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Singles Sidelines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[singlesWidth / 2, 0, 0]}>
          <planeGeometry args={[lineWidth, courtLength]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-singlesWidth / 2, 0, 0]}>
          <planeGeometry args={[lineWidth, courtLength]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Service Lines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, serviceLinePos]}>
          <planeGeometry args={[singlesWidth, lineWidth]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -serviceLinePos]}>
          <planeGeometry args={[singlesWidth, lineWidth]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Center Service Line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[lineWidth, serviceLinePos * 2]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Center Marks */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, courtLength / 2 - 0.2]}>
          <planeGeometry args={[lineWidth, 0.4]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -courtLength / 2 + 0.2]}>
          <planeGeometry args={[lineWidth, 0.4]} />
          <meshBasicMaterial color="white" />
        </mesh>

        {/* Mid court line (net position mark) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[doublesWidth, lineWidth * 0.5]} />
          <meshBasicMaterial color="white" opacity={0.3} transparent />
        </mesh>
      </group>

      {/* Net */}
      <group position={[0, 0.52, 0]}>
        <mesh>
          <boxGeometry args={[doublesWidth + 0.4, 1.05, 0.02]} />
          <meshStandardMaterial 
            color="white" 
            transparent 
            opacity={0.3} 
            wireframe={true} // Net texture feel
          />
        </mesh>
        {/* Net Top Band */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[doublesWidth + 0.4, 0.08, 0.03]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>

      {/* Net Posts */}
      <mesh position={[doublesWidth / 2 + 0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-doublesWidth / 2 - 0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
