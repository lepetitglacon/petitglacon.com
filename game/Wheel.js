import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Wheel {
    
    constructor({engine, config, bus}) {
        this.engine = engine

        this.isDrivingWheel = config.enableMotor

        this.wheelMaterial = new CANNON.Material('wheelMaterial')
        this.wheelMaterial.friction = 0.25
        this.wheelMaterial.restitution = 0.25

        this.geometry = new THREE.CylinderGeometry(
            config.geometry.x,
            config.geometry.y,
            config.geometry.z,
        )
        this.geometry.rotateZ(Math.PI / 2)
        
        this.mesh = new THREE.Mesh(this.geometry, this.engine.materials.phong)
        this.mesh.position.copy(config.position)
        this.mesh.castShadow = true
        this.engine.scene.add(this.mesh)

        this.shape = new CANNON.Sphere(config.radius)

        this.body = new CANNON.Body({ mass: 1, material: this.wheelMaterial })
        this.body.addShape(this.shape)
        this.body.position.copy(this.mesh.position)
        this.engine.world.addBody(this.body)


        this.constraint = new CANNON.HingeConstraint(bus.body, this.body, {
            pivotA: config.axisPivot.clone(),
            axisA: config.axis.clone(),
            maxForce: 0.99,
        })
        if (this.isDrivingWheel) {
            this.constraint.enableMotor()
        }
        this.engine.world.addConstraint(this.constraint)
    }

    update(forwardVelocity, rightVelocity) {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)

        if (this.isDrivingWheel) {
            this.constraint.setMotorSpeed(forwardVelocity)
        } else {
            this.constraint.axisA.z = rightVelocity
        }
    }
    
}