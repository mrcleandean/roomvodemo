import useMeasure from "react-use-measure";
import { useDrag } from "react-use-gesture";
import { useSprings, animated } from "@react-spring/web";
import clamp from 'lodash.clamp';
import { useEffect, useRef, useState } from "react";
import ButtonPanel from './components/ButtonPanel';
import Button from './components/Button';
import { Copy, Heart, ShareNetwork, X } from '@phosphor-icons/react';
import axios, { AxiosError } from "axios";
import { useDebouncedCallback } from "use-debounce";
import { BLUR_FACTOR, SCALED_R, SCALE_FACTOR, SNAP_DIVISOR } from "./templates/constants";
import { FaHeart } from "react-icons/fa";
import AddButton from "./components/AddButton";
import Descriptors from "./components/Descriptors";
import { pages } from "./templates/pages";

export type Room = {
  src: string;
  title: string;
  floor: string;
  wall: string;
  favourited: boolean;
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
  const noEnvCircle = useRef(3); // this would be removed, it's only for the demo
  const SCALED_WIDTH = width * SCALE_FACTOR;
  const SCALED_MARGIN_X = (width - SCALED_WIDTH) * 0.5;
  const SCALED_MARGIN_Y = (height * (1 - SCALE_FACTOR)) * 0.5;
  const LAP_FACTOR = 1.5;

  const setToInitial = (i: number) => {
    const iOffset = i - index.current;
    return {
      x: window.innerWidth * iOffset,
      scale: 1,
      borderRadius: 0,
      display: Math.abs(iOffset) > 2 ? 'none' : 'block',
      filter: 0,
      panelOpacity: iOffset === 0 ? 1 : 0,
      favouriteScale: rooms[i].favourited ? SCALE_FACTOR : 0,
      deleteScale: 0,
    }
  } // anim func

  const zoomedDefault = (i: number, prev?: number) => {
    const iOffset = i - (prev ?? index.current)
    return {
      x: iOffset * (window.innerWidth - SCALED_MARGIN_X * LAP_FACTOR),
      scale: SCALE_FACTOR,
      borderRadius: SCALED_R,
      display: Math.abs(iOffset) > 2 ? 'none' : 'block',
      filter: 0,
      panelOpacity: iOffset === 0 ? 1 : 0,
      favouriteScale: rooms[i].favourited ? SCALE_FACTOR : 0,
      deleteScale: SCALE_FACTOR
    }
  } // anim func

  const animateSlide = (i: number) => {
    const iOffset = i - index.current;
    return {
      from: {
        ...zoomedDefault(i, prev.current),
        scale: iOffset === 0 ? 0 : SCALE_FACTOR,
        panelOpacity: 0,
        display: i >= prev.current - 1 ? 'block' : 'none', // important for sliding animation
      },
      to: async (next: any) => {
        await next({
          x: iOffset * (window.innerWidth - SCALED_MARGIN_X * LAP_FACTOR),
          scale: (iOffset !== 0 || prev.current >= index.current) ? SCALE_FACTOR : 0,
          borderRadius: SCALED_R,
          display: i >= prev.current - 1 ? 'block' : 'none',
          filter: prev.current >= index.current ? 0 : BLUR_FACTOR,
          panelOpacity: 0,
          favouriteScale: rooms[i].favourited ? SCALE_FACTOR : 0,
          deleteScale: SCALE_FACTOR,
        })
        await next({
          scale: SCALE_FACTOR,
          panelOpacity: iOffset === 0 ? 1 : 0,
          filter: 0,
          display: Math.abs(iOffset) > 2 ? 'none' : 'block',
        })
      }
    }
  } // anim func

  const updateFavourites = (i: number) => {
    return {
      favouriteScale: viewing && rooms[i].favourited ? SCALE_FACTOR : 0
    }
  } // anim func

  const animateDrag = (i: number, active: boolean, mx: number, distance: number) => {
    const iOffset = i - index.current;
    const dragOffset = active ? mx : 0;
    const xOffset = (width - SCALED_MARGIN_X * LAP_FACTOR);
    const x = iOffset * xOffset + dragOffset;
    if (Math.abs(iOffset) > 2) return ({ display: 'none', x }); // important: we preserve x here to prevent image ripping if animateSlide() is large

    const scale = active ? SCALE_FACTOR - distance / width / SNAP_DIVISOR : SCALE_FACTOR;
    const blur = active ? BLUR_FACTOR - (distance / width) * SNAP_DIVISOR : 0;

    const panelOpacity = active && iOffset === 0 ? 1 - (distance / width) * SNAP_DIVISOR : iOffset === 0 ? 1 : 0;
    return {
      x,
      scale,
      filter: blur,
      display: 'block',
      panelOpacity
    }
  } // anim func

  const deleteRoom = (i: number) => {
    const newRooms = rooms.filter((_, j) => i !== j);
    setRooms(newRooms);
    prev.current = clamp(index.current, 0, newRooms.length - 1); // prevents out of bounds
    index.current = clamp(i, 0, newRooms.length - 1);
  } // triggers dependency in useSprings, animateSlide runs

  const addRoom = (room: Room) => {
    setRooms(prev => [...prev, room]);
    prev.current = index.current;
    index.current = rooms.length;
  } // triggers dependency in useSprings, animateSlide runs

  const bind = useDrag(({ active, movement: [mx], direction: [xDir], distance, cancel }) => {
    if (!viewing) return;
    if (active && distance > SCALED_WIDTH / SNAP_DIVISOR) {
      index.current = clamp(index.current + (xDir > 0 ? -1 : 1), 0, rooms.length - 1)
      cancel();
    }
    api.start(i => animateDrag(i, active, mx, distance));
  })

  const getImage = useDebouncedCallback(async () => {
    if (pending) return;
    const loader = new Image();
    try {
      setPending(true);
      const { data: img } = await axios.get(`https://api.unsplash.com/photos/random/?client_id=${import.meta.env.VITE_UPSPLASH_ACCESS_KEY}`) as { data: Img };
      const newRoom: Room = {
        src: img.urls.full, title: img.user.username || 'No Username',
        floor: img.location.country || 'No Location',
        wall: img.user.name || 'No Name',
        favourited: false
      }

      loader.onload = () => {
        addRoom(newRoom);
      };
      loader.src = newRoom.src;
    } catch (error) {
      loader.onload = () => {
        addRoom(pages[noEnvCircle.current % pages.length]);
      }
      loader.src = pages[noEnvCircle.current++ % pages.length].src; // filler image if no .env is supplied
      if (error instanceof AxiosError && error.response?.data?.message) {
        console.log(error.response.data.message);
      } else {
        console.log(error);
      }
    } finally {
      setPending(false);
    }
  }, 300);

  useEffect(() => {
    if (viewing) api.start(i => ({ ...zoomedDefault(i), ...updateFavourites(i) }));
    else api.start(i => ({ ...setToInitial(i), ...updateFavourites(i) }));
  }, [viewing]);

  useEffect(() => {
    if (rooms.length === 0) {
      setViewing(false);
    }
  }, [rooms.length]);

  useEffect(() => {
    if (viewing && rooms.length === 0) { // setToInitial runs in useSprings here
      setViewing(false);
      return;
    }
    api.start(i => updateFavourites(i));
  }, [rooms]);

  const [props, api] = useSprings(
    rooms.length,
    i => viewing && rooms.length !== 0 ? {
      ...animateSlide(i) // animateSlide only animates if index changes from addRoom or deleteRoom functions
    } : viewing ? zoomedDefault(i) : setToInitial(i),
    [width, rooms.length] // we need rooms here, without it only last element animates on room.length change
  )

  return (
    <div ref={ref} className="relative h-screen w-screen bg-gradient-to-r from-[#464C51] to-[#505860]">
      <div>
        {props.length === 0 ? (
          <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col gap-2 font-inter">
              <h1>No views yet</h1>
              <AddButton pending={pending} callback={getImage} />
            </div>
          </div>
        ) : (
          <>
            <ButtonPanel
              viewing={viewing}
              toggleView={() => setViewing(prev => !prev)}
              rooms={rooms}
              current={index.current}
            />
            {props.map(({ x, display, scale, borderRadius, filter, panelOpacity, favouriteScale, deleteScale }, i) => (
              <div key={i}>
                <animated.div
                  className='absolute w-full h-full will-change-transform z-[1]'
                  {...bind()} style={{ display, x }}
                >
                  <animated.div
                    className='touch-none bg-cover bg-no-repeat bg-center w-full h-full will-change-transform contain-paint shadow-xl shadow-gray-700'
                    style={{ scale, borderRadius, backgroundImage: `url(${rooms[i].src})`, filter: filter.to(filter => `blur(${filter}px)`) }}
                  >
                    <animated.div
                      className='absolute top-2 left-2 overflow-auto cursor-pointer will-change-transform rounded-full flex justify-center items-center w-20 h-20 z-[2] -translate-x-1/2 -translate-y-1/2'
                      style={{ scale: favouriteScale, filter: filter.to(filter => `blur(${filter}px)`) }}>
                      <FaHeart size={50} color="pink" className="z-[1] pointer-events-none translate-y-0.5" />
                      <div className="absolute opacity-45 hover:opacity-75 bg-black transition-all inset-0"></div>
                    </animated.div>
                    <animated.div
                      className="absolute top-2 right-2 overflow-auto cursor-pointer rounded-full flex justify-center items-center w-20 h-20 z-[5] -translate-x-1/2 -translate-y-1/2"
                      style={{ filter: filter.to(filter => `blur(${filter}px)`), scale: deleteScale }}
                      onClick={() => deleteRoom(i)}
                    >
                      <X size={50} color="white" className="z-[1] pointer-events-none translate-y-0.5" />
                      <div className="absolute opacity-45 hover:opacity-75 bg-black transition-all inset-0" />
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
                  <div className='h-full box-border px-5 py-2 flex flex-col md:flex-row justify-center gap-0.5 md:gap-0 md:justify-between items-center font-inter' style={{ width: SCALED_WIDTH }}>
                    <Descriptors title={rooms[i].title} floor={rooms[i].floor} wall={rooms[i].wall} />
                    <div className='flex justify-center gap-2'>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(rooms[i].src);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500); // TODO: add unmount cleanup
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
                        onClick={() => addRoom(rooms[i])}
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

export default App
