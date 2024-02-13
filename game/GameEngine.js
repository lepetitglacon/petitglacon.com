import * as THREE from "three";
import {CSS2DObject, CSS2DRenderer, OrbitControls} from "three/addons";
import mapTexture from "assets/map.png";
import heightmap from "assets/heightmap.png";
import GameCanoe from "~/game/GameCanoe.js";
import {Euler, Group, MeshPhongMaterial, Vector3} from "three";
import GameTowerDefense from "~/game/GameTowerDefense.js";
import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";
import GameBus from "~/game/GameBus.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {GUI} from "dat.gui";

export default class GameEngine extends EventTarget {

    constructor({
                    isLoading,
                    isLoadingAssets,
                    isGameInfoShowing,
                    gameInfoTitle,
                    gameInfoDescription,
                    gameInfoGame
                }) {
        super();

        this.isLoadingAssets = isLoadingAssets

        this.gui = {
            gui: new GUI,
            folders: {}
        }
        this.gui.folders.worlds = {
            gui: this.gui.gui.addFolder('worlds')
        }

        this.currentGame = null

        const minijeux = [
            {
                position: new THREE.Vector3(40, -10, 5),
                title: 'Station nautique',
                description: 'Faites des courses de kanoe, et affrontez le champion Clément Jaquet',
                game: 'Canoe'
            },
            {
                position: new THREE.Vector3(0, -2, -175),
                title: 'Boulevard de la mort',
                description: '18h sur le boulevard, tentez de survivre...'
            },
            {
                position: new THREE.Vector3(50, -10, -52),
                title: 'Place faune et Flore',
                description: 'Les corbeaux ont bien mangés, malheureusement votre voiture se trouve en dessous de leur nid',
                game: 'TowerDefense'
            },
            {
                position: new THREE.Vector3(-64, -10, -57),
                title: 'Bussin fast',
                description: 'Les étudiants attendent le bus, en retard de 15min... Chauffeuuuur si t\'es champion !!',
                game: 'Bus'
            },
            {
                position: new THREE.Vector3(5, 0, 25),
                title: 'Animalz',
                description: 'Aidez nous à retrouver les animaux'
            },
            {
                position: new THREE.Vector3(0, -10, -25),
                title: 'Un jeudi soir normal',
                description: 'It\'s thursday then, it\'s Wednesday, Thrusdray whaaat ?'
            },
            {
                position: new THREE.Vector3(-90, 10, 70),
                title: 'Leap of faith',
                description: 'Celui la est plus difficile en vrai'
            }
        ]

        // const gui = new GUI()

        this.ROOT_ELEMENT = document.getElementById('content')

        let width = this.ROOT_ELEMENT.clientWidth ?? 500
        let height = this.ROOT_ELEMENT.clientHeight ?? 500

        this.textureLoader = new THREE.TextureLoader()
        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(width, height)
        this.labelRenderer.domElement.style.position = 'absolute'
        this.labelRenderer.domElement.style.top = '0'
        this.labelRenderer.domElement.style.pointerEvents = 'none'
        this.ROOT_ELEMENT.appendChild(this.labelRenderer.domElement)

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        this.camera.position.y = 5
        this.camera.position.z = 5;
        this.cameraInitialPosition = new Vector3()
        this.cameraInitialPosition.copy(this.camera.position)
        this.cameraInitialRotation = new Euler()
        this.cameraInitialRotation.copy(this.camera.rotation)
        this.camera.rotateX(-Math.PI / 4)

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( width, height );
        this.ROOT_ELEMENT.appendChild( this.renderer.domElement );

        // resize
        window.addEventListener('resize', onWindowResize, false)
        function onWindowResize() {
            width = this.ROOT_ELEMENT.clientWidth
            height = this.ROOT_ELEMENT.clientHeight
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(width, height)
            this.labelRenderer.setSize(width, height)
        }

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        // CANNON
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.8, 0)
        this.cannonDebugger = new CannonDebugger(this.scene, this.world, {})

        const light = new THREE.AmbientLight( 0xcccccc ); // soft white light
        this.scene.add( light );

        this.materials = {
            phong: new MeshPhongMaterial()
        }

        const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.position.y = 1
        this.scene.add( this.cube );

        // raycast
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersections = [];
        const onPointerMove = ( event ) => {
            // https://stackoverflow.com/questions/67032197/three-js-raycasting-when-its-not-full-screen
            const rect = this.renderer.domElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.mouse.x = ( x / this.ROOT_ELEMENT.clientWidth ) *  2 - 1;
            this.mouse.y = ( y / this.ROOT_ELEMENT.clientHeight) * - 2 + 1
        }
        window.addEventListener( 'pointermove', onPointerMove );
        window.addEventListener( 'mousedown', (e) => {
            if (e.button === 0) {
                if (this.intersections.length) {
                    console.log("you clicked objects : ", this.intersections)
                    gameInfoTitle.value = this.intersections[0].object.userData.label
                    gameInfoDescription.value = this.intersections[0].object.userData.description
                    gameInfoGame.value = this.intersections[0].object.userData.game
                    isGameInfoShowing.value = true
                }
            }
        });

        this.worldsConfig = {}
        this.worldsConfig.scale = 1000

        // const createGround = () => {
        //     let map = this.textureLoader.load(mapTexture)
        //     let disMap = this.textureLoader.load(heightmap)
        //
        //     const mapWidth = this.worldsConfig.scale
        //     const geometry = new THREE.PlaneGeometry( mapWidth, mapWidth, mapWidth, mapWidth);
        //     const material = new THREE.MeshStandardMaterial( {
        //         color: 0xffffff,
        //         // side: THREE.DoubleSide,
        //         wireframe: true,
        //         // map: map,
        //         displacementMap: disMap,
        //         displacementScale: mapWidth/4
        //     });
        //     const groundMesh = new THREE.Mesh( geometry, material );
        //     groundMesh.rotateX(-Math.PI / 2)
        //     // groundMesh.rotateZ(5.5)
        //     groundMesh.position.x = 0
        //     groundMesh.position.y = 0
        //     groundMesh.position.z = 5
        //     this.scene.add( groundMesh );
        //
            isLoading.value = false
            isLoadingAssets = false
        // }
        // createGround()

        this.markerFloatTime = 25
        this.markerFloatSpeed = 5
        this.markers = []
        this.markersGroup = new Group()
        this.markersLabelsGroup = new Group()
        const createMarker = (position, name, description, game) => {
            const geometry = new THREE.ConeGeometry( 1, 5, 32 );
            const material = new THREE.MeshStandardMaterial( {
                color: 0xff2222
            });
            const cone = new THREE.Mesh(geometry, material );
            cone.position.copy(position)
            cone.rotateX(Math.PI)
            cone.userData.label = name
            cone.userData.description = description
            cone.userData.game = game
            this.markersGroup.add(cone)
            this.markers.push(cone)

            const p = document.createElement('p')
            p.textContent = name
            p.classList.add('marker-label')
            p.style.padding = '5px'
            p.style.backgroundColor = '#00dc82'
            p.style.color = '#ffffff'
            const pPointLabel = new CSS2DObject(p)
            pPointLabel.position.copy(position)
            pPointLabel.position.y += 5
            this.markersLabelsGroup.add(pPointLabel)
        }
        for (const jeu of minijeux) {
            createMarker(jeu.position, jeu.title, jeu.description, jeu.game)
        }
        this.scene.add( this.markersGroup );
        this.scene.add( this.markersLabelsGroup );

        this.velocity = 0.05
        this.inputs = {
            forward: false,
            left: false,
            right: false,
            back: false,
            jump: false,
        }

        window.addEventListener('keydown', (e) => {
            console.log(e)
            switch (e.key) {
                case 'z':
                    this.inputs.forward = true
                    break;
                case 'q':
                    this.inputs.left = true
                    break;
                case 's':
                    this.inputs.back = true
                    break;
                case 'd':
                    this.inputs.right = true
                    break;
                case 'Escape':
                    this.stop()
                    break;
            }
        })

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'z':
                    this.inputs.forward = false
                    break;
                case 'q':
                    this.inputs.left = false
                    break;
                case 's':
                    this.inputs.back = false
                    break;
                case 'd':
                    this.inputs.right = false
                    break;
            }
        })

        window.addEventListener('mousedown', (e) => {
            switch (e.button) {
                case 0:
                    this.inputs.clicked = true
                    break;
            }
        })
        window.addEventListener('mouseup', (e) => {
            switch (e.button) {
                case 0:
                    this.inputs.clicked = false
                    break;
            }
        })

        this.clock = new THREE.Clock()
        this.clock.start()

        this.bind()
        this.animate()
    }

    animate() {
        this.requestAnimationFrameId = requestAnimationFrame( () => this.animate() );

        this.controls.update()
        // if (this.inputs.forward) this.camera.position.z -= this.velocity
        // if (this.inputs.back) this.camera.position.z += this.velocity
        // if (this.inputs.left) this.camera.position.x -= this.velocity
        // if (this.inputs.right) this.camera.position.x += this.velocity

        if (this.mouse.x !== 0 && this.mouse.y !== 0) {
            this.raycaster.setFromCamera( this.mouse, this.camera );
            let markersToPaintRed = this.markers;
            this.intersections = this.raycaster.intersectObjects( this.markers );
            for ( let i = 0; i < this.intersections.length; i ++ ) {
                this.intersections[ i ].object.material.color.set( 0xff00ff );
                markersToPaintRed = markersToPaintRed.filter((el) => el !== this.intersections[i].object)
            }
            for ( let i = 0; i < markersToPaintRed.length; i ++ ) {
                markersToPaintRed[i].material.color.set( 0xff0000 );
            }
        }

        for ( let i = 0; i < this.markers.length; i ++ ) {
            this.markers[i].position.y += (Math.sin(this.clock.getElapsedTime() * this.markerFloatSpeed) / this.markerFloatTime)
        }

        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;

        this.dispatchEvent(new Event('update'))

        this.world.fixedStep()
        this.cannonDebugger.update()
        this.labelRenderer.render(this.scene, this.camera)
        this.renderer.render( this.scene, this.camera );
    }

    hideMarkers() {
        this.scene.remove(this.markersGroup)
        for (const label of this.markersLabelsGroup.children) {
            label.visible = false
        }
        // this.scene.remove(this.markersLabelsGroup)
    }

    start() {
        this.animate()
    }
    stop() {
        cancelAnimationFrame(this.requestAnimationFrameId)
        this.ROOT_ELEMENT.removeChild(this.renderer.domElement)
        this.ROOT_ELEMENT.removeChild(this.labelRenderer.domElement)

        setAppState(APP_STATES.MAIN)
    }

    setGame(game) {
        console.log("game set to : ", game)
        switch (game) {
            case 'Canoe': {
                this.createCanoe()
                break;
            }
            case 'TowerDefense': {
                this.createTowerDefense()
                break;
            }
            case 'Bus': {
                this.createBus()
                break;
            }
        }
    }

    getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

    createCanoe() {
        this.currentGame = new GameCanoe({engine: this})
    }
    createTowerDefense() {
        this.currentGame = new GameTowerDefense({engine: this})
    }
    createBus() {
        this.currentGame = new GameBus({engine: this})
    }

    bind() {
        this.addEventListener('game:stop', () => {
            console.log('game stop')
            this.currentGame.stop()
            this.camera.position.copy(this.cameraInitialPosition)
            this.camera.rotation.copy(this.cameraInitialRotation)
            this.controls.target.copy(new Vector3())
        })
    }
}