import React from "react";

function Cup({ position, rotation = 0, cupRef }) {
  const cupHeight = 9.5; // 杯子高度
  const cupRadius = 4; // 杯子半径
  const handleRadius = 3; // 把手环半径 4.25
  const handleThickness = 0.5; // 把手粗细
  const handleDistance = 4; // 把手到杯子中心的距离
  const handleHeight = 5; // 把手在垂直方向的位置

  const cupMaterial = (
    <meshStandardMaterial
      color="#e0e0e0"
      metalness={0.3}
      roughness={0.4}
      envMapIntensity={1}
    />
  );

  return (
    <group position={position} rotation={[0, rotation, 0]} ref={cupRef}>
      <mesh position={[0, cupHeight / 2, 0]}>
        <cylinderGeometry args={[cupRadius, cupRadius, cupHeight, 32]} />
        {cupMaterial}
      </mesh>
      <mesh
        position={[handleDistance, handleHeight, 0]}
        rotation={[0, Math.PI, Math.PI / 2]}
      >
        <torusGeometry
          args={[handleRadius, handleThickness, 16, 32, Math.PI]}
        />
        {cupMaterial}
      </mesh>
    </group>
  );
}

export default Cup;
