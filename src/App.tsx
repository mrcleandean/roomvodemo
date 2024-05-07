import { useEffect, useRef } from "react";
import { PanInfo, motion, useMotionValue } from "framer-motion";
import { Check, HouseSimple, Pause, ShareNetwork, SignOut } from "@phosphor-icons/react";
import ButtonPanel from "./components/ButtonPanel";
import { DRAG_FACTOR } from "./constants";
import View from "./components/View";
import useMeasure from 'react-use-measure';
import useRoomsContext from "./hooks/useRoomsContext";
import clamp from "lodash.clamp";
import { useToast } from "./hooks/useToast";
import GradientEdges from "./components/GradientEdges";
import AddButton from "./components/AddButton";

export type Room = {
  id: string;
  src: string;
  title: string;
  floor: string;
  wall: string;
  favourited: boolean;
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
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-gradient-to-r from-[#464C51] to-[#505860]">
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
      {rooms.length > 0 ? (
        <motion.div
          drag="x"
          dragListener={viewing}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.175}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          style={{ x }}
          className="active:cursor-grabbing touch-none origin-right"
        >
          {rooms.map((room, i) => (
            <View
              key={room.id}
              room={room}
              i={i}
            />
          ))}
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="flex flex-col gap-1 justify-center items-center">
            <h1 className="text-white text-center mt-8">No rooms yet</h1>
            <AddButton />
          </div>
        </div>
      )}
      <GradientEdges />
    </div >
  );
};

export default App;