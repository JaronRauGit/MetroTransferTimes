import { Block, FloorSlab, Rod, Sign, WindowPane, colors } from './Primitives.jsx';
import { Building, LowPolyTree, Palm, StaircaseAlongX } from './Architecture.jsx';
import StreetMobility from './StreetMobility.jsx';
import { Turnstiles } from './Details.jsx';

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
      <WindowPane lit={(column + row) % 3 !== 0} position={[x + offset, y + height, z + 1.19]} size={[.49, .55, .02]} color="#7babb0" roughness={.3} />
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
  return <group position={[x, 3.565, z]}>
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
  const l = layout;
  const x = l.entranceX;
  const width = l.entranceBottomX - l.entranceTopX + .36;
  return <group>
    <Block position={[x, (l.streetY + l.upperY) / 2, -.81]} size={[width, l.streetY - l.upperY, .12]} color="#cfb698" />
    <Block position={[l.entranceTopX - .21, (l.streetY + l.upperY) / 2, l.entranceZ]} size={[.12, l.streetY - l.upperY, 1.98]} color="#d1b99b" />
    {[-.83, 1.28].map(z => <Block key={z} position={[x, l.streetY + .13, z]} size={[width + .1, .26, .18]} color="#d1b99b" />)}
    <Block position={[l.entranceBottomX + .23, l.streetY + .13, l.entranceZ]} size={[.18, .26, 2.25]} color="#d1b99b" />
    <FloorSlab position={[l.entranceTopX - .09, l.streetY, l.entranceZ]} size={[.18, 1.7, .2]} color="#eee0c4" />
    <StaircaseAlongX topX={l.entranceTopX} bottomX={l.entranceBottomX} yTop={l.streetY} yBottom={l.upperY} z={l.entranceZ} width={1.7} steps={26} />
    <Block position={[l.entranceTopX - .17, l.streetY + .75, 1.32]} size={[.1, 1.5, .1]} color={colors.metal} />
    <Sign position={[l.entranceTopX - .17, l.streetY + 1.6, 1.35]} size={[.64, .64]} text="M" background={colors.coral} foreground={colors.warmWhite} frame={colors.coral} />
    {[-1, 1].map(side => <Rod key={side} from={[x + side * 1.5, l.streetY + .2, 1.31]} to={[x + side * 1.5, l.streetY + .7, 1.31]} radius={.035} color={colors.tealDark} />)}
    <Sign position={[x, l.streetY + .72, 1.35]} size={[4, .65]} text={stationName} background={colors.cream} foreground={colors.tealDark} frame={colors.tealDark} />
    <Turnstiles position={[l.entranceBottomX + .72, l.upperY, l.entranceZ]} rotation={[0, Math.PI / 2, 0]} />
  </group>;
}

export default function BarcelonaStreet({ layout, stationName, reducedMotion }) {
  const width = layout.streetMaxX - layout.streetMinX;
  const center = (layout.streetMaxX + layout.streetMinX) / 2;
  const x = layout.entranceX;
  const leftWidth = layout.entranceTopX - .18 - layout.streetMinX;
  const rightStart = layout.entranceBottomX + .18;
  const rightWidth = layout.streetMaxX - rightStart;
  return <group>
    <group position={[0, layout.streetY - 3.56, 0]}>
    <FloorSlab position={[center, 3.56, -4.65]} size={[width, 4.18, .44]} color="#e9d7b5" />
    <FloorSlab position={[center, 3.56, -2.37]} size={[width, .75, .44]} color="#aeb5a6" sideColor="#9f9e8c" />
    <FloorSlab position={[layout.streetMinX + leftWidth / 2, 3.56, -.3325]} size={[leftWidth, 3.465, .44]} color="#eee0c4" />
    <FloorSlab position={[rightStart + rightWidth / 2, 3.56, -.3325]} size={[rightWidth, 3.465, .44]} color="#eee0c4" />
    <FloorSlab position={[x, 3.56, -1.4075]} size={[rightStart - layout.entranceTopX + .18, 1.315, .44]} color="#eee0c4" />
    <FloorSlab position={[x, 3.56, 1.325]} size={[rightStart - layout.entranceTopX + .18, .15, .44]} color="#eee0c4" />
    <Block position={[center, 3.565, -2.73]} size={[width, .01, .045]} color="#faf1d6" castShadow={false} />
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[layout.streetMinX + (i + .5) * width / 15, 3.565, -2.37]} size={[.35, .01, .025]} color="#f3e7ca" castShadow={false} />)}
    <Building position={[layout.upperX - 5.95, 3.58, -5.35]} width={2.9} depth={2.05} height={3.2} color="#e3c8a6" roof="#b7765c" flat />
    <CasaFacade x={layout.upperX - 1.82} />
    <Building position={[layout.upperX + 2.85, 3.58, -5.35]} width={3.1} depth={2.1} height={3.45} color="#e9dcbf" roof="#8ca08a" flat />
    {Array.from({ length: Math.max(0, Math.floor((layout.lowerX - 1.2 - (layout.upperX + 6.6)) / 4.4) + 1) }, (_, i) => <Building
      key={`street-${i}`} position={[layout.upperX + 6.6 + i * 4.4, 3.58, -5.35]}
      width={2.75} depth={2.05} height={[2.8, 3.1, 2.65][i % 3]}
      color={i % 2 ? '#e6d6b8' : '#e5c8a4'} roof={i % 2 ? '#8ca08a' : '#bc856b'} flat
    />)}
    <Building position={[layout.lowerX + 2.08, 3.58, -5.35]} width={3.3} depth={2.05} height={3.1} color="#e5cfb1" roof="#b7795e" flat />
    <LowPolyTree position={[layout.upperX + 5.08, 3.58, -3.95]} scale={.58} />
    <LowPolyTree position={[layout.lowerX - 1.55, 3.58, -3.95]} hue="#7f9878" scale={.58} />
    <Palm position={[layout.lowerX + 4.45, 3.58, -3.95]} scale={.58} />
    {Array.from({ length: 11 }, (_, i) => {
      const tileX = layout.streetMinX + 1.5 + i * (width - 3) / 10;
      return Math.abs(tileX - x) < 2.6 ? null : <FlowerTile key={i} x={tileX} z={.65} />;
    })}
    <BarcelonaBench position={[layout.upperX + 4.72, 3.58, -1.33]} />
    <BarcelonaLamp position={[layout.upperX + 5.95, 3.58, -1.16]} />
    <BarcelonaLamp position={[layout.lowerX + 4.6, 3.58, -1.16]} />
    <StreetMobility layout={layout} reducedMotion={reducedMotion} />
    </group>
    <PavementOpening layout={layout} stationName={stationName} />
  </group>;
}
