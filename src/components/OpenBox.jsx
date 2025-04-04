import React from "react";

function OpenBox({ width, height, depth, position }) {
  const outerMaterial = (
    <meshStandardMaterial
      color="#99ccff"
      side={2}
      metalness={0.3}
      roughness={0.4}
      envMapIntensity={1}
    />
  );

  const innerMaterial = (
    <meshStandardMaterial
      color="#007acc"
      side={2}
      metalness={0.1}
      roughness={0.8}
      envMapIntensity={0.5}
    />
  );

  return (
    <group position={position} castShadow receiveShadow>
      <mesh
        position={[width / 2, 0, depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        {outerMaterial}
      </mesh>
      <mesh position={[width / 2, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>
      <mesh position={[width / 2, height / 2, depth]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>
      <mesh
        position={[0, height / 2, depth / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>
      <mesh
        position={[width, height / 2, depth / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>
      <group position={[0, 0, 0]}>
        <mesh
          position={[width / 2, 0.01, depth / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width - 0.02, depth - 0.02]} />
          {innerMaterial}
        </mesh>
        <mesh position={[width / 2, height / 2, 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        <mesh position={[width / 2, height / 2, depth - 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        <mesh
          position={[0.01, height / 2, depth / 2]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        <mesh
          position={[width - 0.01, height / 2, depth / 2]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
      </group>
    </group>
  );
}

export default OpenBox;
