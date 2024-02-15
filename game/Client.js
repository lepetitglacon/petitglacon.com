import * as THREE from "three";
import * as CANNON from "cannon-es";
import Wheel from "~/game/Wheel.js";
import {MeshNormalMaterial} from "three";

export default class Client {

    constructor({engine}) {
        this.engine = engine

        this.shapeConfig = new THREE.Vector3(.5, 1.8, .5)

        this.geometry = new THREE.BoxGeometry(this.shapeConfig.x, this.shapeConfig.y, this.shapeConfig.z)
        this.mesh = new THREE.Mesh(this.geometry, this.engine.materials.phong)

        this.shape = new CANNON.Box(new CANNON.Vec3(this.shapeConfig.x/2, this.shapeConfig.y/2, this.shapeConfig.z/2))
        this.body = new CANNON.Body({
            mass: 1,
            type: CANNON.Body.KINEMATIC,
            shape: this.shape
        })

        this.engine.scene.add(this.mesh)
        this.engine.world.addBody(this.body)
    }

    setPosition(position) {
        position.y += this.shapeConfig.y/2
        this.body.position.copy(position)
        this.update()
    }

    update() {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)
    }

}