import Canoe from "~/game/Canoe.js";
import {Group, Vector3} from "three";

export default class GameCanoe {

    constructor({engine}) {
        this.engine = engine

        this.runDistance = 100
        this.runDistanceMax = 1000

        this.playerCanoe = null
        this.startPosition = new Vector3()
        this.canoes = []
        this.gameMeshGroup = new Group()

        this.init()
        this.reset()
        this.bind()
    }

    init() {
        for (let i = 0; i < 4; i++) {
            const canoe = new Canoe(new Vector3(i + 5, 1, 1))
            if (i === 0) {
                this.startPosition.copy(canoe.mesh.position)
                canoe.isBot = false
                this.playerCanoe = canoe
            }
            this.canoes.push(canoe)
            this.gameMeshGroup.add(canoe.mesh)
        }
        this.engine.scene.add(this.gameMeshGroup)
    }

    reset() {
        for (const canoe of this.canoes) {
            canoe.reset()
        }
        this.runDistance += 250
    }

    update() {
        if (this.playerCanoe.mesh.position) {
            this.engine.controls.target.copy(this.playerCanoe.mesh.position)
            this.engine.controls.object.position.copy(this.playerCanoe.mesh.position)
            this.engine.controls.object.position.x += 5
            this.engine.controls.object.position.y += 5
        }

        for (const canoe of this.canoes) {
            canoe.update()

            if (canoe.mesh.position.distanceTo(this.startPosition) > this.runDistance) {
                this.reset()
                if (this.runDistance >= this.runDistanceMax) {
                    this.engine.dispatchEvent(new Event('game:stop'))
                }
            }
        }
    }

    stop() {
        this.engine.removeEventListener('update', this.updateListener)
        window.removeEventListener('keydown', this.keydownListener)
        this.engine.scene.remove(this.gameMeshGroup)
    }

    bind() {
        this.keydownListener = (e) => {
            switch (e.key) {
                case ' ':
                    this.playerCanoe.push()
                    break;
            }
        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}