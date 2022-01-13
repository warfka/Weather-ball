import {
    cloudsCodes,
    CurrentWeather, heavyRainCodes,
    LightningSystem,
    rainCodes,
    setWeather, snowCodes, stormCodes,
    sunCodes,
    Weather
} from "./modules/weather";
import { RotateSystem } from "./modules/flakeRotation";
import { FallSystem, SpawnSystem } from "./modules/precipitation";

///////// SCENE FIXED ENTITIES

// WEATHER CONTROLLER
const weatherObject = new CurrentWeather()


// ADD HOUSE
const house = new Entity()
house.addComponent(new Transform({
    position: new Vector3(8, 0, 8),
    scale: new Vector3(0.6, 0.6, 0.6)
}))

house.addComponent(new GLTFShape('models/house_dry.gltf'))
engine.addEntity(house)

weatherObject.house = house

// ADD CLOUDS
const clouds = new Entity()
clouds.addComponent(new Transform({
    position: new Vector3(8, 5, 8),
    scale: new Vector3(1, 1, 1)
}))
engine.addEntity(clouds)

weatherObject.clouds = clouds

// DEFINE LIGHTNING COMPONENTS AS AN ARRAY OF GLTF COMPONENTS
const lightningModels: GLTFShape[] = []
for (let i = 1; i < 6; i++) {
    const modelPath = 'models/ln' + i + '.gltf'
    const lnModel = new GLTFShape(modelPath)
    lightningModels.push(lnModel)
}

// ADD LIGHTNING ENTITY
const lightning = new Entity()
lightning.addComponent(new Transform())
lightning.getComponent(Transform).position.set(8, 5, 8)
lightning.getComponent(Transform).scale.setAll(2)
engine.addEntity(lightning)


// ADD SYSTEMS
engine.addSystem(new FallSystem(weatherObject))
engine.addSystem(new RotateSystem())
engine.addSystem(new SpawnSystem(weatherObject))
engine.addSystem(new LightningSystem(weatherObject, lightning, lightningModels))

// ADD TEMPERATURE
const countdownText = new Entity();
engine.addEntity(countdownText);

countdownText.addComponent(
    new Transform({
        position: new Vector3(2, 3, 2),
        rotation: Quaternion.Euler(20, 0, 0)
    })
);

// Use a `TextShape` and set the default value

countdownText.addComponent(new TextShape(""));
// And style the text a bit
countdownText.getComponent(TextShape).color = Color3.Blue();
countdownText.getComponent(TextShape).fontSize = 5;

// SWITCH BUTTONS
const menu = new Entity()
engine.addEntity(menu)

let start = 2.2;
const diff = 0.4;
let prevMenuButton: Entity = null;
const buttonMaterial = new Material()
buttonMaterial.albedoColor = Color3.FromInts(240, 230, 140)
buttonMaterial.metallic = 0.9
buttonMaterial.roughness = 0.1;

['London', 'Moscow', 'Paris', 'NY', 'Tokio', 'Sydney'].forEach(city => {
    const txtEntity = new Entity()
    const myText = new TextShape(city);
    myText.color = Color3.Black();
    txtEntity.addComponent(new Transform({
        position: new Vector3(2, start, 1.99),
        scale: new Vector3(0.2, 0.25, 0.01),
    }))
    txtEntity.addComponent(myText);
    txtEntity.setParent(menu);

    const btnEntity = new Entity()
    btnEntity.addComponent(new BoxShape());
    btnEntity.addComponent(new Transform({
        position: new Vector3(2, start, 2),
        scale: new Vector3(1, 0.25, 0.01),
    }))

    btnEntity.addComponent(buttonMaterial)

    btnEntity.addComponent(new OnClick(e => {
        log(`${city} clicked`);
        if (prevMenuButton) {
            prevMenuButton.addComponentOrReplace(buttonMaterial);
        }
        const myMaterial = new Material();
        myMaterial.albedoColor = Color3.Yellow()
        btnEntity.addComponentOrReplace(myMaterial);

        prevMenuButton = btnEntity;
        executeTask(async () => {
            try {
                log(`Getting new weather from city ${city}`);
                let response = await fetch(`http://api.weatherapi.com/v1/current.json?key=ef35cf3bc2d44718894111332212711&q=${city}&aqi=no`);
                let json = await response.json();
                const code = json.current.condition.code;
                log(`${code} code from weather api`);
                const currentWeather = weatherObject.getCurrentWeather();
                countdownText.getComponent(TextShape).value = `${json.current.temp_c} °C`;

                if (sunCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.sun);
                } else if (cloudsCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.clouds);
                } else if (rainCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.rain);
                } else if (heavyRainCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.heavyRain);
                } else if (snowCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.snow);
                } else if (stormCodes.indexOf(Number(code)) !== -1) {
                    setWeather(currentWeather, Weather.storm);
                } else {
                    setWeather(currentWeather, Weather.sun);
                }


            } catch {
                log('failed to reach URL', error)
            }
        })
    }))
    btnEntity.setParent(menu);

    start -= diff;

    engine.addEntity(btnEntity)
    engine.addEntity(txtEntity)
})

let start2 = 2.2

Object.keys(Weather).map(w => {
    if (!isNaN(Number(w))) {
        return;
    }
    const txtEntity = new Entity()
    const myText = new TextShape(w);
    myText.color = Color3.Black();
    txtEntity.addComponent(new Transform({
        position: new Vector3(4, start2, 1.99),
        scale: new Vector3(0.2, 0.25, 0.01),
    }))
    txtEntity.addComponent(myText);
    txtEntity.setParent(menu);

    const btnEntity = new Entity()
    btnEntity.addComponent(new BoxShape());
    btnEntity.addComponent(new Transform({
        position: new Vector3(4, start2, 2),
        scale: new Vector3(1, 0.25, 0.01),
    }))

    btnEntity.addComponent(new OnClick(e => {
        log(`${w} clicked`);
        const currentWeather = weatherObject.getCurrentWeather();
        setWeather(currentWeather, Weather[w]);
    }))
    btnEntity.setParent(menu);

    start2 -= diff;

    engine.addEntity(btnEntity)
    engine.addEntity(txtEntity)
})

const glassSphere = new Entity();
engine.addEntity(glassSphere);
glassSphere.addComponent(new GLTFShape("models/glassSphere.glb"));
glassSphere.addComponent(
    new Transform({
        position: new Vector3(8, -4, 8),
        scale: new Vector3(0.004, 0.004, 0.004)
    })
);
