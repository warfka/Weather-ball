import { CurrentWeather, rainSpeed, snowSpeed, Weather } from "./weather";
import { SpinVel } from "./flakeRotation";


// types of precipitation
export enum PrecipType {
    drop,
    flake
}

// flag an entity as drop or flake
@Component('isPrecip')
export class IsPrecip {
    type: PrecipType

    constructor(type: PrecipType = PrecipType.drop) {
        this.type = type
    }
}

// component group to hold all drops and flakes
export const drops = engine.getComponentGroup(IsPrecip)

// create drops and flakes evenly spread out in time as they fall
export class SpawnSystem implements ISystem {
    weather: CurrentWeather

    constructor(weather) {
        this.weather = weather
    }

    update(dt: number) {
        if (this.weather.dropsToAdd > 1) {
            this.weather.currentSpawnInterval += dt
            if (this.weather.currentSpawnInterval >= this.weather.spawnInterval) {
                spawnRain()
                this.weather.dropsToAdd -= 1
                log('spawning rain')
                this.weather.currentSpawnInterval = 0
            }
        }
        if (this.weather.flakesToAdd > 1) {
            this.weather.currentSpawnInterval += dt
            if (this.weather.currentSpawnInterval >= this.weather.spawnInterval) {
                spawnSnow()
                this.weather.flakesToAdd -= 1
                log('spawning snow')
                this.weather.currentSpawnInterval = 0
            }
        }
    }
}


// drop and reposition for both raindrops and snowflakes
export class FallSystem implements ISystem {
    weather: CurrentWeather;

    constructor(weather: CurrentWeather) {
        this.weather = weather;
    }

    update(dt: number) {
        for (let drop of drops.entities) {
            let position = drop.getComponent(Transform).position
            let type = drop.getComponent(IsPrecip).type

            const currWeather = this.weather.weather;
            if (currWeather === Weather.sun || currWeather === Weather.clouds) {
                position.y = position.y - dt * rainSpeed
                if (position.y < 0) {
                    position.y = -1;
                    engine.removeEntity(drop);
                }
            }
            if (currWeather === Weather.snow) {
                position.y = position.y - dt * rainSpeed;
                if (position.y < 0) {
                    position.x = Math.random() * 6 + 5;
                    position.y = 5;
                    position.z = Math.random() * 6 + 5;
                    if (drop.getComponent(IsPrecip).type === PrecipType.drop) {
                        engine.removeEntity(drop);
                    }
                }

            }
            if (currWeather === Weather.heavyRain || currWeather === Weather.rain || currWeather === Weather.storm) {
                position.y = position.y - dt * rainSpeed
                if (position.y < 0) {
                    position.x = Math.random() * 6 + 5;
                    position.y = 5;
                    position.z = Math.random() * 6 + 5;
                    if (drop.getComponent(IsPrecip).type === PrecipType.flake) {
                        engine.removeEntity(drop);
                    }
                }
            }
        }
    }
}


// CREATE NEW RAINDROPS

// Define a reusable shape
let dropShape = new PlaneShape()

const billboard = new Billboard(false, true, false)

// define reusable drop material
const dropTexture = new Texture('materials/drop.png', { hasAlpha: true, samplingMode: 1 })
const dropMaterial = new BasicMaterial()
dropMaterial.texture = dropTexture

// create drop entity
function spawnRain() {
    const drop = new Entity()
    drop.addComponent(new IsPrecip(PrecipType.drop))
    let pos = new Vector3(Math.random() * 6 + 5, 5, Math.random() * 6 + 5)
    drop.addComponent(new Transform({
        position: pos,
        scale: new Vector3(0.1, 0.1, 0.1)
    }))
    // add predefined shape
    drop.addComponent(dropShape)

    // Make drop rotate to always face you in the Y axis
    drop.addComponent(billboard)

    // Apply drop texture
    drop.addComponent(dropMaterial)

    engine.addEntity(drop)
}

// CREATE NEW SNOWFLAKES

// define flake materials as an array oF BasicMaterial components

const flakeMaterial: BasicMaterial[] = []
for (let i = 1; i < 5; i++) {
    let texture = new Texture('materials/flake' + i + '.png', { hasAlpha: true, samplingMode: 1 })
    let material = new BasicMaterial()
    material.texture = texture
    flakeMaterial.push(material)
}

// Define a reusable shape
let flakeShape = new PlaneShape()

// create flake entity
function spawnSnow() {
    const flake = new Entity()
    flake.addComponent(new IsPrecip(PrecipType.flake))
    let pos = new Vector3(Math.random() * 6 + 5, 5, Math.random() * 6 + 5)
    flake.addComponent(new Transform({
        position: pos,
        rotation: Quaternion.Euler(Math.random() * 180, Math.random() * 180, Math.random() * 180),
        scale: new Vector3(0.2, 0.2, 0.2)
    }))

    const flakeSpin = new Vector3(
        Math.random() * 30,
        Math.random() * 30,
        Math.random() * 30
    )

    const flakeSpeed = Math.random() * 2

    flake.addComponent(new SpinVel(flakeSpin, flakeSpeed))

    flake.addComponent(flakeShape)

    let materialIndex = Math.floor(Math.random() * 4)
    flake.addComponent(flakeMaterial[materialIndex])

    engine.addEntity(flake)
}