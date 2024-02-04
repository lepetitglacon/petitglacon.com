import {BoxGeometry, Mesh, MeshBasicMaterial} from "three";

export default class Ennemy {

    constructor({
        position
    }) {
        this.velocity = .05

        this.geometry = new BoxGeometry(0.5, 0.5, 0.5)
        this.material = new MeshBasicMaterial( {color: 0xff0000} );
        this.mesh = new Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.mesh.geometry.computeBoundingBox()
    }

    addToScene(scene) {
        scene.add(this.mesh)
    }

    moveTo(position, delta) {
        const direction = position.sub(this.mesh.position).normalize()
        this.mesh.position.x += direction.x * this.velocity
        this.mesh.position.y += direction.y * this.velocity
        this.mesh.position.z += direction.z * this.velocity
    }

}