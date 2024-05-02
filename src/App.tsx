import useMeasure from "react-use-measure";
import { useDrag } from "react-use-gesture";
import { useSprings, animated } from "@react-spring/web";
import clamp from 'lodash.clamp';
import { useEffect, useRef, useState } from "react";
import ButtonPanel from './components/ButtonPanel';
import Button from './components/Button';
import { CircleNotch, Copy, Heart, Plus, ShareNetwork, X } from '@phosphor-icons/react';
import axios, { AxiosError } from "axios";
import { useDebouncedCallback } from "use-debounce";
import { BLUR_FACTOR, SCALED_R, SCALE_FACTOR, SNAP_DIVISOR } from "./templates/constants";
import { FaHeart } from "react-icons/fa";

export type Room = {
  src: string;
  title: string;
  floor: string;
  wall: string;
  favourited?: boolean;
}
type Img = {
  description: string;
  user: {
    username: string;
    name: string;
  },
  location: {
    country: string;
  },
  urls: {
    full: string
  }
}
const App = ({ initialRooms }: { initialRooms?: Room[] }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms || []);
  const [pending, setPending] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ref, { width, height }] = useMeasure();
  const index = useRef(0);
  const prev = useRef(0);
  const SCALED_WIDTH = width * SCALE_FACTOR;
  const SCALED_MARGIN_X = (width - SCALED_WIDTH) * 0.5;
  const SCALED_MARGIN_Y = (height * (1 - SCALE_FACTOR)) * 0.5;
  const LAP_FACTOR = 1.5;

  const setToInitial = (i: number) => {
    setViewing(false);
    const iOffset = i - index.current;
    return {
      x: window.innerWidth * iOffset,
      scale: 1,
      borderRadius: 0,
      display: Math.abs(iOffset) > 2 ? 'none' : 'block',
      filter: 'blur(0)',
      panelOpacity: iOffset === 0 ? 1 : 0,
      favouriteScale: rooms[i].favourited ? SCALE_FACTOR : 0,
      deleteScale: 0
    }
  }
  const zoomOut = (i: number) => {
    const iOffset = i - index.current;
    return {
      x: iOffset * (window.innerWidth - SCALED_MARGIN_X * LAP_FACTOR),
      scale: SCALE_FACTOR,
      borderRadius: SCALED_R,
      panelOpacity: iOffset === 0 ? 1 : 0,
      favouriteScale: rooms[i].favourited ? SCALE_FACTOR : 0,
      deleteScale: SCALE_FACTOR
    }
  }

  const scaleUpNew = (i: number) => {
    const iOffset = i - index.current;
    return {
      from: {
        ...zoomOut(i),
        scale: iOffset === 0 ? 0 : SCALE_FACTOR,
      },
      to: {
        scale: SCALE_FACTOR,
      },
    }
  }

  const animateSlide = (i: number) => {
    const iOffset = i - index.current;

    return {
      x: iOffset * (window.innerWidth - SCALED_MARGIN_X * LAP_FACTOR),
      display: i >= prev.current - 1 ? 'block' : 'none',
      panelOpacity: iOffset === 0 ? 1 : 0,
      filter: 'blur(0)',
      scale: SCALE_FACTOR
    }
  }

  const updateFavourites = (i: number) => ({ favouriteScale: viewing && rooms[i].favourited ? SCALE_FACTOR : 0 });

  const animateDrag = (i: number, active: boolean, mx: number, distance: number) => {
    const iOffset = i - index.current;
    const dragOffset = active ? mx : 0;
    const xOffset = (width - SCALED_MARGIN_X * LAP_FACTOR);
    const x = iOffset * xOffset + dragOffset;

    if (Math.abs(iOffset) > 2) return ({ display: 'none', x }); // we preserve x here to prevent image ripping if animateSlide() is large

    const scale = active ? SCALE_FACTOR - distance / width / SNAP_DIVISOR : SCALE_FACTOR;
    const blur = active ? BLUR_FACTOR - (distance / width) * SNAP_DIVISOR : 0;
    const panelOpacity = active && iOffset === 0 ? 1 - (distance / width) * SNAP_DIVISOR : iOffset === 0 ? 1 : 0;
    return {
      x,
      scale,
      filter: `blur(${blur}px)`,
      display: 'block',
      panelOpacity
    }
  }


  const bind = useDrag(({ active, movement: [mx], direction: [xDir], distance, cancel }) => {
    if (!viewing) return;
    if (active && distance > SCALED_WIDTH / SNAP_DIVISOR) {
      index.current = clamp(index.current + (xDir > 0 ? -1 : 1), 0, rooms.length - 1)
      cancel();
    }
    api.start(i => animateDrag(i, active, mx, distance));
  })

  const [props, api] = useSprings(rooms.length, i => {
    if (rooms.length !== 1) {
      return scaleUpNew(i);
    } else {
      return setToInitial(i);
    }
  }, [width])


  useEffect(() => {
    api.start(i => ({ ...updateFavourites(i), ...animateSlide(i) }));
  }, [rooms]);

  useEffect(() => {
    if (viewing) api.start(i => ({ ...zoomOut(i), ...updateFavourites(i) }));
    else api.start(i => ({ ...setToInitial(i), ...updateFavourites(i) }));
  }, [viewing]);

  const getImage = useDebouncedCallback(async () => {
    if (pending) return;
    try {
      setPending(true);

      const { data: img } = await axios.get('https://api.unsplash.com/photos/random/?client_id=2h2HdGP-9eokfYQAPi27xZuboofgBecBufOPzZwTneM') as { data: Img };
      const newRoom: Room = {
        src: img.urls.full,
        title: img.user.username,
        floor: img.location.country || 'No Location',
        wall: img.user.name
      }

      const loader = new Image();
      loader.onload = () => {
        setTimeout(() => {
          const newRooms = [...rooms, newRoom];
          setRooms(newRooms);
          prev.current = index.current;
          index.current = newRooms.length - 1;
          setPending(false);
        }, 600); // Additional time prevents lag when scaling up image during animation triggered in useEffect
      };
      loader.src = newRoom.src;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        console.log(error.response.data.message);
      } else {
        console.log(error);
      }
    } finally {
      setPending(false);
    }
  }, 300);

  const deleteRoom = (i: number) => {
    const newRooms = rooms.filter((_, j) => i !== j);
    setRooms(newRooms);
    prev.current = index.current;
    index.current = clamp(index.current, 0, newRooms.length - 1);
  }

  return (
    <div ref={ref} className="relative h-screen w-screen bg-gradient-to-r from-[#464C51] to-[#505860]">
      <ButtonPanel
        viewing={viewing}
        toggleView={() => setViewing(prev => !prev)}
        rooms={rooms}
        current={index.current}
      />
      <div>
        {props.length === 0 ? (
          <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col gap-2 font-inter">
              <h1>No rooms yet</h1>
              <AddButton pending={pending} callback={getImage} />
            </div>
          </div>
        ) : (
          <>
            {props.map(({ x, display, scale, borderRadius, filter, panelOpacity, favouriteScale, deleteScale }, i) => (
              <div key={i}>
                <animated.div
                  className='absolute w-full h-full will-change-transform z-[1]'
                  {...bind()} style={{ display, x }}
                >
                  <animated.div
                    className='touch-none bg-cover bg-no-repeat bg-center w-full h-full will-change-transform contain-paint shadow-xl shadow-gray-700'
                    style={{ scale, borderRadius, backgroundImage: `url(${rooms[i].src})`, filter }}
                  >
                    <animated.div
                      className='absolute top-2 left-2 overflow-auto cursor-pointer will-change-transform rounded-full flex justify-center items-center w-20 h-20 z-[2] -translate-x-1/2 -translate-y-1/2'
                      style={{ scale: favouriteScale, filter }}>
                      <FaHeart size={50} color="pink" className="z-[1] pointer-events-none translate-y-0.5" />
                      <div className="absolute opacity-45 hover:opacity-75 bg-black transition-all inset-0"></div>
                    </animated.div>
                    <animated.div
                      className="absolute top-2 right-2 overflow-auto cursor-pointer rounded-full flex justify-center items-center w-20 h-20 z-[5] -translate-x-1/2 -translate-y-1/2"
                      style={{ filter, scale: deleteScale }}
                      onClick={() => deleteRoom(i)}
                    >
                      <X size={50} color="white" className="z-[1] pointer-events-none translate-y-0.5" />
                      <div className="absolute opacity-45 hover:opacity-75 bg-black transition-all inset-0"></div>
                    </animated.div>
                  </animated.div>
                </animated.div>
                <animated.div
                  className="absolute w-full bottom-0 flex jusitfy-center"
                  style={{
                    display,
                    x: x.to(x => x + SCALED_MARGIN_X),
                    height: SCALED_MARGIN_Y,
                    zIndex: scale.to(scale => scale === SCALE_FACTOR ? 2 : 0),
                    opacity: panelOpacity
                  }}
                >
                  <div className='h-full box-border px-5 py-2 flex justify-between items-center font-inter' style={{ width: SCALED_WIDTH }}>
                    <div>
                      <h3 className='text-[12px] leading-[20px] font-bold tracking-[0.5px]'>{rooms[i].title}</h3>
                      <div className='flex gap-[35px]'>
                        <p className='font-medium text-[12px] leading-[20px] tracking-[0.5px]'>{rooms[i].floor}</p>
                        <p className='font-medium text-[12px] leading-[20px] tracking-[0.5px]'>{rooms[i].wall}</p>
                      </div>
                    </div>
                    <div className='flex justify-center gap-2'>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(rooms[i].src);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        text={copied ? 'COPIED' : 'SHARE'}
                        Symbol={ShareNetwork}
                      />
                      <Button
                        onClick={() => setRooms(rooms.map((room, j) => i === j ? { ...room, favourited: !room.favourited } : room))}
                        text='FAVOURITE'
                        Symbol={Heart}
                      />
                      <Button
                        onClick={() => {
                          setRooms(prev => [...prev, rooms[i]]);
                          prev.current = index.current;
                          index.current = rooms.length;
                        }}
                        text='DUPLICATE'
                        Symbol={Copy}
                      />
                    </div>
                  </div>
                </animated.div>
                {i === rooms.length - 1 && (
                  <animated.div
                    className='h-full absolute right-0 rounded-full'
                    style={{ display, x, width: SCALED_MARGIN_X, zIndex: scale.to(scale => scale === SCALE_FACTOR ? 2 : 0) }}
                  >
                    <AddButton pending={pending} callback={getImage} />
                  </animated.div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

const AddButton = ({ pending, callback }: { pending: boolean, callback: () => void }) => {
  return (
    <div className='flex justify-center items-center w-full h-full'>
      {pending ? (
        <CircleNotch
          size={55}
          color='#818C98'
          className="animate-spin"
        />
      ) : (
        <Plus
          size={55}
          color='#818C98'
          className="bg-transparent hover:bg-[#D1D4DE] cursor-pointer transition-all rounded-full opacity-35"
          onClick={callback}
        />
      )}
    </div>
  )
}

export default App
