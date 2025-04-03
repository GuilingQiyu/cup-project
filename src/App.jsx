import { useState, Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import "./App.css";

function Cup({ position, rotation = 0, cupRef }) {
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
    <group position={position} rotation={[0, rotation, 0]} ref={cupRef}>
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
      <mesh
        position={[width / 2, 0, depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        {outerMaterial}
      </mesh>

      {/* 前面 - 基准面，不移动 */}
      <mesh position={[width / 2, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>

      {/* 后面 - 移动 */}
      <mesh position={[width / 2, height / 2, depth]}>
        <planeGeometry args={[width, height]} />
        {outerMaterial}
      </mesh>

      {/* 左面 - 基准面，不移动 */}
      <mesh
        position={[0, height / 2, depth / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>

      {/* 右面 - 移动 */}
      <mesh
        position={[width, height / 2, depth / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        {outerMaterial}
      </mesh>

      {/* 内部面 */}
      <group position={[0, 0, 0]}>
        {/* 内部底面 */}
        <mesh
          position={[width / 2, 0.01, depth / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width - 0.02, depth - 0.02]} />
          {innerMaterial}
        </mesh>

        {/* 内部前面 - 基准面，不移动 */}
        <mesh position={[width / 2, height / 2, 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>

        {/* 内部后面 - 移动 */}
        <mesh position={[width / 2, height / 2, depth - 0.01]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>

        {/* 内部左面 - 基准面，不移动 */}
        <mesh
          position={[0.01, height / 2, depth / 2]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.02, height - 0.02]} />
          {innerMaterial}
        </mesh>

        {/* 内部右面 - 移动 */}
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

function AnimatedScene({
  cupRotation,
  cupPosition,
  boxWidth,
  boxHeight,
  boxDepth,
  isOverlapping,
  cupRef,
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
          <Cup position={[0, 0, 0]} rotation={cupRotation} cupRef={cupRef} />
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
  const cupRef = useRef();
  const [cupPoints, setCupPoints] = useState([]); // 存储杯子的点坐标
  const [lastCheckTime, setLastCheckTime] = useState(0); // 记录上次检查时间

  // 更新杯子的点坐标
  const updateCupPoints = () => {
    if (!cupRef.current) return;

    const points = [];

    // 遍历杯子的所有子对象
    cupRef.current.traverse((child) => {
      if (child.isMesh) {
        // 获取几何体
        const geometry = child.geometry;

        // 确保几何体有顶点
        if (geometry.attributes.position) {
          // 获取顶点数量
          const vertexCount = geometry.attributes.position.count;

          // 遍历所有顶点
          for (let i = 0; i < vertexCount; i++) {
            // 获取顶点坐标
            const x = geometry.attributes.position.getX(i);
            const y = geometry.attributes.position.getY(i);
            const z = geometry.attributes.position.getZ(i);

            // 创建顶点向量
            const vertex = new THREE.Vector3(x, y, z);

            // 将顶点从局部坐标转换为世界坐标
            child.localToWorld(vertex);

            // 添加到点集合
            points.push(vertex);
          }
        }
      }
    });

    // 确保点坐标集合不为空
    if (points.length > 0) {
      setCupPoints(points);
    }
  };

  // 检测杯子是否能放入盒子
  const checkIfCupCanFit = () => {
    if (!isOverlapping || cupPoints.length === 0) {
      setCanFit(false);
      return;
    }

    // 检查高度是否足够
    const cupHeight = 9.5; // 杯子高度
    if (cupHeight > boxHeight) {
      setCanFit(false);
      return;
    }

    // 定义盒子的边界（只考虑水平方向）
    // 由于左面和前面是基准面，所以边界从0开始
    const boxMinX = 0;
    const boxMaxX = boxWidth;
    const boxMinZ = 0;
    const boxMaxZ = boxDepth;

    // 检查所有点是否都在盒子边界内
    const allPointsInBox = cupPoints.every((point) => {
      return (
        point.x >= boxMinX &&
        point.x <= boxMaxX &&
        point.z >= boxMinZ &&
        point.z <= boxMaxZ
      );
    });

    // 添加安全边距
    const safetyMargin = 0.1; // 安全边距（厘米）
    const hasSafetyMargin = cupPoints.every((point) => {
      return (
        point.x >= boxMinX + safetyMargin &&
        point.x <= boxMaxX - safetyMargin &&
        point.z >= boxMinZ + safetyMargin &&
        point.z <= boxMaxZ - safetyMargin
      );
    });

    // 记录当前检查时间
    const currentTime = Date.now();

    // 如果距离上次检查时间太短（小于100ms），则忽略此次检查
    // 这可以防止在快速调整时出现判断不一致的情况
    if (currentTime - lastCheckTime < 100) {
      return;
    }

    setLastCheckTime(currentTime);
    setCanFit(allPointsInBox && hasSafetyMargin);
  };

  // 在相关状态变化时触发检测
  useEffect(() => {
    // 更新杯子的点坐标
    updateCupPoints();
  }, [cupPosition, cupRotation]);

  // 在点坐标或盒子尺寸变化时检查容纳情况
  useEffect(() => {
    // 添加一个小延迟，确保点坐标已更新
    const timer = setTimeout(() => {
      checkIfCupCanFit();
    }, 50);

    return () => clearTimeout(timer);
  }, [cupPoints, boxWidth, boxHeight, boxDepth, isOverlapping]);

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

  const handleMoveCup = (direction, value) => {
    const [x, y, z] = cupPosition;

    switch (direction) {
      case "horizontal":
        setCupPosition([value, y, z]);
        break;
      case "vertical":
        setCupPosition([x, y, value]);
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
            cupRef={cupRef}
          />

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
