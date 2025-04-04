import React from "react";
import { useSpring, animated } from "@react-spring/three";
import Cup from "./Cup";
import OpenBox from "./OpenBox";

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
        <Cup position={[0, 0, 0]} rotation={cupRotation} cupRef={cupRef} />
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

export default AnimatedScene;
