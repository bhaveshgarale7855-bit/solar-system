import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import SceneLOD from "./SceneLOD";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import "./App.css";

const AU = 4;
const planets = [
  {
    name: "Mercury",
    radius: 0.10,
    distance: 0.387 * AU,
    speed: 1.6,
    color: "#9b9b9b",
    texture: "/textures/2k_mercury.jpg",

    type: "Terrestrial Planet",
    diameter: "4,879 km",
    distanceFromSun: "57.9 million km",
    orbitalPeriod: "88 Earth days",
    rotationPeriod: "58.6 Earth days",
    moons: "0",
    atmosphere: "Very thin exosphere",
    temperature: "−180°C to 430°C",
    info: "Mercury is the smallest planet and the closest planet to the Sun. It has a heavily cratered rocky surface."
  },

  {
    name: "Venus",
    radius: 0.14,
    distance: 0.723 * AU,
    speed: 1.2,
    color: "#d8a85f",
    texture: "/textures/2k_venus_surface.jpg",

    type: "Terrestrial Planet",
    diameter: "12,104 km",
    distanceFromSun: "108.2 million km",
    orbitalPeriod: "224.7 Earth days",
    rotationPeriod: "243 Earth days",
    moons: "0",
    atmosphere: "Mostly carbon dioxide and nitrogen",
    temperature: "About 465°C",
    info: "Venus is the hottest planet in the Solar System. Its extremely thick atmosphere creates a powerful greenhouse effect."
  },

  {
    name: "Earth",
    radius: 0.15,
    distance: 1 * AU,
    speed: 1,
    color: "#3976d2",
    texture: "/textures/2k_earth_daymap.jpg",

    type: "Terrestrial Planet",
    diameter: "12,756 km",
    distanceFromSun: "149.6 million km",
    orbitalPeriod: "365.25 days",
    rotationPeriod: "23.93 hours",
    moons: "1",
    atmosphere: "Nitrogen, oxygen and other gases",
    temperature: "Average about 15°C",
    info: "Earth is the third planet from the Sun and the only world currently known to support life."
  },

  {
    name: "Mars",
    radius: 0.11,
    distance: 1.524 * AU,
    speed: 0.8,
    color: "#c9573d",
    texture: "/textures/2k_mars.jpg",

    type: "Terrestrial Planet",
    diameter: "6,792 km",
    distanceFromSun: "227.9 million km",
    orbitalPeriod: "687 Earth days",
    rotationPeriod: "24.6 hours",
    moons: "2",
    atmosphere: "Mostly carbon dioxide",
    temperature: "Average about −63°C",
    info: "Mars is the fourth planet from the Sun. It is a cold, rocky desert world with giant volcanoes, deep canyons and polar ice."
  },

  {
    name: "Jupiter",
    radius: 0.45,
    distance: 5.203 * AU,
    speed: 0.45,
    color: "#c9976b",
    texture: "/textures/2k_jupiter.jpg",

    type: "Gas Giant",
    diameter: "142,984 km",
    distanceFromSun: "778.5 million km",
    orbitalPeriod: "11.86 Earth years",
    rotationPeriod: "9.93 hours",
    moons: "Many",
    atmosphere: "Mostly hydrogen and helium",
    temperature: "About −110°C at cloud tops",
    info: "Jupiter is the largest planet in the Solar System. Its atmosphere contains powerful storms, including the Great Red Spot."
  },

  {
    name: "Saturn",
    radius: 0.38,
    distance: 9.582 * AU,
    speed: 0.32,
    color: "#d7bd82",
    texture: "/textures/2k_saturn.jpg",

    type: "Gas Giant",
    diameter: "120,536 km",
    distanceFromSun: "1.43 billion km",
    orbitalPeriod: "29.45 Earth years",
    rotationPeriod: "About 10.7 hours",
    moons: "Many",
    atmosphere: "Mostly hydrogen and helium",
    temperature: "About −140°C at cloud tops",
    info: "Saturn is the sixth planet from the Sun and the second largest. Its spectacular ring system is made mostly of ice and rocky particles."
  },

  {
    name: "Uranus",
    radius: 0.25,
    distance: 19.218 * AU,
    speed: 0.22,
    color: "#79d6d6",
    texture: "/textures/2k_uranus.jpg",

    type: "Ice Giant",
    diameter: "51,118 km",
    distanceFromSun: "2.87 billion km",
    orbitalPeriod: "84 Earth years",
    rotationPeriod: "About 17.2 hours",
    moons: "Many",
    atmosphere: "Hydrogen, helium and methane",
    temperature: "About −195°C",
    info: "Uranus is an ice giant that rotates at an extreme tilt, making it appear to spin on its side."
  },

  {
    name: "Neptune",
    radius: 0.24,
    distance: 30.07 * AU,
    speed: 0.17,
    color: "#4169e1",
    texture: "/textures/2k_neptune.jpg",

    type: "Ice Giant",
    diameter: "49,528 km",
    distanceFromSun: "4.50 billion km",
    orbitalPeriod: "164.8 Earth years",
    rotationPeriod: "About 16.1 hours",
    moons: "Many",
    atmosphere: "Hydrogen, helium and methane",
    temperature: "About −200°C",
    info: "Neptune is the eighth and most distant major planet. It has extremely powerful winds and large atmospheric storms."
  },

  // {
  //   name: "Pluto",
  //   radius: 0.12,
  //   distance: 39.48 * AU,

  //   type: "Dwarf Planet",
  //   diameter: "2,377 km",
  //   distanceFromSun: "39.48 AU (≈ 5.91 billion km)",
  //   orbitalPeriod: "≈ 248 Earth years",
  //   rotationPeriod: "≈ 6.39 Earth days",
  //   moons: "5",
  //   atmosphere: "Thin nitrogen, methane and carbon monoxide",
  //   temperature: "≈ −229°C",

  //   color: "#b8a58e",

  //   info:
  //     "Pluto is a dwarf planet in the Kuiper Belt beyond Neptune. Its orbit is highly eccentric and inclined, and it has five known moons, including Charon."
  // }

];

const GALAXY_SCALE = {
  lightYearsPerUnit: 1000,
  galaxyRadius: 50,
  solarSystemDistance: 26,
};

const SOLAR_SYSTEM_SCALE = {
  // Solar-system visualization is in AU-like units.
  // 1 unit here represents 1 AU for the local Solar System view.
  astronomicalUnit: 1,
};

const UNIVERSE_SCALE = {
  milkyWayRadius: 50,

  localGroupRadius: 180,

  clusterRadius: 450,

  largeScaleRadius: 1200,

  observableUniverseRadius: 2500,
};

function Orbit({ distance }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.008, distance + 0.008, 128]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.16}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


// function LocalGroupGalaxies() {

//   const galaxies = [

//     {
//       name: "Andromeda",
//       position: [120, 8, -35],
//       size: 4.5,
//       color: "#7f9cff",
//       type: "spiral",
//     },

//     {
//       name: "Triangulum",
//       position: [55, 15, 90],
//       size: 2.8,
//       color: "#c084ff",
//       type: "spiral",
//     },

//     {
//       name: "DwarfGalaxy1",
//       position: [-70, -12, 55],
//       size: 1.4,
//       color: "#65d9ff",
//       type: "spiral",
//     },

//     {
//       name: "DwarfGalaxy2",
//       position: [-95, 18, -60],
//       size: 1.1,
//       color: "#ff9bd4",
//       type: "spiral",
//     },

//     {
//       name: "DwarfGalaxy3",
//       position: [30, -25, -110],
//       size: 0.9,
//       color: "#ffd27a",
//       type: "spiral",
//     },

//   ];

//   return (

//     <group name="LocalGroupGalaxies">

//       {galaxies.map((galaxy) => (

//         <group
//           key={galaxy.name}
//           position={galaxy.position}
//         >

//           <GalaxyShape
//             galaxy={galaxy}
//           />

//         </group>

//       ))}

//     </group>

//   );
// }

// function MilkyWay({ children }) {
//   const galaxyRef = useRef();
//   const galacticCenterRef = useRef();

//   // --------------------------------------------------
//   // MILKY WAY STAR FIELD
//   // --------------------------------------------------

//   const galaxyStars = useMemo(() => {
//     const positions = [];
//     const colors = [];

//     const starCount = 36000;
//     const armCount = 4;

//     for (let i = 0; i < starCount; i++) {
//       /*
//        * Radius:
//        * Dense center + gradually spreading outer disk
//        */
//       const radius =
//         Math.pow(Math.random(), 0.72) * 48;

//       /*
//        * Spiral structure
//        */
//       const arm =
//         Math.floor(Math.random() * armCount);

//       const armOffset =
//         (arm / armCount) *
//         Math.PI *
//         2;

//       /*
//        * Strong spiral curvature.
//        * The farther from center,
//        * the more the arm bends.
//        */
//       const spiralAngle =
//         armOffset +
//         radius * 0.105;

//       /*
//        * Star spread around the spiral arm.
//        *
//        * Center = tighter
//        * Outer galaxy = wider
//        */
//       const spread =
//         (Math.random() - 0.5) *
//         (
//           0.16 +
//           radius * 0.028
//         );

//       const angle =
//         spiralAngle + spread;

//       /*
//        * Galaxy coordinates
//        */
//       const x =
//         Math.cos(angle) * radius;

//       const z =
//         Math.sin(angle) * radius;

//       /*
//        * Thin galactic disk.
//        *
//        * Center is slightly thicker,
//        * outer disk becomes thinner.
//        */
//       const diskThickness =
//         0.18 +
//         (1 - radius / 48) * 1.1;

//       const y =
//         (Math.random() - 0.5) *
//         diskThickness;

//       positions.push(x, y, z);

//       // ------------------------------------------------
//       // STAR COLORS
//       // ------------------------------------------------

//       const starType = Math.random();

//       if (starType < 0.10) {
//         // Young blue stars
//         colors.push(
//           0.45,
//           0.70,
//           1.00
//         );
//       }
//       else if (starType < 0.24) {
//         // Warm / yellow stars
//         colors.push(
//           1.00,
//           0.76,
//           0.42
//         );
//       }
//       else {
//         // White stars
//         const brightness =
//           0.78 +
//           Math.random() * 0.22;

//         colors.push(
//           brightness,
//           brightness,
//           brightness
//         );
//       }
//     }

//     return {
//       positions:
//         new Float32Array(positions),

//       colors:
//         new Float32Array(colors),
//     };
//   }, []);

//   // ==========================================
//   // SOFT GALACTIC CLOUDS
//   // ==========================================

//   const galaxyClouds = useMemo(() => {
//     const positions = [];

//     const cloudCount = 7000;
//     const armCount = 4;

//     for (let i = 0; i < cloudCount; i++) {

//       // Galaxy ke outer edge ki taraf
//       // clouds gradually spread hote hain
//       const radius =
//         4 +
//         Math.pow(Math.random(), 0.72) * 45;

//       const arm =
//         Math.floor(Math.random() * armCount);

//       const armOffset =
//         (arm / armCount) *
//         Math.PI *
//         2;

//       // Spiral curvature
//       const spiralAngle =
//         armOffset +
//         radius * 0.16;

//       /*
//        * IMPORTANT:
//        * Stars se kaafi wider spread.
//        * Isi se cloudy / gaseous appearance aayegi.
//        */
//       const spread =
//         (Math.random() - 0.5) *
//         (
//           0.55 +
//           radius * 0.055
//         );

//       const angle =
//         spiralAngle + spread;

//       const x =
//         Math.cos(angle) * radius;

//       const z =
//         Math.sin(angle) * radius;

//       /*
//        * Clouds disk ke andar
//        * slightly thick rahenge.
//        */
//       const thickness =
//         0.5 +
//         (1 - radius / 50) * 1.8;

//       const y =
//         (Math.random() - 0.5) *
//         thickness;

//       positions.push(x, y, z);
//     }

//     return new Float32Array(positions);

//   }, []);

//   // --------------------------------------------------
//   // STAR GEOMETRY
//   // --------------------------------------------------

//   const geometry = useMemo(() => {
//     const geo =
//       new THREE.BufferGeometry();

//     geo.setAttribute(
//       "position",
//       new THREE.BufferAttribute(
//         galaxyStars.positions,
//         3
//       )
//     );

//     geo.setAttribute(
//       "color",
//       new THREE.BufferAttribute(
//         galaxyStars.colors,
//         3
//       )
//     );

//     return geo;
//   }, [galaxyStars]);


//   // --------------------------------------------------
//   // ROTATION
//   // --------------------------------------------------

//   useFrame((_, delta) => {
//     if (galaxyRef.current) {
//       galaxyRef.current.rotation.y +=
//         delta * 0.006;
//     }

//     if (galacticCenterRef.current) {
//       galacticCenterRef.current.rotation.z -=
//         delta * 0.012;
//     }
//   });

//   return (
//     <group
//       position={[0, 0, 0]}
//       ref={galaxyRef}
//     >

//       {/* ============================================= */}
//       {/* MILKY WAY STAR FIELD                         */}
//       {/* ============================================= */}

//       <points geometry={geometry}>
//         <pointsMaterial
//           vertexColors
//           size={0.075}
//           sizeAttenuation
//           transparent
//           opacity={0.90}
//           depthWrite={false}
//         />
//       </points>



//       {/* ============================================= */}
//       {/* DARK DUST / INNER LANE                       */}
//       {/* ============================================= */}

//       <mesh
//         rotation={[
//           Math.PI / 2,
//           0,
//           0
//         ]}
//       >
//         <ringGeometry
//           args={[
//             5.5,
//             31,
//             256
//           ]}
//         />

//         <meshBasicMaterial
//           color="#05050c"
//           transparent
//           opacity={0.16}
//           side={THREE.DoubleSide}
//           depthWrite={false}
//         />
//       </mesh>


//       {/* ============================================= */}
//       {/* GALACTIC CENTER                              */}
//       {/* ============================================= */}

//       <group
//         ref={galacticCenterRef}
//       >

//         {/* Large diffuse central glow */}

//         <mesh
//           rotation={[
//             Math.PI / 2,
//             0,
//             0
//           ]}
//         >
//           <ringGeometry
//             args={[
//               0.8,
//               8.5,
//               256
//             ]}
//           />

//           <meshBasicMaterial
//             color="#ffb45c"
//             transparent
//             opacity={0.12}
//             side={THREE.DoubleSide}
//             depthWrite={false}
//             blending={
//               THREE.AdditiveBlending
//             }
//           />
//         </mesh>


//         {/* Bright central bulge */}

//         <mesh
//           rotation={[
//             Math.PI / 2,
//             0,
//             0
//           ]}
//         >
//           <ringGeometry
//             args={[
//               0.45,
//               4.8,
//               256
//             ]}
//           />

//           <meshBasicMaterial
//             color="#ffd58a"
//             transparent
//             opacity={0.26}
//             side={THREE.DoubleSide}
//             depthWrite={false}
//             blending={
//               THREE.AdditiveBlending
//             }
//           />
//         </mesh>


//         {/* Hot inner center */}

//         <mesh
//           rotation={[
//             Math.PI / 2,
//             0,
//             0
//           ]}
//         >
//           <ringGeometry
//             args={[
//               0.15,
//               2.2,
//               256
//             ]}
//           />

//           <meshBasicMaterial
//             color="#fff0c4"
//             transparent
//             opacity={0.48}
//             side={THREE.DoubleSide}
//             depthWrite={false}
//             blending={
//               THREE.AdditiveBlending
//             }
//           />
//         </mesh>


//         {/* Galactic black-hole core */}

//         <mesh>
//           <sphereGeometry
//             args={[
//               0.45,
//               32,
//               32
//             ]}
//           />

//           <meshBasicMaterial
//             color="#020208"
//           />
//         </mesh>

//       </group>


//       =============================================
//       {/* SPIRAL ARM GLOW                              */}
//       {/* ============================================= */}

//       {/* <group>

//         {Array.from({
//           length: 4
//         }).map((_, arm) => {

//           const rotation =
//             (arm / 4) *
//             Math.PI *
//             2;

//           return (
//             <group
//               key={`spiral-arm-${arm}`}
//               rotation={[
//                 0,
//                 0,
//                 rotation
//               ]}
//             >

//               <mesh
//                 rotation={[
//                   Math.PI / 2,
//                   0,
//                   0
//                 ]}
//               >

//                 <ringGeometry
//                   args={[
//                     7,
//                     46,
//                     256,
//                     1,
//                     0,
//                     Math.PI * 1.45
//                   ]}
//                 />

//                 <meshBasicMaterial
//                   color={
//                     arm % 2 === 0
//                       ? "#668cff"
//                       : "#b47cff"
//                   }
//                   transparent
//                   opacity={0.035}
//                   side={THREE.DoubleSide}
//                   depthWrite={false}
//                   blending={
//                     THREE.AdditiveBlending
//                   }
//                 />

//               </mesh>

//             </group> */}
//       {/* );
//         })}

//       </group> */}


//       {/* ============================================= */}
//       {/* CHILDREN — BLACK HOLE / OTHER GALAXY CONTENT */}
//       {/* ============================================= */}

//       {children}

//     </group>
//   );
// }

function GalaxyShape({ galaxy }) {
  const galaxyRef = useRef();

  const starData = useMemo(() => {
    const positions = [];
    const colors = [];

    const starCount =
      galaxy.type === "spiral"
        ? 6500
        : galaxy.type === "elliptical"
          ? 1800
          : 1200;

    const armCount = 4;

    for (let i = 0; i < starCount; i++) {

      // ==========================================
      // ELLIPTICAL GALAXY
      // ==========================================

      if (galaxy.type === "elliptical") {

        const radius =
          Math.pow(Math.random(), 0.55) *
          galaxy.size;

        const angle =
          Math.random() *
          Math.PI *
          2;

        const x =
          Math.cos(angle) * radius;

        const z =
          Math.sin(angle) * radius;

        const y =
          (Math.random() - 0.5) *
          radius *
          0.65;

        positions.push(x, y, z);

      }

      // ==========================================
      // IRREGULAR GALAXY
      // ==========================================

      else if (galaxy.type === "irregular") {

        const radius =
          Math.pow(Math.random(), 0.55) *
          galaxy.size;

        const angle =
          Math.random() *
          Math.PI *
          2;

        const x =
          Math.cos(angle) * radius +
          (Math.random() - 0.5) *
          galaxy.size *
          0.8;

        const z =
          Math.sin(angle) * radius +
          (Math.random() - 0.5) *
          galaxy.size *
          0.8;

        const y =
          (Math.random() - 0.5) *
          galaxy.size *
          0.8;

        positions.push(x, y, z);

      }

      // ==========================================
      // SPIRAL GALAXY
      // ==========================================

      else {

        /*
         * Dense central region
         */
        const radius =
          Math.pow(Math.random(), 0.72) *
          galaxy.size;

        const arm =
          i % armCount;

        /*
         * Four major spiral arms
         */
        const armOffset =
          (arm / armCount) *
          Math.PI *
          2;

        /*
         * Strong curvature.
         *
         * This is what makes it look
         * like a real spiral instead
         * of circular rings.
         */
        const spiralAngle =
          armOffset +
          radius * 0.62;

        /*
         * Stars spread around the arm.
         */
        const spread =
          (Math.random() - 0.5) *
          (
            0.10 +
            radius * 0.035
          );

        const angle =
          spiralAngle + spread;

        const x =
          Math.cos(angle) *
          radius;

        const z =
          Math.sin(angle) *
          radius;

        /*
         * Thin galactic disk
         */
        const thickness =
          0.025 +
          (1 - radius / galaxy.size) *
          galaxy.size *
          0.045;

        const y =
          (Math.random() - 0.5) *
          thickness;

        positions.push(x, y, z);
      }

      // ==========================================
      // STAR COLOR VARIATION
      // ==========================================

      const colorRandom =
        Math.random();

      if (colorRandom < 0.12) {

        // Bright blue stars
        colors.push(
          0.55,
          0.72,
          1.0
        );

      } else if (colorRandom < 0.25) {

        // Warm stars
        colors.push(
          1.0,
          0.72,
          0.38
        );

      } else {

        // Main galaxy color
        const c =
          new THREE.Color(
            galaxy.color
          );

        const brightness =
          0.75 +
          Math.random() *
          0.25;

        colors.push(
          c.r * brightness,
          c.g * brightness,
          c.b * brightness
        );
      }
    }

    return {
      positions:
        new Float32Array(positions),

      colors:
        new Float32Array(colors),
    };

  }, [galaxy]);


  // ============================================
  // STAR GEOMETRY
  // ============================================

  const geometry = useMemo(() => {

    const geo =
      new THREE.BufferGeometry();

    geo.setAttribute(
      "position",

      new THREE.BufferAttribute(
        starData.positions,
        3
      )
    );

    geo.setAttribute(
      "color",

      new THREE.BufferAttribute(
        starData.colors,
        3
      )
    );

    return geo;

  }, [starData]);


  // ============================================
  // GALAXY ROTATION
  // ============================================

  useFrame((_, delta) => {

    if (galaxyRef.current) {

      galaxyRef.current.rotation.y +=
        delta * 0.012;
    }

  });


  return (
    <group ref={galaxyRef}>

      {/* ====================================== */}
      {/* STAR FIELD                             */}
      {/* ====================================== */}

      <points geometry={geometry}>

        <pointsMaterial
          vertexColors
          size={
            galaxy.type === "spiral"
              ? 0.055
              : 0.045
          }
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />

      </points>


      {/* ====================================== */}
      {/* OUTER GALAXY GLOW                     */}
      {/* ====================================== */}

      <mesh
        rotation={[
          Math.PI / 2,
          0,
          0
        ]}
      >

        <ringGeometry
          args={[
            galaxy.size * 0.18,
            galaxy.size,
            128
          ]}
        />

        <meshBasicMaterial
          color={galaxy.color}
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />

      </mesh>


      {/* ====================================== */}
      {/* SOFT INNER GLOW                       */}
      {/* ====================================== */}

      <mesh
        rotation={[
          Math.PI / 2,
          0,
          0
        ]}
      >

        <ringGeometry
          args={[
            galaxy.size * 0.05,
            galaxy.size * 0.45,
            128
          ]}
        />

        <meshBasicMaterial
          color="#fff0cf"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />

      </mesh>


      {/* ====================================== */}
      {/* CENTRAL BULGE                         */}
      {/* ====================================== */}

      <mesh>

        <sphereGeometry
          args={[
            galaxy.size * 0.20,
            32,
            32
          ]}
        />

        <meshBasicMaterial
          color="#fff0c4"
          transparent
          opacity={0.30}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />

      </mesh>


      {/* ====================================== */}
      {/* DARK DUST LANE                        */}
      {/* ====================================== */}

      {galaxy.type === "spiral" && (

        <mesh
          rotation={[
            Math.PI / 2,
            0,
            0
          ]}
        >

          <ringGeometry
            args={[
              galaxy.size * 0.20,
              galaxy.size * 0.82,
              128
            ]}
          />

          <meshBasicMaterial
            color="#05050b"
            transparent
            opacity={0.09}
            side={THREE.DoubleSide}
            depthWrite={false}
          />

        </mesh>

      )}

    </group>
  );
}

// function UniverseGalaxies() {
//   const groupRef = useRef();

//   const galaxies = useMemo(() => {
//     const clusterCenters = [
//       [150, 20, -80],
//       [-180, -30, 100],
//       [90, 70, 180],
//       [-120, 40, -200],
//       [250, -60, 40],
//       [-260, 80, -120],
//     ];

//     const data = [
//       // =========================
//       // LOCAL GROUP — REAL GALAXIES
//       // =========================

//       {
//         name: "Andromeda Galaxy",
//         position: [55, 8, -18],
//         size: 4.5,
//         color: "#d8c7a5",
//         type: "spiral",
//       },

//       {
//         name: "Triangulum Galaxy",
//         position: [38, -5, 28],
//         size: 2.2,
//         color: "#9bbcff",
//         type: "spiral",
//       },

//       {
//         name: "Large Magellanic Cloud",
//         position: [-20, 7, 18],
//         size: 1.2,
//         color: "#b8c9ff",
//         type: "irregular",
//       },

//       {
//         name: "Small Magellanic Cloud",
//         position: [-25, -4, 25],
//         size: 0.9,
//         color: "#aab8e8",
//         type: "irregular",
//       },

//       // =========================
//       // OTHER NEARBY GALAXIES
//       // =========================

//       {
//         name: "M32",
//         position: [62, 4, -20],
//         size: 0.8,
//         color: "#e0cda8",
//         type: "elliptical",
//         group: "local",
//       },

//       {
//         name: "M110",
//         position: [59, -3, -23],
//         size: 1.1,
//         color: "#c7bba5",
//         type: "elliptical",
//         group: "local",
//       },

//       {
//         name: "IC 10",
//         position: [28, 10, -35],
//         size: 0.7,
//         color: "#9fb9ff",
//         type: "irregular",
//         group: "local",
//       },
//     ];

//     // =================================
//     // DISTANT GALAXIES
//     // =================================

//     for (let i = 0; i < 600; i++) {

//       const cluster =
//         clusterCenters[
//         i % clusterCenters.length
//         ];

//       // Spread galaxies around a cluster center
//       const x =
//         cluster[0] +
//         (Math.random() - 0.5) * 90;

//       const y =
//         cluster[1] +
//         (Math.random() - 0.5) * 70;

//       const z =
//         cluster[2] +
//         (Math.random() - 0.5) * 90;

//       const typeRandom = Math.random();

//       let type;
//       let color;

//       if (typeRandom < 0.45) {

//         type = "spiral";
//         color = "#9db8ff";

//       } else if (typeRandom < 0.75) {

//         type = "elliptical";
//         color = "#d6c5a5";

//       } else {

//         type = "irregular";
//         color = "#b58cff";
//       }

//       data.push({

//         name: `Cluster Galaxy ${i + 1}`,

//         position: [
//           x,
//           y,
//           z
//         ],

//         size:
//           0.25 +
//           Math.random() * 1.1,

//         color,

//         type,

//         group: "cluster",
//       });
//     }

//     for (let i = 0; i < 1200; i++) {

//       const radius =
//         350 + Math.random() * 500;

//       const theta =
//         Math.random() * Math.PI * 2;

//       const phi =
//         Math.acos(
//           2 * Math.random() - 1
//         );

//       const x =
//         radius *
//         Math.sin(phi) *
//         Math.cos(theta);

//       const y =
//         radius *
//         Math.cos(phi);

//       const z =
//         radius *
//         Math.sin(phi) *
//         Math.sin(theta);

//       data.push({
//         name: `Deep Universe ${i}`,
//         position: [x, y, z],
//         size: 0.08 + Math.random() * 0.18,
//         color: "#9fa8ff",
//         type: "irregular",
//         group: "deep",
//       });
//     }

//     return data;
//   }, []);

//   const localGroupScale = UNIVERSE_SCALE.localGroupRadius;
//   const clusterScale = UNIVERSE_SCALE.clusterRadius;
//   const largeScale = UNIVERSE_SCALE.largeScaleRadius;

//   return (
//     <group ref={groupRef}>

//       <group name="LocalGroup">

//         {/* LOCAL GROUP VISUAL REGION */}

//         <mesh>

//           {/* LOCAL GROUP GALAXY MARKERS */}

//           {/* <mesh position={[0, 0, 0]}>
//             <sphereGeometry args={[2.5, 24, 24]} />

//             <meshBasicMaterial
//               color="#ffffff"
//               transparent
//               opacity={0.8}
//             />
//           </mesh> */}

//           <mesh position={[120, 8, -35]}>
//             <sphereGeometry args={[4, 24, 24]} />

//             <meshBasicMaterial
//               color="#b9c7ff"
//               transparent
//               opacity={0.8}
//             />
//           </mesh>

//           <mesh position={[-70, -12, 55]}>
//             <sphereGeometry args={[1.2, 16, 16]} />

//             <meshBasicMaterial
//               color="#d8dcff"
//               transparent
//               opacity={0.7}
//             />
//           </mesh>

//           <mesh position={[45, 18, 85]}>
//             <sphereGeometry args={[0.9, 16, 16]} />

//             <meshBasicMaterial
//               color="#d8dcff"
//               transparent
//               opacity={0.7}
//             />
//           </mesh>

//           <sphereGeometry
//             args={[UNIVERSE_SCALE.localGroupRadius, 32, 32]}
//           />

//           <meshBasicMaterial
//             color="#596cff"
//             transparent
//             opacity={0.012}
//             side={THREE.BackSide}
//             depthWrite={false}
//           />
//         </mesh>

//       </group>

//       {/* LOCAL GROUP */}

//       <group name="LocalGroup">

//         {/* Local Group galaxies yahan render hongi */}

//       </group>

//       {galaxies.map((galaxy, index) => (

//         <group
//           key={index}
//           position={galaxy.position}
//           scale={
//             galaxy.group === "cluster"
//               ? 0.55
//               : galaxy.group === "distant"
//                 ? 0.65
//                 : galaxy.group === "deep"
//                   ? 0.25
//                   : 1
//           }        >

//           <GalaxyShape galaxy={galaxy} />
//         </group>

//       ))}

//     </group>
//   );
// }

// function CosmicWeb() {
//   const webRef = useRef();

//   const filaments = useMemo(() => {
//     const data = [];

//     const connections = [
//       [[-500, 100, -400], [450, -80, 350]],
//       [[-600, -250, 250], [500, 250, -300]],
//       [[-400, 350, 500], [600, -300, -450]],
//       [[-700, 0, 0], [700, 80, 100]],
//       [[-200, -400, -500], [300, 400, 500]],
//       [[-550, 300, -100], [100, -250, 550]],
//     ];

//     connections.forEach(([start, end]) => {
//       const a = new THREE.Vector3(...start);
//       const b = new THREE.Vector3(...end);

//       for (let i = 0; i < 250; i++) {
//         const t = Math.random();

//         const point = a.clone().lerp(b, t);

//         point.x += (Math.random() - 0.5) * 45;
//         point.y += (Math.random() - 0.5) * 45;
//         point.z += (Math.random() - 0.5) * 45;

//         data.push(
//           point.x,
//           point.y,
//           point.z
//         );
//       }
//     });

//     return new Float32Array(data);
//   }, []);

//   const geometry = useMemo(() => {
//     const geo = new THREE.BufferGeometry();

//     geo.setAttribute(
//       "position",
//       new THREE.BufferAttribute(
//         filaments,
//         3
//       )
//     );

//     return geo;
//   }, [filaments]);

//   useFrame((_, delta) => {
//     if (webRef.current) {
//       webRef.current.rotation.y += delta * 0.001;
//     }
//   });

//   return (
//     <group ref={webRef}>
//       <points geometry={geometry}>
//         <pointsMaterial
//           color="#7387ff"
//           size={0.35}
//           transparent
//           opacity={0.35}
//           depthWrite={false}
//           blending={THREE.AdditiveBlending}
//         />
//       </points>
//     </group>
//   );
// }

// function CosmicVoids() {
//   const voids = [
//     [300, 100, -350],
//     [-350, -100, 300],
//     [450, -250, 350],
//     [-450, 250, -300],
//   ];

//   return (
//     <group name="CosmicVoids">
//       {voids.map((position, index) => (
//         <mesh
//           key={index}
//           position={position}
//           scale={1.5}
//         >
//           <sphereGeometry
//             args={[100, 32, 32]}
//           />

//           <meshBasicMaterial
//             color="#01020a"
//             transparent
//             opacity={0.08}
//             side={THREE.BackSide}
//             depthWrite={false}
//           />
//         </mesh>
//       ))}
//     </group>
//   );
// }

// function LargeScaleUniverse() {
//   const universeRef = useRef();

//   const webGeometry = useMemo(() => {
//     const positions = [];

//     const filaments = [
//       [[-250, 80, -180], [250, -60, 160]],
//       [[-300, -100, 180], [220, 100, -140]],
//       [[-180, 160, 250], [280, -120, -220]],
//       [[-350, 20, -20], [350, 40, 60]],
//       [[-100, -180, -250], [180, 180, 220]],
//     ];

//     filaments.forEach(([start, end]) => {

//       const a = new THREE.Vector3(...start);
//       const b = new THREE.Vector3(...end);

//       for (let i = 0; i < 180; i++) {

//         const t = Math.random();

//         const point = a.clone().lerp(b, t);

//         // Natural filament thickness
//         point.x += (Math.random() - 0.5) * 35;
//         point.y += (Math.random() - 0.5) * 35;
//         point.z += (Math.random() - 0.5) * 35;

//         positions.push(
//           point.x,
//           point.y,
//           point.z
//         );
//       }
//     });

//     return new Float32Array(positions);

//   }, []);

//   const geometry = useMemo(() => {

//     const geo =
//       new THREE.BufferGeometry();

//     geo.setAttribute(
//       "position",
//       new THREE.BufferAttribute(
//         webGeometry,
//         3
//       )
//     );

//     return geo;

//   }, [webGeometry]);

//   return (
//     <group ref={universeRef}>

//       {/* LARGE SCALE FILAMENTS */}

//       <points geometry={geometry}>

//         <pointsMaterial
//           color="#8998ff"
//           size={0.35}
//           sizeAttenuation={true}
//           transparent
//           opacity={0.45}
//           depthWrite={false}
//           blending={THREE.AdditiveBlending}
//         />

//       </points>

//     </group>
//   );
// }

// function ObservableUniverse() {

//   return (
//     <group>

//       {/* OBSERVABLE UNIVERSE - VERY SUBTLE BOUNDARY */}

//       <mesh>

//         <sphereGeometry
//           args={[900, 64, 64]}
//         />

//         <meshBasicMaterial
//           color="#30385c"
//           transparent
//           opacity={0.012}
//           side={THREE.BackSide}
//           depthWrite={false}
//         />

//       </mesh>

//     </group>
//   );
// }

function Sun({ onSelect }) {
  const sunTexture = useLoader(
    TextureLoader,
    "/textures/2k_sun.jpg"
  );

  const sunData = {
    name: "Sun",
    type: "G-type Main-sequence Star",
    diameter: "≈ 1.392 million km",
    distanceFromEarth: "≈ 149.6 million km",
    age: "≈ 4.6 billion years",
    mass: "≈ 1.989 × 10³⁰ kg",
    temperature: "≈ 5,500°C surface",
    coreTemperature: "≈ 15 million°C",
    composition: "Mostly hydrogen and helium",
    moons: "N/A",

    // CameraFocus ke liye
    distance: 0,
    radius: 1.55,
    color: "#ff9d00",

    info:
      "The Sun is the star at the center of our Solar System. It contains about 99.86% of the Solar System's total mass and provides the energy that drives Earth's climate and supports life."
  };

  return (
    <group>

      {/* SUN */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(sunData);
        }}
      >
        <sphereGeometry args={[0.35, 64, 64]} />

        <meshBasicMaterial
          map={sunTexture}
          toneMapped={false}
        />

      </mesh>

      {/* SUN LIGHT */}
      <pointLight
        color="#fff4d6"
        intensity={2.5}
        distance={100}
      />

      <pointLight
        intensity={350}
        distance={100}
        color="#fff1c1"
      />

    </group>
  );
}

function Moon({ earthData, speed, onSelect }) {
  const earthOrbitRef = useRef();
  const moonOrbitRef = useRef();
  const moonRef = useRef();

  const moonTexture = useLoader(
    TextureLoader,
    "/textures/2k_moon.jpg"
  );

  useFrame((_, delta) => {
    // Earth + Moon together orbit the Sun
    if (earthOrbitRef.current) {
      earthOrbitRef.current.rotation.y +=
        delta * earthData.speed * speed * 0.25;
    }

    // Moon orbits Earth
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y +=
        delta * speed * 0.8;
    }

    // Moon itself rotates
    if (moonRef.current) {
      moonRef.current.rotation.y +=
        delta * speed * 0.4;
    }
  });

  return (
    <group ref={earthOrbitRef}>

      {/* EARTH'S POSITION AROUND SUN */}
      <group position={[earthData.distance, 0, 0]}>

        {/* MOON'S ORBIT AROUND EARTH */}
        <group ref={moonOrbitRef}>

          {/* MOON */}
          <mesh
            ref={moonRef}
            position={[1.35, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect({
                name: "Moon",
                radius: 0.16,
                distance: 1.35,
                speed: 0,
                info: "Earth's natural satellite."

              });
            }}
          >
            <sphereGeometry args={[0.16, 48, 48]} />

            <meshStandardMaterial
              map={moonTexture}
              roughness={1}
              metalness={0}
            />

            {/* MOON NAME */}
            <Text
              position={[0, 0.28, 0]}
              fontSize={0.18}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Moon
            </Text>
          </mesh>

        </group>

      </group>
    </group>
  );
}

function Planet({ data, speed, onSelect }) {
  const group = useRef();
  const cloudGroup = useRef();
  const planetRef = useRef();
  const texture = useLoader(TextureLoader, data.texture);
  const ringTexture = useLoader(
    TextureLoader,
    "/textures/2k_saturn_ring_alpha.jpg"
  );

  const cloudTexture =
    data.name === "Earth"
      ? useLoader(TextureLoader, "/textures/2k_earth_clouds.jpg")
      : null;

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y +=
        delta * data.speed * speed * 0.25;
    }

    if (planetRef.current) {
      planetRef.current.rotation.y +=
        delta * 0.35 * speed;
    }

  });

  return (
    <group ref={group}>

      {/* PLANET ORBIT POSITION */}
      <group
        ref={group}
        position={[data.distance, 0, 0]}
      >

        {/* PLANET */}
        <mesh
          ref={planetRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data);
          }}
        >
          <sphereGeometry
            args={[data.radius, 64, 64]}
          />

          <meshStandardMaterial
            map={texture}
            roughness={0.8}
            metalness={0}
          />

          {/* PLANET NAME */}
          <Text
            position={[0, data.radius + 0.55, 0]}
            fontSize={0.38}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {data.name}
          </Text>
        </mesh>


        {/* EARTH CLOUDS */}
        {data.name === "Earth" && cloudTexture && (
          <group ref={cloudGroup}>
            <mesh scale={1.025}>
              <sphereGeometry
                args={[data.radius, 64, 64]}
              />

              <meshStandardMaterial
                map={cloudTexture}
                transparent
                opacity={0.7}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
        {/* EARTH ATMOSPHERE */}
        {data.name === "Earth" && (
          <mesh
            // position={[data.distance, 0, 0]}
            scale={1.045}
          >
            <sphereGeometry args={[data.radius, 64, 64]} />

            <meshBasicMaterial
              color="#4da6ff"
              transparent
              opacity={0.10}
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}


        SATURN RINGS
        {data.name === "Saturn" && (
          <mesh
            // ref={data.name === "Saturn" ? cloudGroup : null}
            rotation={[Math.PI / 2.5, 0.2, 0]}
          >
            <ringGeometry
              args={[
                data.radius * 1.35,
                data.radius * 2.15,
                128,
              ]}
            />

            <meshStandardMaterial
              map={ringTexture}
              side={THREE.DoubleSide}
              transparent={false}
            />
          </mesh>
        )}

      </group>
    </group>
  );
}

function CameraController({ target }) {
  const controlsRef = useRef();

  useFrame(() => {
    if (!controlsRef.current) return;

    if (target) {
      const distance = target.radius * 5;

      const targetPosition = new THREE.Vector3(
        target.distance + distance,
        distance * 0.6,
        distance
      );

      controlsRef.current.object.position.lerp(
        targetPosition,
        0.08
      );

      const planetPosition = new THREE.Vector3(
        target.distance,
        0,
        0
      );

      controlsRef.current.target.lerp(
        planetPosition,
        0.08
      );

      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={2}
      maxDistance={2000000}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
    />
  );
}

function AsteroidBelt({ speed }) {
  const beltRef = useRef();
  const asteroids = useMemo(() => {
    const count = 1000;
    const data = [];
    const innerRadius = 2.1 * AU;
    const outerRadius = 3.3 * AU;


    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius =
        innerRadius +
        Math.random() * (outerRadius - innerRadius);

      data.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 0.35,
        z: Math.sin(angle) * radius,
        size: 0.015 + Math.random() * 0.035,
      });
    }

    return data;
  }, []);

  useFrame((_, delta) => {
    if (beltRef.current) {
      beltRef.current.rotation.y += delta * 0.2 * speed;
    }
  });

  return (
    <group ref={beltRef}>
      {asteroids.map((asteroid, i) => (
        <mesh
          key={i}
          position={[
            asteroid.x,
            asteroid.y,
            asteroid.z,
          ]}
        >
          <sphereGeometry
            args={[asteroid.size, 6, 6]}
          />

          <meshStandardMaterial
            color="#777777"
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function FreeCameraController() {
  const { camera, gl } = useThree();

  const keys = useRef({});
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const keyDown = (e) => {
      keys.current[e.code] = true;
    };

    const keyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    const mouseDown = (e) => {
      if (e.button !== 0) return;

      isDragging.current = true;

      previousMouse.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const mouseUp = () => {
      isDragging.current = false;
    };

    const mouseMove = (e) => {
      if (!isDragging.current) return;

      const dx = e.clientX - previousMouse.current.x;
      const dy = e.clientY - previousMouse.current.y;

      previousMouse.current = {
        x: e.clientX,
        y: e.clientY,
      };

      camera.rotation.order = "YXZ";

      camera.rotation.y -= dx * 0.002;
      camera.rotation.x -= dy * 0.002;

      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2,
        Math.PI / 2
      );
    };

    const wheel = (e) => {
      const direction = new THREE.Vector3();

      camera.getWorldDirection(direction);

      const amount = e.deltaY * 0.03;

      camera.position.addScaledVector(
        direction,
        amount
      );
    };

    canvas.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("wheel", wheel);

    return () => {
      canvas.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
      canvas.removeEventListener("wheel", wheel);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    // ==========================================
    // UNIVERSE SCALE DISTANCE
    // ==========================================

    const solarSystemPosition = new THREE.Vector3(
      GALAXY_SCALE.solarSystemDistance,
      0,
      0
    );

    const scaleDistance =
      camera.position.distanceTo(
        solarSystemPosition
      );

    camera.getWorldDirection(direction);

    right.crossVectors(
      direction,
      camera.up
    ).normalize();

    const speed = 15 * delta;

    if (keys.current["KeyW"]) {
      camera.position.addScaledVector(
        direction,
        speed
      );
    }

    if (keys.current["KeyS"]) {
      camera.position.addScaledVector(
        direction,
        -speed
      );
    }

    if (keys.current["KeyD"]) {
      camera.position.addScaledVector(
        right,
        speed
      );
    }

    if (keys.current["KeyA"]) {
      camera.position.addScaledVector(
        right,
        -speed
      );
    }

    if (keys.current["KeyR"]) {
      camera.position.y += speed;
    }

    if (keys.current["KeyF"]) {
      camera.position.y -= speed;
    }
  });

  return null;
}

function InnerOortCloud() {
  const positions = useMemo(() => {
    const count = 5000;
    const data = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius =
        70 + Math.random() * 45;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      data[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      data[i * 3 + 1] =
        radius *
        Math.cos(phi);

      data[i * 3 + 2] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);
    }

    return data;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#dbeafe"
        size={0.025}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

function VoyagerOne({ onSelect }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y += delta * 0.05;
  });

  const voyagerData = {
    name: "Voyager 1",
    type: "Space Probe",
    diameter: "≈ 3.7 m",
    distanceFromSun: "Interstellar space",
    orbitalPeriod: "Escape trajectory",
    rotationPeriod: "N/A",
    moons: "N/A",
    atmosphere: "None",
    temperature: "Deep space environment",
    distance: 210,
    radius: 0.08,
    color: "#d6d6d6",
    info:
      "Voyager 1 is a NASA space probe launched in 1977. It is the most distant human-made object and has entered interstellar space."
  };

  return (
    <group
      ref={ref}
      position={[210, 8, 20]}
      scale={0.25}
    >
      {/* Main body */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(voyagerData);
        }}
      >
        <boxGeometry args={[0.18, 0.12, 0.12]} />

        <meshStandardMaterial
          color="#d6d6d6"
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      {/* High-Gain Antenna Dish */}
      <group rotation={[Math.PI / 2, 0, 0]}>

        {/* Dish */}
        <mesh>
          <sphereGeometry
            args={[0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />

          <meshStandardMaterial
            color="#d8d8d8"
            roughness={0.8}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Antenna feed support */}
        <mesh position={[0, 0, 0.18]}>
          <cylinderGeometry
            args={[0.015, 0.015, 0.38, 8]}
          />

          <meshStandardMaterial
            color="#777777"
            roughness={0.8}
          />
        </mesh>

        {/* Feed */}
        <mesh position={[0, 0, 0.38]}>
          <sphereGeometry args={[0.035, 12, 12]} />

          <meshStandardMaterial
            color="#555555"
            roughness={0.7}
          />
        </mesh>

      </group>
      {/* RTG Power Units */}
      <group position={[0, -0.18, 0]}>

        {/* RTG 1 */}
        <group position={[-0.22, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.28, 12]}
            />
            <meshStandardMaterial
              color="#555555"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          {/* RTG fins */}
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.015, 0.06]} />
            <meshStandardMaterial
              color="#333333"
              roughness={0.8}
            />
          </mesh>
        </group>

        {/* RTG 2 */}
        <group position={[0, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.28, 12]}
            />
            <meshStandardMaterial
              color="#555555"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.015, 0.06]} />
            <meshStandardMaterial
              color="#333333"
              roughness={0.8}
            />
          </mesh>
        </group>

        {/* RTG 3 */}
        <group position={[0.22, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.28, 12]}
            />
            <meshStandardMaterial
              color="#555555"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.12, 0.015, 0.06]} />
            <meshStandardMaterial
              color="#333333"
              roughness={0.8}
            />
          </mesh>
        </group>

      </group>

      {/* Voyager locator glow */}
      <pointLight
        color="#00e5ff"
        intensity={8}
        distance={12}
        decay={2}
      />

      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function VoyagerTwo({ onSelect }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y += delta * 0.05;
  });

  const voyagerData = {
    name: "Voyager 2",
    type: "Space Probe",
    diameter: "≈ 3.7 m",
    distanceFromSun: "≈ 143 AU",
    orbitalPeriod: "Escape trajectory",
    rotationPeriod: "N/A",
    moons: "N/A",
    atmosphere: "None",
    temperature: "Deep space environment",
    distance: 190,
    radius: 0.08,
    color: "#d6d6d6",

    info:
      "Voyager 2 is a NASA space probe launched in 1977. It is traveling outward from the Solar System and is the only spacecraft to have visited all four giant planets."
  };

  return (
    <group
      ref={ref}
      position={[-190, -8, -20]}
      scale={0.25}
    >

      {/* =========================
          MAIN SPACECRAFT BODY
      ========================= */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(voyagerData);
        }}
      >
        <boxGeometry args={[0.22, 0.14, 0.14]} />

        <meshStandardMaterial
          color="#b8b8b8"
          metalness={0.65}
          roughness={0.45}
        />
      </mesh>


      {/* =========================
          HIGH-GAIN ANTENNA DISH
      ========================= */}
      <group
        position={[0, 0.05, 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
      >

        {/* Dish */}
        <mesh>
          <sphereGeometry
            args={[
              0.38,
              32,
              16,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2
            ]}
          />

          <meshStandardMaterial
            color="#dedede"
            roughness={0.85}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dish support */}
        <mesh position={[0, 0, 0.22]}>
          <cylinderGeometry
            args={[0.018, 0.018, 0.4, 10]}
          />

          <meshStandardMaterial
            color="#777777"
            roughness={0.8}
          />
        </mesh>

        {/* Feed */}
        <mesh position={[0, 0, 0.43]}>
          <sphereGeometry args={[0.035, 12, 12]} />

          <meshStandardMaterial
            color="#444444"
            roughness={0.7}
          />
        </mesh>

      </group>


      {/* =========================
          CENTRAL SUPPORT
      ========================= */}
      <mesh
        position={[0, -0.12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.025, 0.025, 0.28, 8]}
        />

        <meshStandardMaterial
          color="#555555"
          metalness={0.6}
          roughness={0.6}
        />
      </mesh>


      {/* =========================
          RTG POWER UNITS
      ========================= */}
      <group position={[0, -0.25, -0.05]}>

        {/* RTG 1 */}
        <group position={[-0.22, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.30, 12]}
            />

            <meshStandardMaterial
              color="#4d4d4d"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          {/* RTG fins */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>

          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>
        </group>


        {/* RTG 2 */}
        <group position={[0, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.30, 12]}
            />

            <meshStandardMaterial
              color="#4d4d4d"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>

          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>
        </group>


        {/* RTG 3 */}
        <group position={[0.22, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[0.055, 0.055, 0.30, 12]}
            />

            <meshStandardMaterial
              color="#4d4d4d"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>

          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.10, 0.012, 0.07]} />

            <meshStandardMaterial
              color="#303030"
              roughness={0.9}
            />
          </mesh>
        </group>

      </group>


      {/* =========================
          SCIENCE INSTRUMENT BOOM
      ========================= */}
      <group position={[0.32, 0, 0]}>

        {/* Boom */}
        <mesh
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry
            args={[0.012, 0.012, 0.65, 8]}
          />

          <meshStandardMaterial
            color="#777777"
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

        {/* Instrument 1 */}
        <mesh position={[0.35, 0.08, 0]}>
          <boxGeometry
            args={[0.10, 0.10, 0.10]}
          />

          <meshStandardMaterial
            color="#777777"
            metalness={0.4}
            roughness={0.7}
          />
        </mesh>

        {/* Instrument 2 */}
        <mesh position={[0.35, -0.08, 0]}>
          <cylinderGeometry
            args={[0.045, 0.045, 0.12, 10]}
          />

          <meshStandardMaterial
            color="#555555"
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

      </group>


      {/* =========================
          SMALL COMMUNICATION BOOM
      ========================= */}
      <mesh
        position={[-0.28, 0.08, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[0.012, 0.012, 0.35, 8]}
        />

        <meshStandardMaterial
          color="#888888"
          roughness={0.7}
        />
      </mesh>


      {/* =========================
          VOYAGER 2 LOCATOR
      ========================= */}
      <pointLight
        color="#ff4dff"
        intensity={6}
        distance={10}
        decay={2}
      />

      <mesh>
        <sphereGeometry
          args={[0.10, 16, 16]}
        />

        <meshBasicMaterial
          color="#ff4dff"
          transparent
          opacity={0.75}
        />
      </mesh>

    </group>
  );
}



function Voyager({ position, data, onSelect }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y += delta * 0.05;
  });

  const voyagerData = {
    ...data,
    type: "Space Probe",
    diameter: "≈ 3.7 m",
    orbitalPeriod: "Escape trajectory",
    rotationPeriod: "N/A",
    moons: "N/A",
    atmosphere: "None",
    temperature: "Deep space environment",
  };

  return (
    <group
      ref={ref}
      position={position}
      scale={0.25}
    >

      {/* =========================
          MAIN SPACECRAFT BODY
      ========================= */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(voyagerData);
        }}
      >
        <boxGeometry args={[0.22, 0.14, 0.14]} />

        <meshStandardMaterial
          color="#b8b8b8"
          metalness={0.65}
          roughness={0.45}
        />
      </mesh>


      {/* =========================
          HIGH GAIN ANTENNA DISH
      ========================= */}
      <group
        position={[0, 0.05, 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
      >

        {/* Dish */}
        <mesh>
          <sphereGeometry
            args={[
              0.38,
              32,
              16,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2
            ]}
          />

          <meshStandardMaterial
            color="#dedede"
            metalness={0.15}
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dish support */}
        <mesh position={[0, 0, 0.22]}>
          <cylinderGeometry
            args={[0.018, 0.018, 0.4, 10]}
          />

          <meshStandardMaterial
            color="#777777"
            roughness={0.8}
          />
        </mesh>

        {/* Feed */}
        <mesh position={[0, 0, 0.43]}>
          <sphereGeometry args={[0.035, 12, 12]} />

          <meshStandardMaterial
            color="#444444"
            roughness={0.7}
          />
        </mesh>

      </group>


      {/* =========================
          CENTRAL SUPPORT
      ========================= */}
      <mesh
        position={[0, -0.12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.025, 0.025, 0.28, 8]}
        />

        <meshStandardMaterial
          color="#555555"
          metalness={0.6}
          roughness={0.6}
        />
      </mesh>


      {/* =========================
          RTG POWER UNITS
      ========================= */}
      <group position={[0, -0.25, -0.05]}>

        {[-0.22, 0, 0.22].map((x, i) => (
          <group
            key={i}
            position={[x, 0, 0]}
          >

            {/* RTG cylinder */}
            <mesh
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry
                args={[0.055, 0.055, 0.30, 12]}
              />

              <meshStandardMaterial
                color="#4d4d4d"
                metalness={0.7}
                roughness={0.5}
              />
            </mesh>

            {/* RTG fins */}
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry
                args={[0.10, 0.012, 0.07]}
              />

              <meshStandardMaterial
                color="#303030"
                roughness={0.9}
              />
            </mesh>

            <mesh position={[0, -0.06, 0]}>
              <boxGeometry
                args={[0.10, 0.012, 0.07]}
              />

              <meshStandardMaterial
                color="#303030"
                roughness={0.9}
              />
            </mesh>

          </group>
        ))}

      </group>


      {/* =========================
          SCIENCE INSTRUMENT BOOM
      ========================= */}
      <group position={[0.32, 0, 0]}>

        {/* Long boom */}
        <mesh
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry
            args={[0.012, 0.012, 0.65, 8]}
          />

          <meshStandardMaterial
            color="#777777"
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

        {/* Instrument 1 */}
        <mesh position={[0.35, 0.08, 0]}>
          <boxGeometry
            args={[0.10, 0.10, 0.10]}
          />

          <meshStandardMaterial
            color="#777777"
            metalness={0.4}
            roughness={0.7}
          />
        </mesh>

        {/* Instrument 2 */}
        <mesh position={[0.35, -0.08, 0]}>
          <cylinderGeometry
            args={[0.045, 0.045, 0.12, 10]}
          />

          <meshStandardMaterial
            color="#555555"
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

      </group>


      {/* =========================
          SMALL COMMUNICATION BOOM
      ========================= */}
      <mesh
        position={[-0.28, 0.08, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[0.012, 0.012, 0.35, 8]}
        />

        <meshStandardMaterial
          color="#888888"
          roughness={0.7}
        />
      </mesh>


      {/* =========================
          LOCATOR GLOW
      ========================= */}
      <pointLight
        color="#00e5ff"
        intensity={6}
        distance={10}
        decay={2}
      />

      <mesh>
        <sphereGeometry
          args={[0.10, 16, 16]}
        />

        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.75}
        />
      </mesh>

    </group>
  );
}

function KuiperBelt() {
  const count = 3500;
  const positions = new Float32Array(count * 3);

  const innerRadius = 122;
  const outerRadius = 200;

  for (let i = 0; i < count; i++) {
    const radius =
      innerRadius +
      Math.random() * (outerRadius - innerRadius);

    const angle = Math.random() * Math.PI * 2;

    const y = (Math.random() - 0.5) * 0.8;

    positions[i * 3] =
      Math.cos(angle) * radius;

    positions[i * 3 + 1] = y;

    positions[i * 3 + 2] =
      Math.sin(angle) * radius;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#cbd5e1"
        size={0.08}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

function Pluto({ speed, onSelect }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y += delta * speed * 0.08;
  });

  const distance = 39.48 * AU;

  return (
    <group ref={ref}>
      <mesh
        position={[distance, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();

          onSelect?.({
            name: "Pluto",
            type: "Dwarf Planet",
            diameter: "2,377 km",
            distanceFromSun: "≈ 5.9 billion km",
            orbitalPeriod: "≈ 248 Earth years",
            rotationPeriod: "≈ 6.4 Earth days",
            moons: "5",
            atmosphere: "Thin nitrogen atmosphere",
            temperature: "≈ −230°C",
            distance,
            radius: 0.12,
            color: "#b8a58e",
            info:
              "Pluto is a dwarf planet in the Kuiper Belt beyond Neptune. Its orbit is highly eccentric and inclined."
          });
        }}
      >
        {/* <sphereGeometry args={[0.12, 24, 24]} /> */}
        <sphereGeometry args={[0.22, 24, 24]} />

        <meshStandardMaterial
          color="#b8a58e"
          roughness={1}
        />
        <Html
          distanceFactor={8}
          position={[0, 0.25, 0]}
          center
        >
          <div
            style={{
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              textShadow: "0 0 5px black",
              pointerEvents: "none",
            }}
          >
            Pluto
          </div>
        </Html>
      </mesh>
    </group>
  );
}

function SolarSystem({ speed, onSelect }) {
  const solarSystemRef = useRef();

  return (
    <group
      ref={solarSystemRef}
      position={[0, 0, 0]}
    >
      <ambientLight intensity={0.08} />

      {/* ☀️ Sun */}



      <Sun onSelect={onSelect} />
      {/* 🪐 Existing planets */}
      {planets.map((planet) => (
        <group key={planet.name}>
          <Planet
            data={planet}
            speed={speed}
            onSelect={onSelect}
          />
        </group>
      ))}

      {/* 🌙 Moon */}
      {planets
        .filter((planet) => planet.name === "Earth")
        .map((earth) => (
          <Moon
            key="moon"
            earthData={earth}
            speed={speed}
            onSelect={onSelect}
          />
        ))}

      {/* ☄️ Existing Asteroid Belt */}
      <AsteroidBelt speed={speed} />

      {/* 🪐 Pluto */}
      <Pluto speed={speed} onSelect={onSelect} />

      {/* ☄️ Kuiper Belt */}
      <KuiperBelt />
      <Pluto
        speed={speed}
        onSelect={onSelect}
      />


      {/* 🚀 Voyager 1 */}
      <VoyagerOne onSelect={onSelect} />
      <VoyagerTwo onSelect={onSelect} />

      {/* ☁️ Inner Oort Cloud */}
      <InnerOortCloud />
    </group>
  );
}
<>
  {/* -------------------------------- */}
  {/* GALAXY-SCALE SOLAR SYSTEM MARKER */}
  {/* -------------------------------- */}

  <>
    <group>
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </group>
  </>
</>



function CameraFocus({ selected, controlsRef }) {
  useFrame(() => {
    if (!selected || !controlsRef.current) return;

    const controls = controlsRef.current;
    const camera = controls.object;

    const target = new THREE.Vector3(
      selected.distance,
      0,
      0
    );

    const offset = new THREE.Vector3(
      selected.radius * 5,
      selected.radius * 2,
      selected.radius * 5
    );

    const desiredPosition = target.clone().add(offset);

    camera.position.lerp(desiredPosition, 0.06);
    controls.target.lerp(target, 0.06);

    controls.update();
  });

  return null;
}

function CameraDistanceTracker({ onDistanceChange }) {
  const { camera } = useThree();

  useFrame(() => {
    const solarSystemPosition = new THREE.Vector3(26, 0, 0);

    const distance = camera.position.distanceTo(
      solarSystemPosition
    );

    onDistanceChange(distance);
  });

  return null;
}

function CameraNavigator({
  goToSolar,
  goToVoyager1,
  goToVoyager2,
  controlsRef,
}) {
  const { camera } = useThree();

  useEffect(() => {

    goToVoyager2.current = () => {
      const voyagerPosition = new THREE.Vector3(
        -190,
        -8,
        -20
      );

      camera.position.copy(
        voyagerPosition.clone().add(
          new THREE.Vector3(3, 2, 3)
        )
      );

      if (controlsRef.current) {
        controlsRef.current.target.copy(voyagerPosition);
        controlsRef.current.update();
      }
    };

    goToSolar.current = () => {
      const target = new THREE.Vector3(0, 0, 0);

      camera.position.set(12, 7, 12);

      if (controlsRef.current) {
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
      }
    };


    goToVoyager1.current = () => {
      const voyagerPosition = new THREE.Vector3(
        210,
        8,
        20
      );

      camera.position.copy(
        voyagerPosition.clone().add(
          new THREE.Vector3(8, 5, 8)
        )
      );

      if (controlsRef.current) {
        controlsRef.current.target.copy(voyagerPosition);
        controlsRef.current.update();
      }
    };

    goToVoyager2.current = () => {
      const voyagerPosition = new THREE.Vector3(
        -190,
        -8,
        -20
      );

      camera.position.copy(
        voyagerPosition.clone().add(
          new THREE.Vector3(3, 2, 3)
        )
      );

      if (controlsRef.current) {
        controlsRef.current.target.copy(voyagerPosition);
        controlsRef.current.update();
      }
    };

    return () => {
      goToSolar.current = null;
      goToVoyager1.current = null;
      goToVoyager2.current = null;
    };

  }, [camera, goToSolar, goToVoyager1, controlsRef]);

  return null;
}

export default function App() {
  const [speed, setSpeed] = useState(1);
  const markerRef = useRef();
  const [cameraDistance, setCameraDistance] = useState(0);
  const [selected, setSelected] = useState(null);
  const controlsRef = useRef();
  const [goToVoyager1, setGoToVoyager1] = useState(false);
  const goToVoyager1Ref = useRef(null);
  const [goToVoyager2, setGoToVoyager2] = useState(false);
  const goToVoyager2Ref = useRef(null);
  const goToSolar = useRef(null);
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  const focusing = useRef(false);


  useEffect(() => {

    if (goToVoyager1 && goToVoyager1Ref.current) {
      goToVoyager1Ref.current();
      setGoToVoyager1(false);
    }

    if (goToVoyager2 && goToVoyager2Ref.current) {
      goToVoyager2Ref.current();
      setGoToVoyager2(false);
    }

    if (!selected) return;

    cameraTarget.current.set(
      selected.distance,
      0,
      0
    );

    const focusDistance = Math.max(
      selected.radius * 5,
      3
    );

    cameraPosition.current.set(
      selected.distance + focusDistance,
      focusDistance * 0.5,
      focusDistance
    );

    focusing.current = true;
  }, [selected, goToVoyager2, goToVoyager1]);

  return (
    <div className="app">

      <div className="title">
        <h1>☀️ SOLAR SYSTEM</h1>
        <p>Explore our cosmic neighborhood</p>
      </div>


      <Canvas
        camera={{
          position: [26, 18, 35],
          fov: 55,
        }}
        dpr={[1, 2]}
      >
        <CameraNavigator
          goToSolar={goToSolar}
          goToVoyager1={goToVoyager1Ref}
          goToVoyager2={goToVoyager2Ref}
          controlsRef={controlsRef}
        />

        <CameraDistanceTracker
          onDistanceChange={setCameraDistance}
        />

        <SolarSystem
          speed={speed}
          onSelect={setSelected}
        />
        {/* <SceneLOD
          solarSystem={
            <SolarSystem
              speed={speed}
              onSelect={setSelected}
            />
          }
          milkyWay={<MilkyWay />}
          localGroup={<LocalGroupGalaxies />}
          largeUniverse={
            <>
              <ObservableUniverse />
              <LargeScaleUniverse />
              <CosmicWeb />
              <CosmicVoids />
              <UniverseGalaxies />
            </>
          }
        /> */}

        <CameraFocus
          selected={selected}
          controlsRef={controlsRef}
        />

        <FreeCameraController />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={2000000}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
        />
      </Canvas>


      <div className="zoom-indicator">
        📏 Distance from Solar System:{" "}
        {cameraDistance.toFixed(1)} units
      </div>

      <button
        className="solar-button"
        onClick={() => {
          if (goToSolar.current) {
            goToSolar.current();
          }
        }}
      >
        ☀️ Go to Solar System
      </button>

      <button
        className="voyager-button"
        onClick={() => setGoToVoyager1(true)}
      >
        🚀 Go to Voyager 1
      </button>

      <button
        className="voyager2-button"
        onClick={() => setGoToVoyager2(true)}
      >
        🚀 Go to Voyager 2
      </button>

      <div className="controls">
        <div className="control-title">🚀 Orbit Speed</div>

        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />

        <div className="speed-value">
          {speed.toFixed(1)}×
        </div>

        <button onClick={() => setSpeed(0)}>
          ⏸ Pause
        </button>

        <button onClick={() => setSpeed(1)}>
          ▶ Normal
        </button>

        <button onClick={() => setSpeed(3)}>
          ⚡ Fast
        </button>
      </div>

      {selected && (
        <div className="planet-info">
          <button
            className="close"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>

          <h2>{selected.name}</h2>

          <div
            className="planet-preview"
            style={{
              background: selected.color,
              width: selected.radius * 45,
              height: selected.radius * 45,
            }}
          />

          <p>{selected.info}</p>

          <div className="stats">

            <div>
              <span>Type</span>
              <strong>{selected.type}</strong>
            </div>

            <div>
              <span>Diameter</span>
              <strong>{selected.diameter}</strong>
            </div>

            <div>
              <span>Distance</span>
              <strong>
                {selected.distanceFromSun ||
                  selected.distanceFromEarth ||
                  selected.distanceFromSun ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Orbital Period</span>
              <strong>{selected.orbitalPeriod}</strong>
            </div>

            <div>
              <span>Rotation Period</span>
              <strong>{selected.rotationPeriod}</strong>
            </div>

            <div>
              <span>Moons</span>
              <strong>{selected.moons}</strong>
            </div>

            <div>
              <span>Atmosphere</span>
              <strong>{selected.atmosphere}</strong>
            </div>

            <div>
              <span>Temperature</span>
              <strong>{selected.temperature}</strong>
            </div>

            <div>
              <span>Visualization Distance</span>
              <strong>
                {selected.distance !== undefined
                  ? `${selected.distance} units`
                  : "—"}
              </strong>
            </div>

          </div>

          <small>
            Visualization distances and planet sizes are not to scale.
            Scientific values are approximate.
          </small>
        </div>
      )}

      <div className="instructions">
        🖱️ Drag = Rotate &nbsp; • &nbsp;
        🔍 Scroll = Zoom &nbsp; • &nbsp;
        🪐 Click = Planet info
      </div>

    </div>
  );
}