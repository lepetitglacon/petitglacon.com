import * as THREE from "three";
import * as CANNON from "cannon-es";
import Bus from "~/game/Bus.js";

import heightmapImage from "assets/heightmap.png";
import {BufferGeometry, Mesh, MeshNormalMaterial} from "three";
import Client from "~/game/Client.js";

export default class GameBus {

    constructor({engine}) {
        this.engine = engine

        this.points = 0
        this.clients = []
        this.passengers = []
        this.numberOfCLients = 100
        this.bus = new Bus({engine: this.engine})

        const groundMaterial = new CANNON.Material('groundMaterial')
        groundMaterial.friction = .5
        groundMaterial.restitution = .5

        this.heightMap = new CANNON.Heightfield([[1]], {
            elementSize: 1 // Distance between the data points in X and Y directions
        })

        const img = document.createElement('img')
        img.src = this.engine.heightmapImage
        img.onload = () => {
            const scale = this.engine.worldsConfig.scale

            this.heightMap.setHeightsFromImage(img, new THREE.Vector3(this.engine.worldsConfig.scale, this.engine.worldsConfig.scale, 50))

            this.heightfieldBody = new CANNON.Body({ mass: 0 })
            this.heightfieldBody.material = groundMaterial
            this.heightfieldBody.addShape(this.heightMap)
            this.engine.world.addBody(this.heightfieldBody)

            this.engine.heightMapOffset = new THREE.Vector3(
            -this.engine.worldsConfig.scale / 2,
            0,
            this.engine.worldsConfig.scale / 2,
            )

            this.heightfieldBody.position.copy(this.heightfieldBody.position.vadd(this.engine.heightMapOffset))
            this.heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

            this.engine.hideMarkers()
            this.createClients()
        }

        this.bind()
    }

    createClients() {
        for (let i = 0; i < this.numberOfCLients; i++) {
            const x = this.engine.getRandomInt(0, this.engine.worldsConfig.scale-1)
            const z = this.engine.getRandomInt(0, this.engine.worldsConfig.scale-1)
            const y = this.heightfieldBody.shapes[0].getHeightAt(x, z)
            const localPosition = new CANNON.Vec3(x, y, -z)
            localPosition.copy(localPosition.vadd(this.engine.heightMapOffset))

            // const transform = new CANNON.Transform({
            //     position: this.heightfieldBody.position,
            //     quaternion: this.heightfieldBody.quaternion
            // })
            // const worldPosition = new CANNON.Vec3()
            // worldPosition.copy(this.heightfieldBody.pointToWorldFrame(localPosition))
            // worldPosition.copy(transform.pointToWorld(worldPosition))

            const client = new Client({engine: this.engine})
            client.setPosition(localPosition)
            this.clients.push(client)
        }

    }

    update() {

        this.bus.update()

        for (const client of this.clients) {
            client.update()
        }

        let i = 0
        for (const client of this.passengers) {
            client.updateInBus(i)

            // const absolutePosition = new THREE.Vector3(i % 2, this.body.position.y + 2, i / 2)
            // client.position = this.bus.body.pointToWorldFrame(absolutePosition)

            i++
        }

        this.points++
        if (this.points >= 50000) {
            this.engine.dispatchEvent(new Event('game:stop'))
        }
    }

    stop() {
        this.engine.removeEventListener('update', this.updateListener)
        window.removeEventListener('keydown', this.keydownListener)
        this.engine.scene.remove(this.bus)
    }

    bind() {
        this.bus.body.addEventListener('collide', (e) => {
            const map = this.clients.map((el) => el.body)
            if (map.includes(e.body)) {
                console.log('TOUCH2 UN CLIENT WWOOWOW')
                const client = this.clients.filter((el) => el.body === e.body)[0]
                client.isAttachedToBus = true
                this.passengers.push(client)
                this.clients = this.clients.filter((el) => el.body !== e.body)
            }
        })
        this.keydownListener = (e) => {
            switch (e.key) {
                case 'z':
                    break;
            }
        }
        window.addEventListener('keydown', this.keydownListener)
        this.updateListener = () => this.update()
        this.engine.addEventListener('update', this.updateListener)
    }

}