import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import "./App.css";

// 添加盒子比例系数
const BOX_SCALE_FACTOR = 0.1;

function Cup({ position, scale = 25, rotation = 0 }) {
  const { scene } = useGLTF("/cup.glb");
  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
    />
  );
}

function OpenBox({ width, height, depth, position }) {
  // 将输入的尺寸乘以比例系数
  const scaledWidth = width * BOX_SCALE_FACTOR;
  const scaledHeight = height * BOX_SCALE_FACTOR;
  const scaledDepth = depth * BOX_SCALE_FACTOR;

  // 创建内外不同的材质
  const outerMaterial = (
    <meshStandardMaterial
      color="#4a90e2"
      side={2}
      metalness={0.3}
      roughness={0.4}
      envMapIntensity={1}
    />
  );

  const innerMaterial = (
    <meshStandardMaterial
      color="#2c3e50"
      side={2}
      metalness={0.1}
      roughness={0.8}
      envMapIntensity={0.5}
    />
  );

  return (
    <group position={position} castShadow receiveShadow>
      {/* 底面 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[scaledWidth, scaledDepth]} />
        {outerMaterial}
      </mesh>
      {/* 前面 */}
      <mesh position={[0, scaledHeight / 2, -scaledDepth / 2]}>
        <planeGeometry args={[scaledWidth, scaledHeight]} />
        {outerMaterial}
      </mesh>
      {/* 后面 */}
      <mesh position={[0, scaledHeight / 2, scaledDepth / 2]}>
        <planeGeometry args={[scaledWidth, scaledHeight]} />
        {outerMaterial}
      </mesh>
      {/* 左面 */}
      <mesh
        position={[-scaledWidth / 2, scaledHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[scaledDepth, scaledHeight]} />
        {outerMaterial}
      </mesh>
      {/* 右面 */}
      <mesh
        position={[scaledWidth / 2, scaledHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[scaledDepth, scaledHeight]} />
        {outerMaterial}
      </mesh>

      {/* 内部面 */}
      <group position={[0, 0, 0]}>
        {/* 内部底面 */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[scaledWidth - 0.02, scaledDepth - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部前面 */}
        <mesh position={[0, scaledHeight / 2, -scaledDepth / 2 + 0.01]}>
          <planeGeometry args={[scaledWidth - 0.02, scaledHeight - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部后面 */}
        <mesh position={[0, scaledHeight / 2, scaledDepth / 2 - 0.01]}>
          <planeGeometry args={[scaledWidth - 0.02, scaledHeight - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部左面 */}
        <mesh
          position={[-scaledWidth / 2 + 0.01, scaledHeight / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[scaledDepth - 0.02, scaledHeight - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部右面 */}
        <mesh
          position={[scaledWidth / 2 - 0.01, scaledHeight / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[scaledDepth - 0.02, scaledHeight - 0.02]} />
          {innerMaterial}
        </mesh>
      </group>
    </group>
  );
}

function AnimatedScene({
  cupScale,
  cupRotation,
  boxWidth,
  boxHeight,
  boxDepth,
  isOverlapping,
}) {
  const { position: cupPosition } = useSpring({
    position: isOverlapping ? [0, 0, 0] : [-3, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const { position: boxPosition } = useSpring({
    position: isOverlapping ? [0, -0.5, 0] : [3, -0.5, 0],
    config: { mass: 1, tension: 280, friction: 60 },
  });

  return (
    <>
      <animated.group position={cupPosition}>
        <Suspense fallback={null}>
          <Cup
            position={[0, -0.49, 0]}
            scale={cupScale}
            rotation={cupRotation}
          />
        </Suspense>
      </animated.group>
      <animated.group position={boxPosition}>
        <OpenBox
          width={boxWidth}
          height={boxHeight}
          depth={boxDepth}
          position={[0, 0, 0]}
        />
      </animated.group>
    </>
  );
}

function App() {
  const [cupScale, setCupScale] = useState(25);
  const [cupRotation, setCupRotation] = useState(0);
  const [boxWidth, setBoxWidth] = useState(25);
  const [boxHeight, setBoxHeight] = useState(25);
  const [boxDepth, setBoxDepth] = useState(25);
  const [isOverlapping, setIsOverlapping] = useState(false);

  const handleCheckFit = () => {
    setIsOverlapping(!isOverlapping);
  };

  const handleRotate45 = () => {
    setCupRotation((prev) => (prev + Math.PI / 4) % (2 * Math.PI));
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <h2>3D 场景控制</h2>

        <div className="control-group">
          <h3>杯子设置</h3>
          <label>杯子大小：</label>
          <input
            type="number"
            value={cupScale}
            onChange={(e) => setCupScale(Number(e.target.value))}
            min="0.1"
            step="0.1"
          />
          <label>旋转角度（度）：</label>
          <input
            type="number"
            value={((cupRotation * 180) / Math.PI).toFixed(1)}
            onChange={(e) =>
              setCupRotation((Number(e.target.value) * Math.PI) / 180)
            }
            step="1"
          />
          <button onClick={handleRotate45}>旋转45度</button>
        </div>

        <div className="control-group">
          <h3>盒子设置</h3>
          <label>长度：</label>
          <input
            type="number"
            value={boxWidth}
            onChange={(e) => setBoxWidth(Number(e.target.value))}
            min="1"
            max="50"
            step="1"
          />
          <label>宽度：</label>
          <input
            type="number"
            value={boxDepth}
            onChange={(e) => setBoxDepth(Number(e.target.value))}
            min="1"
            max="50"
            step="1"
          />
          <label>高度：</label>
          <input
            type="number"
            value={boxHeight}
            onChange={(e) => setBoxHeight(Number(e.target.value))}
            min="1"
            max="50"
            step="1"
          />
        </div>

        <div className="control-group">
          <button className="check-button" onClick={handleCheckFit}>
            {isOverlapping ? "分离物体" : "检查是否合适"}
          </button>
        </div>
      </div>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }} shadows>
          <color attach="background" args={["#1a1a1a"]} />

          {/* 环境光 */}
          <ambientLight intensity={0.3} />

          {/* 主光源 */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* 辅助光源 */}
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          <pointLight position={[0, -5, 0]} intensity={0.3} />

          <AnimatedScene
            cupScale={cupScale}
            cupRotation={cupRotation}
            boxWidth={boxWidth}
            boxHeight={boxHeight}
            boxDepth={boxDepth}
            isOverlapping={isOverlapping}
          />

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
