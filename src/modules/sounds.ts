import { Weather } from "./weather";


export const soundsMap: ISoundsMap = {
    snow: "sounds/snow.mp3",
    storm: "sounds/storm.mp3",
    sun: "sounds/sun.mp3",
    rain: "sounds/rain.mp3",
    heavyRain: "sounds/heavy_rain.mp3",
    clouds: "sounds/clouds.mp3"
}

type ISoundsMap = { [key in keyof typeof Weather]: string };