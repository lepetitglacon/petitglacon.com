import * as THREE from "three";
import * as CANNON from "cannon-es";
import Wheel from "~/game/Wheel.js";
import {MeshNormalMaterial} from "three";

export default class Bus {

    constructor({engine}) {
        this.engine = engine

        this.engine.controls.enabled = true
        this.v = new THREE.Vector3()
        this.chaseCam = new THREE.Object3D()
        this.chaseCam.position.set(0, 0, 0)
        this.chaseCamPivot = new THREE.Object3D()
        this.chaseCamPivot.position.set(0, 8, 12)
        this.chaseCam.add(this.chaseCamPivot)
        this.engine.scene.add(this.chaseCam)

        this.leftFrontAxis = new CANNON.Vec3(1, 0, 0)
        this.rightFrontAxis = new CANNON.Vec3(1, 0, 0)
        this.leftBackAxis = new CANNON.Vec3(1, 0, 0)
        this.rightBackAxis = new CANNON.Vec3(1, 0, 0)

        this.forwardVelocity = 0
        this.rightVelocity = 0

        this.engine.materials.bus = new MeshNormalMaterial({
            color: 0xFF7777,
            wireframe: false
        })

        this.geometry = new THREE.BoxGeometry(2.5, 3, 12)
        this.mesh = new THREE.Mesh(this.geometry, this.engine.materials.bus)
        this.mesh.position.y = 20
        this.mesh.castShadow = true
        this.engine.scene.add(this.mesh)
        this.mesh.add(this.chaseCam)

        console.log(this.geometry)

        this.shape = new CANNON.Box(
            new CANNON.Vec3(
                2.5/2,
                1.5/2,
                12/2
            )
        )
        this.body = new CANNON.Body({ mass: 1 })
        this.body.addShape(this.shape)
        this.body.position.x = this.mesh.position.x
        this.body.position.y = this.mesh.position.y
        this.body.position.z = this.mesh.position.z
        this.engine.world.addBody(this.body)

        this.wheelHeight = this.mesh.position.y
        this.wheelRadius = 0.5
        this.wheelGeometry = new THREE.Vector3(this.wheelRadius, this.wheelRadius, 0.4)
        this.constraintHeight = -2

        this.wheels = []
        this.wheelConfig = [
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(
                    -this.shape.halfExtents.x/2,
                    this.wheelHeight,
                    -this.shape.halfExtents.z/2
                ),
                axis: this.leftFrontAxis,
                axisPivot: new CANNON.Vec3(
                    -this.shape.halfExtents.x/2,
                    this.constraintHeight,
                    -this.shape.halfExtents.z/2
                ),
                enableMotor: false,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(this.shape.halfExtents.x/2, this.wheelHeight, -this.shape.halfExtents.z/2),
                axis: this.rightFrontAxis,
                axisPivot: new CANNON.Vec3(this.shape.halfExtents.x/2, this.constraintHeight, -this.shape.halfExtents.z/2),
                enableMotor: false,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(-this.shape.halfExtents.x/2, this.wheelHeight, this.shape.halfExtents.z/2),
                axis: this.leftBackAxis,
                axisPivot: new CANNON.Vec3(-this.shape.halfExtents.x/2, this.constraintHeight, this.shape.halfExtents.z/2),
                enableMotor: true,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(this.shape.halfExtents.x/2, this.wheelHeight, this.shape.halfExtents.z/2),
                axis: this.rightBackAxis,
                axisPivot: new CANNON.Vec3(this.shape.halfExtents.x/2, this.constraintHeight, this.shape.halfExtents.z/2),
                enableMotor: true,
                radius: this.wheelRadius,
            },
        ]

        for (const wheelConfigElement of this.wheelConfig) {
            this.wheels.push(new Wheel({engine: this.engine, config:wheelConfigElement, bus: this}))
        }
        this.turningSpeed = 0.01
        this.acceleration = 0.05
        this.accelerationMax = 100.0
    }



    update() {

        this.thrusting = false
        if (this.engine.inputs.forward) {
            if (this.forwardVelocity < this.accelerationMax) this.forwardVelocity += this.acceleration
            this.thrusting = true
        }
        if (this.engine.inputs.back) {
            if (this.forwardVelocity > -this.accelerationMax) this.forwardVelocity -= this.acceleration
            this.thrusting = true
        }
        if (this.engine.inputs.left) {
            if (this.rightVelocity > -.8) this.rightVelocity -= this.turningSpeed
        } else {
            if (this.rightVelocity < 0) this.rightVelocity += this.turningSpeed
        }
        if (this.engine.inputs.right) {
            if (this.rightVelocity < .8) this.rightVelocity += this.turningSpeed
        } else {
            if (this.rightVelocity > 0) this.rightVelocity -= this.turningSpeed
        }

        //not going forward or backwards so gradually slow down
        if (!this.thrusting) {
            if (this.forwardVelocity > 0) {
                this.forwardVelocity -= 0.05
            }
            if (this.forwardVelocity < 0) {
                this.forwardVelocity += 0.05
            }
        }

        this.mesh.position.copy(this.body.position)
        this.mesh.position.y -= this.shape.halfExtents.y
        this.mesh.quaternion.copy(this.body.quaternion)

        for (const wheel of this.wheels) {
            wheel.update(this.forwardVelocity, this.rightVelocity)
        }

        // update camera
        // this.engine.camera.lookAt(this.mesh.position)
        // this.chaseCamPivot.getWorldPosition(this.v)
        // if (this.v.y < 1) {
        //     this.v.y = 1
        // }
        // this.engine.camera.position.lerpVectors(this.engine.camera.position, this.v, 0.05)
    }

}