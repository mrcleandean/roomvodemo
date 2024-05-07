import img1 from './assets/img1.png';
import img2 from './assets/img2.png';
import img3 from './assets/img3.jpeg';
import img4 from './assets/img4.jpeg';
import img5 from './assets/img5.jpeg';
import img6 from './assets/img6.jpeg';
import { v4 as uuid } from 'uuid';
import { type Room } from './App';


// Application calculations
export const VIEW_SCALE = 0.8; // The scale of the image when in view mode
export const DRAG_FACTOR = 4; // The fraction of the screen that must be dragged before an animation is triggered
export const MAX_BLUR = 15; // Max px value to blur when dragging
export const IMAGE_JUMP = 1.015; // The scale of the image when jumping to the next image
export const VIEW_RADIUS = '18px'; // The border radius of the image when in view mode (needs to be a px string)
export const ADD_MEDIA_Q = 767; // The breakpoint for the add button to shift left on the last image (small devices)
export const COPY_TIMEOUT = 1750 // Time in ms we want to displayed copied text when pressing the share button
export const SPRING_OPTIONS = { mass: 1, tension: 170, friction: 26 }; // Mimics react-springs default config

// Application styles
export const COLORS = {

}

// Demo data
export const pages: Room[] = [
    {
        id: uuid(),
        src: img1,
        title: 'Living Room',
        floor: 'Dark forest hardwood',
        wall: "Pearl white",
        favourited: false
    }, {
        id: uuid(),
        src: img2,
        title: 'Cozy Bedroom',
        floor: 'Hawk maple hardwood',
        wall: 'Deep night blue',
        favourited: false
    },
    {
        id: uuid(),
        src: img3,
        title: 'Minimalistic Living Space',
        floor: 'Light oak wood',
        wall: 'Soft ivory',
        favourited: false
    },
    {
        id: uuid(),
        src: img4,
        title: 'Rustic Café',
        floor: 'Stone tile',
        wall: 'Weathered limestone',
        favourited: false
    },
    {
        id: uuid(),
        src: img5,
        title: 'Sky-high Urban Spa',
        floor: 'Polished grey stone',
        wall: 'Neutral taupe',
        favourited: false
    },
    {
        id: uuid(),
        src: img6,
        title: 'Sunlit Modern Retreat',
        floor: 'Bleached ash wood',
        wall: 'Matte eggshell white',
        favourited: false
    },
] // The default images for demo purposes