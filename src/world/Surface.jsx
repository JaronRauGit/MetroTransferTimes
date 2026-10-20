import { Block, FloorSlab, Rod, Sign, colors } from './Primitives.jsx';
import { Building, LowPolyTree, Palm, StaircaseAlongX } from './Architecture.jsx';
import { Traveller, Turnstiles } from './Details.jsx';

function CasaFacade({ x }) {
  const y = 3.56;
  const z = -5.35;
  return <group>
    <Block position={[x, y + 1.97, z]} size={[3.7, 3.94, 2.2]} color="#ead5b2" />
    <Block position={[x, y + 3.99, z]} size={[3.88, .16, 2.32]} color="#b98369" />
    {[-1.25, -.42, .42, 1.25].map((offset, index) => <mesh key={offset} position={[x + offset, y + 4.15 + (index % 2 ? .05 : -.04), z + .72]} castShadow>
      <sphereGeometry args={[.49, 9, 6]} /><meshStandardMaterial color={index % 2 ? '#ad745f' : '#d29a74'} flatShading roughness={.94} />
    </mesh>)}
    {[-1.12, 0, 1.12].map((offset, column) => [1.02, 2.17, 3.23].map((height, row) => <group key={`${offset}-${height}`}>
      <Block position={[x + offset, y + height, z + 1.14]} size={[.64, .67, .09]} color={colors.tealDark} />
      <Block position={[x + offset, y + height, z + 1.19]} size={[.49, .55, .02]} color="#7babb0" roughness={.3} />
      <mesh position={[x + offset, y + height + .33, z + 1.19]} castShadow><sphereGeometry args={[.32, 9, 5]} /><meshStandardMaterial color="#d0b995" roughness={1} /></mesh>
      <Block position={[x + offset, y + height - .39, z + 1.35]} size={[.82, .09, .4]} color="#c6ae91" />
      <Rod from={[x + offset - .35, y + height - .12, z + 1.54]} to={[x + offset + .35, y + height - .12, z + 1.54]} radius={.03} color="#496d68" />
      {row === 2 && <Block position={[x + offset, y + 4.08, z + 1.15]} size={[.52, .035, .38]} color={column % 2 ? '#6c958e' : '#e1ad79'} />}
    </group>))}
    <Block position={[x - 1.86, y + 1.88, z + 1.17]} size={[.17, 3.8, .17]} color="#d4bb98" />
    <Block position={[x + 1.86, y + 1.88, z + 1.17]} size={[.17, 3.8, .17]} color="#d4bb98" />
  </group>;
}

function FlowerTile({ x, z }) {
  return <group position={[x, 3.795, z]}>
    <Block position={[0, -.007, 0]} size={[.48, .014, .48]} color="#ddc9a9" castShadow={false} />
    {[0, 1, 2, 3].map(index => {
      const angle = index * Math.PI / 2;
      return <mesh key={index} position={[Math.cos(angle) * .105, .003, Math.sin(angle) * .105]} rotation={[0, -angle, 0]} scale={[.105, .013, .17]} castShadow={false}>
        <sphereGeometry args={[1, 8, 5]} /><meshStandardMaterial color="#aa9276" roughness={1} />
      </mesh>;
    })}
    <mesh position={[0, .004, 0]} scale={[.07, .012, .07]}><sphereGeometry args={[1, 8, 5]} /><meshStandardMaterial color="#aa9276" roughness={1} /></mesh>
  </group>;
}

function BarcelonaBench({ position }) {
  return <group position={position}>
    {[-.27, -.13, .01, .15].map((z, i) => <Block key={i} position={[0, .47, z]} size={[1.35, .075, .11]} color={i % 2 ? '#af7457' : '#c18b61'} />)}
    {[-.49, .49].map(x => <group key={x}>
      <Rod from={[x, .12, -.2]} to={[x, .84, -.38]} radius={.042} color="#3e6665" />
      <Rod from={[x, .17, .24]} to={[x, .6, -.38]} radius={.035} color="#3e6665" />
    </group>)}
    {[-.31, -.16, -.01, .14].map((z, i) => <Block key={z} position={[0, .7 + i * .09, z - .43]} size={[1.34, .075, .1]} color="#b88261" />)}
  </group>;
}

function BarcelonaLamp({ position }) {
  return <group position={position}>
    <mesh position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[.055, .09, 3.2, 8]} /><meshStandardMaterial color="#405f60" roughness={.82} /></mesh>
    <Block position={[0, 3.19, 0]} size={[.37, .11, .37]} color="#405f60" />
    {[-1, 1].map(side => <group key={side}>
      <Rod from={[0, 2.82, 0]} to={[side * .42, 3.12, 0]} radius={.035} color="#405f60" />
      <mesh position={[side * .47, 3.14, 0]}><sphereGeometry args={[.17, 10, 8]} /><meshStandardMaterial color="#fff0c8" emissive="#e4c88b" emissiveIntensity={.7} roughness={.75} /></mesh>
    </group>)}
  </group>;
}

function PavementOpening({ layout, stationName }) {
  const x = layout.entranceX;
  return <group>
    <Block position={[x, 2.17, -2.07]} size={[3.52, 2.75, .14]} color="#c7ad90" />
    <Block position={[x - 1.74, 2.14, -1.08]} size={[.13, 2.83, 1.93]} color="#d1b99b" />
    <Block position={[x + 1.74, 3.18, -1.08]} size={[.13, .75, 1.93]} color="#d1b99b" />
    <Block position={[x, 3.68, .03]} size={[3.58, .24, .2]} color="#d1b99b" />
    <Block position={[x - 1.78, 3.68, -1.07]} size={[.2, .24, 2.1]} color="#d1b99b" />
    <Block position={[x + 1.78, 3.68, -1.07]} size={[.2, .24, 2.1]} color="#d1b99b" />
    <StaircaseAlongX topX={x - 1.34} bottomX={x + 1.34} yTop={3.56} yBottom={.38} z={-1.05} width={1.5} steps={19} />
    <Rod from={[x - 1.64, 4.12, .02]} to={[x + 1.64, 4.12, .02]} radius={.043} color={colors.tealDark} />
    <Block position={[x - 1.85, 4.55, -.05]} size={[.11, 1.9, .11]} color={colors.metal} />
    <Sign position={[x - 1.85, 5.46, -.02]} size={[.64, .64]} text="M" background={colors.coral} foreground={colors.warmWhite} frame={colors.coral} />
    <Sign position={[x + .15, 4.0, .16]} size={[2.53, .34]} text={stationName} background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
    <Turnstiles position={[x + 1.85, .38, .34]} />
  </group>;
}

export default function BarcelonaStreet({ layout, stationName, reducedMotion }) {
  const width = layout.span + 20;
  const x = layout.entranceX;
  const leftWidth = x - 1.78 + width / 2;
  const rightStart = x + 1.78;
  const rightWidth = width / 2 - rightStart;
  return <group>
    <Block position={[0, 2.3, -4.74]} size={[width, 2.45, 2.2]} color="#bfa68d" />
    <FloorSlab position={[0, 3.56, -4.65]} size={[width, 4.18, .44]} color="#e9d7b5" />
    <FloorSlab position={[0, 3.56, -2.33]} size={[width, .53, .44]} color="#aeb5a6" sideColor="#9f9e8c" />
    <FloorSlab position={[-width / 2 + leftWidth / 2, 3.56, -1.08]} size={[leftWidth, 1.98, .44]} color="#eee0c4" />
    <FloorSlab position={[rightStart + rightWidth / 2, 3.56, -1.08]} size={[rightWidth, 1.98, .44]} color="#eee0c4" />
    <Block position={[0, 3.61, -2.52]} size={[width, .018, .045]} color="#faf1d6" castShadow={false} />
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[-width / 2 + (i + .5) * width / 15, 3.59, -2.34]} size={[.07, .015, .24]} color="#f3e7ca" castShadow={false} />)}
    <Building position={[layout.upperX - 5.95, 3.58, -5.35]} width={2.9} depth={2.05} height={3.2} color="#e3c8a6" roof="#b7765c" flat />
    <CasaFacade x={layout.upperX - 1.82} />
    <Building position={[layout.upperX + 2.85, 3.58, -5.35]} width={3.1} depth={2.1} height={3.45} color="#e9dcbf" roof="#8ca08a" flat />
    <Building position={[layout.lowerX + 2.08, 3.58, -5.35]} width={3.3} depth={2.05} height={3.1} color="#e5cfb1" roof="#b7795e" flat />
    <LowPolyTree position={[layout.upperX + 5.08, 3.58, -3.52]} scale={.7} />
    <LowPolyTree position={[layout.lowerX - 1.55, 3.58, -3.5]} hue="#7f9878" scale={.7} />
    <Palm position={[layout.lowerX + 4.45, 3.58, -3.3]} scale={.68} />
    <PavementOpening layout={layout} stationName={stationName} />
    {Array.from({ length: 11 }, (_, i) => {
      const tileX = -width / 2 + 1.5 + i * (width - 3) / 10;
      return Math.abs(tileX - x) < 2 ? null : <FlowerTile key={i} x={tileX} z={-.72} />;
    })}
    <BarcelonaBench position={[layout.upperX + 4.72, 3.58, -1.33]} />
    <BarcelonaLamp position={[layout.upperX + 5.95, 3.58, -1.16]} />
    <BarcelonaLamp position={[layout.lowerX + 4.6, 3.58, -1.16]} />
    <Traveller position={[layout.upperX + 2.8, 3.58, -2.86]} shirt="#c16e59" phase={1.4} walk={.23} reducedMotion={reducedMotion} />
    <Traveller position={[layout.lowerX + 2.1, 3.58, -1.25]} shirt="#d1a268" phase={3} walk={.17} reducedMotion={reducedMotion} />
  </group>;
}
