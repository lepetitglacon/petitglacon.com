import * as THREE from "three";
import * as CANNON from "cannon-es";
import Bus from "~/game/Bus.js";

import heightmap from "assets/heightmap.png";
import {BufferGeometry, Mesh, MeshNormalMaterial} from "three";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine

        this.points = 0
        this.bus = new Bus({engine: this.engine})

        const groundMaterial = new CANNON.Material('groundMaterial')
        groundMaterial.friction = 1
        groundMaterial.restitution = 1

        this.heightMap = new CANNON.Heightfield([[1]], {
            elementSize: 0.5 // Distance between the data points in X and Y directions
        })

        const img = document.createElement('img')
        img.src = heightmap
        img.onload = () => {
            const scale = this.engine.worldsConfig.scale
            this.heightMap.setHeightsFromImage(img, new THREE.Vector3(scale*2,scale*2,scale/4))

            this.heightfieldBody = new CANNON.Body({ mass: 0 })
            this.heightfieldBody.addShape(this.heightMap)
            this.heightfieldBody.material = groundMaterial
            this.heightfieldBody.position.x -= this.engine.worldsConfig.scale / 2
            this.heightMapYOffset = -50
            this.heightfieldBody.position.y = this.heightMapYOffset
            this.heightfieldBody.position.z += this.engine.worldsConfig.scale / 2
            this.heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
            this.engine.world.addBody(this.heightfieldBody)

            this.engine.gui.folders.worlds.cannon = {
                gui: this.engine.gui.folders.worlds.gui.addFolder('cannon')
            }
            this.engine.gui.folders.worlds.cannon.gui.add(this.heightfieldBody.position, 'x').listen()
            this.engine.gui.folders.worlds.cannon.gui.add(this.heightfieldBody.position, 'y').listen()
            this.engine.gui.folders.worlds.cannon.gui.add(this.heightfieldBody.position, 'z').listen()
            this.engine.gui.folders.worlds.cannon.gui.open()

            this.engine.hideMarkers()

            this.createPeople()
        }

        this.bind()
    }

    createPeople() {
        // console.log(this.heightfieldBody.shapes[0].getHeightAt(-1, -1))

        const transform = new CANNON.Transform({
            position: this.heightfieldBody.position,
            quaternion: this.heightfieldBody.quaternion
        })

        for (let i = 0; i < 1000; i++) {
            const x = this.engine.getRandomInt(0, this.engine.worldsConfig.scale)
            const z = this.engine.getRandomInt(0, this.engine.worldsConfig.scale)
            const y = this.heightfieldBody.shapes[0].getHeightAt(x, z)
            const localPosition = new CANNON.Vec3(x, y, z)

            const worldPosition = new CANNON.Vec3()
            worldPosition.copy(this.heightfieldBody.pointToWorldFrame(localPosition))

            // console.log('local', localPosition)
            console.log('world', worldPosition)
            worldPosition.copy(transform.pointToWorld(worldPosition))
            console.log('world 2', worldPosition)
            // console.log()

            const geo = new THREE.BoxGeometry(1)
            const cube = new THREE.Mesh(geo, this.engine.materials.phong )
            cube.position.copy(worldPosition)
            this.engine.scene.add(cube)

        }



        console.log(this.heightfieldBody.shapes[0]['_cachedPillars'])
        console.log(Object.entries(this.heightfieldBody.shapes[0]['_cachedPillars']))

    }

    update() {

        this.bus.update()

        this.points++
        if (this.points >= 50000) {
            this.engine.dispatchEvent(new Event('game:stop'))
        }
    }

    stop() {
        this.engine.removeEventListener('update', this.updateListener)
        window.removeEventListener('keydown', this.keydownListener)
        this.engine.scene.remove(this.bus)
    }

    bind() {
        this.keydownListener = (e) => {
            switch (e.key) {
                case 'z':
                    break;
            }
        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}