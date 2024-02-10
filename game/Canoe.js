import * as THREE from "three";

export default class Canoe {

    constructor(position) {

        this.velocity = new THREE.Vector3()
        this.maxVelocity = .5

        this.geometry = new THREE.BoxGeometry( .5, .2, 5 );
        this.material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.copy(position)
        this.initPosition = position.clone()

        this.isBot = true

        this.lastPush = Date.now()
        this.nextPush = 2000
        this.initNextPush = 2000

    }

    update() {
        if (this.velocity.z > 0) {
            this.velocity.z -= 0.005
        }
        if (this.velocity.z < 0) {
            this.velocity.z = 0
        }
        if (this.velocity.z >= 5) {
            this.velocity.z = 5
        }

        if (this.canPush()) {
            this.push()
        }

        this.mesh.position.add(this.velocity)
    }

    push() {
        this.velocity.z += 0.25
        this.lastPush = Date.now()
        this.nextPush = this.getRandomInt(500, 1000)
    }

    reset() {
        this.mesh.position.copy(this.initPosition)
        this.nextPush = this.initNextPush
    }

    canPush() {
        if (this.isBot) {
            return this.lastPush + this.nextPush < Date.now()
        }
        return false
    }

    addToScene(scene) {
        scene.add(this.mesh)
    }

    getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

}