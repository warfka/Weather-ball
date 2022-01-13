import { soundsMap } from "./sounds"

// FALLING SPEED OF RAIN AND SNOW
export const rainSpeed = 4
export const snowSpeed = 1

export const sunCodes = [1000];
export const cloudsCodes = [1003, 1006, 1009, 1030, 1135, 1147];
export const rainCodes = [1063, 1180, 1183, 1198, 1240, 1249, 1252];
export const heavyRainCodes = [1186, 1189, 1192, 1195, 1201, 1243, 1246, 1264];
export const snowCodes = [1066, 1069, 1072, 1114, 1117, 1150, 1153, 1168, 1171, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261];
export const stormCodes = [1087, 1273, 1276, 1279, 1282];

// possible weather conditions
export enum Weather {
    sun,
    clouds,
    rain,
    heavyRain,
    snow,
    storm
}

// object to store weather variables
export class CurrentWeather {
    weather: Weather
    dropsToAdd: number
    flakesToAdd: number
    spawnInterval: number
    currentSpawnInterval: number
    checkInterval: number = 0
    lightningCounter: number = 10
    soundPath: string
    clouds: Entity
    house: Entity

    constructor(
        weather: Weather = Weather.sun,
        dropsToAdd: number = 0,
        flakesToAdd: number = 0,
        interval: number = 100,
        currentInterval: number = 0,
        soundPath: string = soundsMap.sun
    ) {
        this.weather = weather
        this.dropsToAdd = dropsToAdd
        this.flakesToAdd = flakesToAdd
        this.spawnInterval = interval
        this.currentSpawnInterval = interval
        this.soundPath = soundPath
    }

    getCurrentWeather(): this {
        return this;
    }
}

// system to flash lightning when stormy
export class LightningSystem implements ISystem {
    weather: CurrentWeather
    lightning: Entity
    lightningModels: GLTFShape[]

    constructor(weather, lightning, models) {
        this.weather = weather
        this.lightning = lightning
        this.lightningModels = models
    }

    update() {
        if (this.weather.weather == Weather.storm) {
            this.weather.lightningCounter -= 1
            //log("timer " + timer.count)
            if (this.weather.lightningCounter < 0) {
                let lightningNum: number = Math.floor(Math.random() * 25) + 1
                if (lightningNum >= this.lightningModels.length) {
                    if (this.lightning.hasComponent(GLTFShape)) {
                        this.lightning.removeComponent(GLTFShape)
                        this.weather.lightningCounter = Math.random() * 20
                        return
                    }
                } else {
                    this.lightning.addComponentOrReplace(this.lightningModels[lightningNum])
                    this.weather.lightningCounter = Math.random() * 10
                }
            }
        }
    }
}


// change values in weather object based on weather conditions
export function setWeather(current: CurrentWeather, newWeather: Weather) {
    if (newWeather == current.weather) {
        return
    }
    current.weather = newWeather
    switch (current.weather) {
        case Weather.storm:
            current.dropsToAdd = 100
            current.flakesToAdd = 0
            current.spawnInterval = rainSpeed / current.dropsToAdd
            current.soundPath = soundsMap.storm
            break
        case Weather.snow:
            current.dropsToAdd = 0
            current.flakesToAdd = 50
            current.spawnInterval = (snowSpeed * 10) / current.flakesToAdd
            current.soundPath = soundsMap.snow
            break
        case Weather.heavyRain:
            current.dropsToAdd = 50
            current.flakesToAdd = 0
            current.spawnInterval = rainSpeed / current.dropsToAdd
            current.soundPath = soundsMap.heavyRain
            break
        case Weather.rain:
            current.dropsToAdd = 100
            current.flakesToAdd = 0
            current.spawnInterval = rainSpeed / current.dropsToAdd //(10/(0.033*rainSpeed)*30 ) /weather.dropsToAdd
            current.soundPath = soundsMap.rain
            break
        case Weather.clouds:
            current.dropsToAdd = 0
            current.flakesToAdd = 0
            current.soundPath = soundsMap.clouds
            break
        case Weather.sun:
            current.dropsToAdd = 0
            current.flakesToAdd = 0
            current.soundPath = soundsMap.sun
            break
    }
    setClouds(current)
    setHouse(current)
}

// show no clouds / white clouds / dark clouds
export function setClouds(weather: CurrentWeather) {
    let clouds = weather.clouds
    const audioSource = clouds.addComponentOrReplace(new AudioSource(new AudioClip(weather.soundPath)))
    switch (weather.weather) {
        case Weather.storm:
            clouds.addComponentOrReplace(new GLTFShape('models/dark-cloud.gltf'))
            clouds.getComponent(Transform).position = new Vector3(8, 5, 8)
            audioSource.playing = true
            audioSource.loop = true
            break
        case Weather.snow:
            clouds.addComponentOrReplace(new GLTFShape('models/clouds.gltf'))
            clouds.getComponent(Transform).position = new Vector3(7, 4, 9)
            audioSource.playing = true
            audioSource.loop = true
            break
        case Weather.heavyRain:
            clouds.addComponentOrReplace(new GLTFShape('models/dark-cloud.gltf'))
            clouds.getComponent(Transform).position = new Vector3(8, 5, 8)
            audioSource.playing = true
            audioSource.loop = true
            break
        case Weather.rain:
            clouds.addComponentOrReplace(new GLTFShape('models/clouds.gltf'))
            clouds.getComponent(Transform).position = new Vector3(7, 4, 9)
            audioSource.playing = true
            audioSource.loop = true
            break
        case Weather.clouds:
            clouds.addComponentOrReplace(new GLTFShape('models/clouds.gltf'))
            clouds.getComponent(Transform).position = new Vector3(7, 4, 9)
            audioSource.playing = true
            audioSource.loop = true
            break
        case Weather.sun:
            clouds.removeComponent(GLTFShape)
            audioSource.playing = true
            audioSource.loop = true
            break
    }
}

export function setHouse(weather: CurrentWeather) {
    let house = weather.house
    switch (weather.weather) {
      case Weather.snow:
        house.addComponentOrReplace(new GLTFShape('models/house_snow.gltf'))
        break
      default:
        house.addComponentOrReplace(new GLTFShape('models/house_dry.gltf'))
        break
    }
  }