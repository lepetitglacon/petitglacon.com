import { FirstPersonControls } from "three/addons";
import * as THREE from "three";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine
        // this.controls = new FirstPersonControls(this.engine.camera, this.engine.renderer.domElement)

        const geometry = new THREE.BoxGeometry( 2, 2, 5 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        this.bus = new THREE.Mesh( geometry, material );
        this.engine.scene.add( this.bus );

        this.cameraOffset = new THREE.Vector3(0, 5, 5)
    }

    update() {
        this.engine.controls.target.copy(this.bus.position)
        this.engine.controls.object.position.copy(this.bus.position.clone().add(this.cameraOffset))
        // this.controls.update()
    }

}