import { useEffect, useRef } from "react";
import { PanInfo, motion, useMotionValue, useSpring } from "framer-motion";
import { Check, HouseSimple, Pause, ShareNetwork, SignOut } from "@phosphor-icons/react";
import ButtonPanel from "./components/ButtonPanel";
import { DRAG_FACTOR, SPRING_OPTIONS } from "./constants";
import View from "./components/View";
import useMeasure from 'react-use-measure';
import useRoomsContext from "./hooks/useRoomsContext";
import clamp from "lodash.clamp";
import { useToast } from "./hooks/useToast";

export type Room = {
  id: string;
  src: string;
  title: string;
  floor: string;
  wall: string;
  favourited: boolean;
};

export type RandomImage = {
  description: string;
  user: {
    username: string;
    name: string;
  };
  location: {
    country: string;
  };
  urls: {
    full: string;
  };
};

const App = () => {
  const {
    rooms,
    viewing, setViewing,
    setImgIndex,
    setWidth, setHeight,
    copied, setCopied
  } = useRoomsContext();
  const { toast } = useToast();
  const [ref, { width, height }] = useMeasure();
  const x = useMotionValue(0);
  const canDrag = useRef(true);

  useEffect(() => {
    setWidth(width)
    setHeight(height);
  }, [width, height]);

  const onDrag = (_e: MouseEvent, info: PanInfo) => {
    if (!viewing || !canDrag.current) return;
    const distance = Math.abs(info.offset.x);
    const xDir = Math.sign(info.offset.x);
    if (distance > width / DRAG_FACTOR) {
      canDrag.current = false;
      setImgIndex(prev => clamp(prev + (xDir > 0 ? -1 : 1), 0, rooms.length - 1));
    }
  }

  const onDragEnd = () => {
    canDrag.current = true;
  }

  return (
    <div ref={ref} className="relative h-screen w-screen overflow-hidden bg-gradient-to-r from-[#464C51] to-[#505860]">
      <ButtonPanel
        buttons={
          viewing ? (
            [
              { icon: Check, text: 'DONE', onClick: () => setViewing(false) }
            ]
          ) : (
            [
              { icon: SignOut, text: "EXIT", onClick: () => toast({ title: 'No exit functionality yet.', description: 'For demonstrative purposes only', variant: 'destructive' }) },
              { icon: HouseSimple, text: "CHANGE ROOM", onClick: () => toast({ title: 'No change room functionality yet.', description: 'For demonstrative purposes only', variant: 'destructive' }) },
              { icon: Pause, text: "VIEWS", onClick: () => setViewing(true) },
              { icon: ShareNetwork, text: `${copied ? 'COPIED' : 'SHARE'}`, onClick: () => setCopied(true) },
            ]
          )}
      />
      <motion.div
        drag="x"
        dragListener={viewing}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.175}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        style={{ x }}
        className={`active:cursor-grabbing touch-none origin-right`}
      >
        {rooms.map((room, i) => (
          <View
            key={room.id}
            room={room}
            i={i}
          />
        ))}
      </motion.div>
      <GradientEdges />
    </div >
  );
};

const GradientEdges = () => {
  return (
    <>
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-r from-neutral-950/50 to-neutral-950/0" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-l from-neutral-950/50 to-neutral-950/0" />
    </>
  );
};

export default App;