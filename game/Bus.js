import * as THREE from "three";
import * as CANNON from "cannon-es";
import config from "bootstrap/js/src/util/config.js";
import Wheel from "~/game/Wheel.js";

export default class Bus {

    constructor({engine}) {
        this.engine = engine

        this.engine.controls.enabled = false
        this.v = new THREE.Vector3()
        this.chaseCam = new THREE.Object3D()
        this.chaseCam.position.set(0, 0, 0)
        this.chaseCamPivot = new THREE.Object3D()
        this.chaseCamPivot.position.set(0, 3, 12)
        this.chaseCam.add(this.chaseCamPivot)
        this.engine.scene.add(this.chaseCam)

        this.leftFrontAxis = new CANNON.Vec3(1, 0, 0)
        this.rightFrontAxis = new CANNON.Vec3(1, 0, 0)
        this.leftBackAxis = new CANNON.Vec3(1, 0, 0)
        this.rightBackAxis = new CANNON.Vec3(1, 0, 0)

        this.forwardVelocity = 0
        this.rightVelocity = 0

        this.geometry = new THREE.BoxGeometry(2.5, 2.5, 12)
        this.mesh = new THREE.Mesh(this.geometry, this.engine.materials.phong)
        this.mesh.position.y = 50
        this.mesh.castShadow = true
        this.engine.scene.add(this.mesh)
        this.mesh.add(this.chaseCam)

        console.log(this.geometry)

        this.shape = new CANNON.Box(
            new CANNON.Vec3(
            this.geometry.parameters.width/2,
            this.geometry.parameters.height/2,
            this.geometry.parameters.depth/2
            )
        )
        console.log(this.shape)
        this.body = new CANNON.Body({ mass: 1 })
        this.body.addShape(this.shape)
        this.body.position.x = this.mesh.position.x
        this.body.position.y = this.mesh.position.y
        this.body.position.z = this.mesh.position.z
        this.engine.world.addBody(this.body)

        this.wheelHeight = 80
        this.wheelRadius = 0.8
        this.wheelGeometry = new THREE.Vector3(this.wheelRadius, this.wheelRadius, 0.4)

        this.wheels = []
        this.wheelConfig = [
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(-this.shape.halfExtents.x, this.wheelHeight, -this.shape.halfExtents.z),
                axis: this.leftFrontAxis,
                axisPivot: new CANNON.Vec3(-this.shape.halfExtents.x, -1.5, -this.shape.halfExtents.z),
                enableMotor: false,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(this.shape.halfExtents.x, this.wheelHeight, -this.shape.halfExtents.z),
                axis: this.rightFrontAxis,
                axisPivot: new CANNON.Vec3(this.shape.halfExtents.x, -1.5, -this.shape.halfExtents.z),
                enableMotor: false,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(-this.shape.halfExtents.x, this.wheelHeight, this.shape.halfExtents.z),
                axis: this.leftBackAxis,
                axisPivot: new CANNON.Vec3(-this.shape.halfExtents.x, -1.5, this.shape.halfExtents.z),
                enableMotor: true,
                radius: this.wheelRadius,
            },
            {
                geometry: this.wheelGeometry,
                position: new THREE.Vector3(this.shape.halfExtents.x, this.wheelHeight, this.shape.halfExtents.z),
                axis: this.rightBackAxis,
                axisPivot: new CANNON.Vec3(this.shape.halfExtents.x, -1.5, this.shape.halfExtents.z),
                enableMotor: true,
                radius: this.wheelRadius,
            },
        ]

        for (const wheelConfigElement of this.wheelConfig) {
            this.wheels.push(new Wheel({engine: this.engine, config:wheelConfigElement, bus: this}))
        }

    }

    update() {
        this.engine.camera.lookAt(this.mesh.position)

        this.thrusting = false
        if (this.engine.inputs.forward) {
            if (this.forwardVelocity < 100.0) this.forwardVelocity += 0.05
            this.thrusting = true
        }
        if (this.engine.inputs.back) {
            if (this.forwardVelocity > -100.0) this.forwardVelocity -= 0.05
            this.thrusting = true
        }
        if (this.engine.inputs.left) {
            if (this.rightVelocity > -1.0) this.rightVelocity -= 0.05
        }
        if (this.engine.inputs.right) {
            if (this.rightVelocity < 1.0) this.rightVelocity += 0.05
        }
        if (this.engine.inputs.jump) {
            if (this.forwardVelocity > 0) {
                this.forwardVelocity -= 1
            }
            if (this.forwardVelocity < 0) {
                this.forwardVelocity += 1
            }
        }
        if (!this.thrusting) {
            //not going forward or backwards so gradually slow down
            if (this.forwardVelocity > 0) {
                this.forwardVelocity -= 0.05
            }
            if (this.forwardVelocity < 0) {
                this.forwardVelocity += 0.05
            }
        }

        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)

        for (const wheel of this.wheels) {
            wheel.update(this.forwardVelocity, this.rightVelocity)
        }

        // update camera
        this.engine.camera.lookAt(this.mesh.position)
        this.chaseCamPivot.getWorldPosition(this.v)
        if (this.v.y < 1) {
            this.v.y = 1
        }
        this.engine.camera.position.lerpVectors(this.engine.camera.position, this.v, 0.05)
    }

}