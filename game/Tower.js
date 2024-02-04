import {BoxGeometry, CircleGeometry, Mesh, MeshBasicMaterial, SphereGeometry} from "three";

export default class Tower {

    constructor({
        position
                }) {
        this.geometry = new BoxGeometry(1, 2, 1)
        this.material = new MeshBasicMaterial( {color: 0x00ff00} );
        this.mesh = new Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)

        const geometry = new SphereGeometry( 5, 32 );
        const material = new MeshBasicMaterial( { color: 0xffff00, wireframe: true } );
        this.rangeHelper = new Mesh( geometry, material );
        this.rangeHelper.position.copy(position)
        this.rangeHelper.rotateX(Math.PI / 2)

    }

    addToScene(scene) {
        scene.add(this.mesh)
        scene.add(this.rangeHelper);
    }

    ennemyInRange(ennemy) {
        console.log(ennemy.mesh.geometry.boundingBox.intersectsSphere(this.rangeHelper.geometry.boundingSphere))
        return ennemy.mesh.geometry.boundingBox.intersectsSphere(this.rangeHelper.geometry.boundingSphere)
    }
}