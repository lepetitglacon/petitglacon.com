import * as THREE from "three";
import {Vector3} from "three";
import * as CANNON from "cannon-es";
import Bus from "~/game/Bus.js";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine

        this.points = 0
        this.bus = new Bus({engine: this.engine})

        const groundMaterial = new CANNON.Material('groundMaterial')
        groundMaterial.friction = 0.25
        groundMaterial.restitution = 0.25

        //ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100)
        const groundMesh = new THREE.Mesh(groundGeometry, this.engine.materials.phong)
        groundMesh.rotateX(-Math.PI / 2)
        groundMesh.receiveShadow = true
        this.engine.scene.add(groundMesh)
        const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
        const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        groundBody.addShape(groundShape)
        groundBody.position.set(0, -1, 0)
        this.engine.world.addBody(groundBody)



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