import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import "./App.css";

function Cup({ position, rotation = 0 }) {
  // 创建杯子材质
  const cupMaterial = (
    <meshStandardMaterial
      color="#e0e0e0"
      metalness={0.3}
      roughness={0.4}
      envMapIntensity={1}
    />
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 杯子主体 - 圆柱体 */}
      <mesh position={[0, 4.75, 0]}>
        <cylinderGeometry args={[4, 4, 9.5, 32]} />
        {cupMaterial}
      </mesh>

      {/* 杯子把手 - 半圆环 */}
      <mesh position={[4, 5, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
        <torusGeometry args={[4.25, 0.5, 16, 32, Math.PI]} />
        {cupMaterial}
      </mesh>
    </group>
  );
}

function OpenBox({ width, height, depth, position }) {
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
        <planeGeometry args={[width, depth]} />
        {outerMaterial}
      </mesh>
      {/* 前面 */}
      <mesh position={[0, height / 2, -depth / 2]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>
      {/* 后面 */}
      <mesh position={[0, height / 2, depth / 2]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>
      {/* 左面 */}
      <mesh
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>
      {/* 右面 */}
      <mesh
        position={[width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>

      {/* 内部面 */}
      <group position={[0, 0, 0]}>
        {/* 内部底面 */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width - 0.02, depth - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部前面 */}
        <mesh position={[0, height / 2, -depth / 2 + 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部后面 */}
        <mesh position={[0, height / 2, depth / 2 - 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部左面 */}
        <mesh
          position={[-width / 2 + 0.01, height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
        {/* 内部右面 */}
        <mesh
          position={[width / 2 - 0.01, height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>
      </group>
    </group>
  );
}

function AnimatedScene({
  cupRotation,
  cupPosition,
  boxWidth,
  boxHeight,
  boxDepth,
  isOverlapping,
}) {
  const { position: cupSpringPosition } = useSpring({
    position: isOverlapping ? cupPosition : cupPosition,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const { position: boxPosition } = useSpring({
    position: isOverlapping ? [0, 0, 0] : [15, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 },
  });

  return (
    <>
      <animated.group position={cupSpringPosition}>
        <Suspense fallback={null}>
          <Cup position={[0, 0, 0]} rotation={cupRotation} />
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
  const [cupRotation, setCupRotation] = useState(0);
  const [cupPosition, setCupPosition] = useState([-15, 0, 0]);
  const [boxWidth, setBoxWidth] = useState(15); // 默认15cm
  const [boxHeight, setBoxHeight] = useState(10); // 默认10cm
  const [boxDepth, setBoxDepth] = useState(15); // 默认15cm
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [canFit, setCanFit] = useState(false);

  // 检测杯子是否能放入盒子
  const checkIfCupCanFit = () => {
    if (!isOverlapping) {
      setCanFit(false);
      return;
    }

    // 杯子主体半径（包括把手）
    const cupRadius = 4.5; // 把手外半径
    const cupHeight = 9.5; // 杯子高度

    // 检查高度是否足够
    if (cupHeight > boxHeight) {
      setCanFit(false);
      return;
    }

    // 计算杯子在水平面上的投影范围
    const [x, y, z] = cupPosition;

    // 计算把手旋转后的投影
    const handleAngle = cupRotation;
    const handleProjection = {
      x: x + 4.25 * Math.cos(handleAngle), // 把手中心点
      z: z + 4.25 * Math.sin(handleAngle),
    };

    // 检查杯子主体是否在盒子内
    const isBodyInBox =
      Math.abs(x) + cupRadius <= boxWidth / 2 &&
      Math.abs(z) + cupRadius <= boxDepth / 2;

    // 检查把手是否在盒子内
    const isHandleInBox =
      Math.abs(handleProjection.x) + 0.5 <= boxWidth / 2 &&
      Math.abs(handleProjection.z) + 0.5 <= boxDepth / 2;

    setCanFit(isBodyInBox && isHandleInBox);
  };

  // 在相关状态变化时触发检测
  useEffect(() => {
    checkIfCupCanFit();
  }, [cupPosition, cupRotation, boxWidth, boxHeight, boxDepth, isOverlapping]);

  const handleCheckFit = () => {
    if (!isOverlapping) {
      // 将杯子移动到盒子中心
      setCupPosition([0, 0, 0]);
    } else {
      // 分离时回到初始位置
      setCupPosition([-15, 0, 0]);
    }
    setIsOverlapping(!isOverlapping);
  };

  const handleRotate45 = () => {
    setCupRotation((prev) => (prev + Math.PI / 4) % (2 * Math.PI));
  };

  const handleMoveCup = (direction, value) => {
    const [x, y, z] = cupPosition;
    const step = 0.5; // 移动步长，单位厘米

    switch (direction) {
      case "horizontal":
        setCupPosition([value, y, z]);
        break;
      case "vertical":
        setCupPosition([x, y, value]);
        break;
      case "diagonal":
        setCupPosition([value, y, value]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <div className="control-group">
          <h3>杯子设置</h3>
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

        {isOverlapping && (
          <div className="control-group">
            <h3>杯子位置控制（厘米）</h3>
            <label>左右移动：</label>
            <input
              type="number"
              value={cupPosition[0].toFixed(2)}
              onChange={(e) =>
                handleMoveCup("horizontal", Number(e.target.value))
              }
              step="0.1"
              min="-10"
              max="10"
            />
            <label>前后移动：</label>
            <input
              type="number"
              value={cupPosition[2].toFixed(2)}
              onChange={(e) =>
                handleMoveCup("vertical", Number(e.target.value))
              }
              step="0.1"
              min="-10"
              max="10"
            />
            <label>对角线移动：</label>
            <input
              type="number"
              value={cupPosition[0].toFixed(2)}
              onChange={(e) =>
                handleMoveCup("diagonal", Number(e.target.value))
              }
              step="0.1"
              min="-10"
              max="10"
            />
          </div>
        )}

        <div className="control-group">
          <h3>盒子设置（单位：厘米）</h3>
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
          {isOverlapping && (
            <div className={`fit-status ${canFit ? "can-fit" : "cannot-fit"}`}>
              {canFit ? "可以容纳" : "无法容纳"}
            </div>
          )}
        </div>
      </div>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 15, 30], fov: 45 }} shadows>
          <color attach="background" args={["#1a1a1a"]} />

          {/* 环境光 */}
          <ambientLight intensity={0.3} />

          {/* 主光源 */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          <AnimatedScene
            cupRotation={cupRotation}
            cupPosition={cupPosition}
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
