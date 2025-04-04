import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import AnimatedScene from "./components/AnimatedScene";
import Toolbar from "./components/Toolbar";
import InfoButton from "./components/InfoButton";
import "./App.css";

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
    const cupHeight = 9.5; // 从Cup组件中获取
    if (cupHeight > boxHeight) {
      setCanFit(false);
      return;
    }

    // 定义盒子的边界（只考虑水平方向）
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

    // 添加安全边距，即必须的空隙
    const safetyMargin = 0;
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

  return (
    <div className="app-container">
      <Toolbar
        cupRotation={cupRotation}
        setCupRotation={setCupRotation}
        cupPosition={cupPosition}
        setCupPosition={setCupPosition}
        boxWidth={boxWidth}
        setBoxWidth={setBoxWidth}
        boxHeight={boxHeight}
        setBoxHeight={setBoxHeight}
        boxDepth={boxDepth}
        setBoxDepth={setBoxDepth}
        isOverlapping={isOverlapping}
        handleCheckFit={handleCheckFit}
        canFit={canFit}
      />
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 30, 60], fov: 40 }} shadows>
          <color attach="background" args={["#1a1a1a"]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
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
      <InfoButton />
    </div>
  );
}

export default App;
