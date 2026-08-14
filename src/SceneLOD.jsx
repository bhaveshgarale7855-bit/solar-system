import { useThree, useFrame } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";

export default function SceneLOD({
  solarSystem,
  spacecraft,
  milkyWay,
  localGroup,
  largeUniverse,
}) {
  return (
    <>
      {solarSystem}
    </>
  );
  const { camera } = useThree();
  const [level, setLevel] = useState("solar");

  useFrame(() => {
    const centerPosition = new THREE.Vector3(0, 0, 0);
    const distance = camera.position.distanceTo(centerPosition);

    let nextLevel;

    if (distance < 220) {
      nextLevel = "solar";
    } else if (distance < 350) {
      nextLevel = "galaxy";
    } else if (distance < 1200) {
      nextLevel = "local";
    } else {
      nextLevel = "universe";
    }

    if (nextLevel !== level) {
      setLevel(nextLevel);
    }
  });

  return (
    <>
      <group visible={level === "solar" || level === "galaxy"}>
        {solarSystem}
        </group>
        <group visible={level === "solar" || level === "galaxy"}>
          {spacecraft}
        </group>

        <group visible={level === "galaxy" || level === "local"}>
          {milkyWay}
        </group>
        <group visible={level === "local" || level === "universe"}>
          {localGroup}
        </group>
        <group visible={level === "universe"}>
          {largeUniverse}
        </group>
      </>
      );
}