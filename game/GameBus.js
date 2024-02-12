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
            this.heightMap.setHeightsFromImage(img, new THREE.Vector3(scale,scale,scale/4))

            const heightfieldBody = new CANNON.Body({ mass: 0 })
            heightfieldBody.addShape(this.heightMap)
            heightfieldBody.material = groundMaterial
            heightfieldBody.position.x -= this.engine.worldsConfig.scale / 2
            heightfieldBody.position.y = 2
            heightfieldBody.position.z += this.engine.worldsConfig.scale / 2
            heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
            this.engine.world.addBody(heightfieldBody)

        }


        this.bind()
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