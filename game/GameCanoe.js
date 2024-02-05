import Canoe from "~/game/Canoe.js";
import {Vector3} from "three";

export default class GameCanoe {

    constructor({gameEngine}) {
        this.gameEngine = gameEngine

        this.playerCanoe = null
        this.canoes = []

        this.bind()
    }

    createCanoe() {
        for (let i = 0; i < 4; i++) {
            const canoe = new Canoe(new Vector3(i + 5, 1, 1))
            if (i === 0) {
                canoe.isBot = false
                this.playerCanoe = canoe
            }
            this.canoes.push(canoe)
            canoe.addToScene(this.gameEngine.scene)
        }
    }

    update() {
        for (const canoe of this.canoes) {
            canoe.update()
        }
    }

    bind() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                    this.playerCanoe.push()
                    break;
            }
        })
        this.gameEngine.addEventListener('update', () => this.update())
    }

}