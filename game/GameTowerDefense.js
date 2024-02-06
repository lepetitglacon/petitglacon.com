import {Group, Vector3} from "three";
import Tower from "~/game/Tower.js";
import Ennemy from "~/game/Ennemy.js";

export default class GameTowerDefense {

    constructor({engine}) {
        this.engine = engine

        this.lives = 5

        this.towers = []
        this.ennemies = []
        this.spawnPoint = new Vector3(-25, 1, -25)
        this.arrivePoint = new Vector3(0, 1, 0)
        this.gameMeshGroup = new Group()

        this.createTowerDefenseGame()
        this.bind()
    }

    createTowerDefenseGame() {
        for (let i = 0; i < 4; i++) {
            const tower = new Tower({
                position: new Vector3(-(i + 5), 1, -(i + 5))
            })
            tower.addToScene(this.gameMeshGroup)
            this.towers.push(tower)
        }
        for (let i = 0; i < this.lives; i++) {
            const ennemy = new Ennemy({
                position: this.spawnPoint.clone()
            })
            ennemy.addToScene(this.gameMeshGroup)
            this.ennemies.push(ennemy)
        }
        this.engine.scene.add(this.gameMeshGroup)
    }

    update() {
        for (const ennemy of this.ennemies) {
            ennemy.moveTo(this.arrivePoint, this.engine.clock.getDelta())

            if (ennemy.mesh.position.distanceTo(this.arrivePoint) < 1) {
                this.lives--

            }
        }

        if (this.lives <= 0) {
            this.engine.dispatchEvent(new Event('game:stop'))
        }
    }

    stop() {
        this.engine.removeEventListener('update', this.updateListener)
        window.removeEventListener('keydown', this.keydownListener)
        this.engine.scene.remove(this.gameMeshGroup)
    }

    bind() {
        this.keydownListener = (e) => {

        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}