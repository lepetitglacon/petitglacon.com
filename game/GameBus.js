import { FirstPersonControls } from "three/addons";
import * as THREE from "three";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine
        // this.controls = new FirstPersonControls(this.engine.camera, this.engine.renderer.domElement)

        this.points = 0

        const geometry = new THREE.BoxGeometry( 2, 2, 5 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        this.bus = new THREE.Mesh( geometry, material );
        this.engine.scene.add( this.bus );

        this.cameraOffset = new THREE.Vector3(0, 5, 5)

        this.bind()
    }

    update() {
        this.engine.controls.target.copy(this.bus.position)
        this.engine.controls.object.position.copy(this.bus.position.clone().add(this.cameraOffset))

        this.points++
        console.log(this.points)

        if (this.points >= 5000) {
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

        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}