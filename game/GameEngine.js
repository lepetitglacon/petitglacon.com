import * as THREE from "three";
import {CSS2DObject, CSS2DRenderer, OrbitControls} from "three/addons";
import mapTexture from "assets/map.png";
import heightmap from "assets/heightmap.png";
import GameCanoe from "~/game/GameCanoe.js";
import {Euler, Vector3} from "three";
import GameTowerDefense from "~/game/GameTowerDefense.js";
import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";

export default class GameEngine extends EventTarget {

    constructor({
                    isLoading,
                    isGameInfoShowing,
                    gameInfoTitle,
                    gameInfoDescription,
                    gameInfoGame
                }) {
        super();

        this.currentGame = null

        let width = window.innerWidth
        let height = window.innerHeight

        const minijeux = [
            {
                position: new THREE.Vector3(-75, -12, -35),
                title: 'Station nautique',
                description: 'Faites des courses de kanoe, et affrontez le champion Clément Jaquet',
                game: 'Canoe'
            },
            {
                position: new THREE.Vector3(-25, -12, -45),
                title: 'Boulevard de la mort',
                description: '18h sur le boulevard, tentez de survivre...'
            },
            {
                position: new THREE.Vector3(-150, -10, -150),
                title: 'Place faune et Flore',
                description: 'Les corbeaux ont bien mangés, malheureusement votre voiture se trouve en dessous de leur nid',
                game: 'TowerDefense'
            },
            {
                position: new THREE.Vector3(-64, -10, -57),
                title: 'Bussin fast',
                description: 'Les étudiants attendent le bus, en retard de 15min... Vas-y chauffeuuuur !!'
            }
        ]

        // const gui = new GUI()

        this.textureLoader = new THREE.TextureLoader()
        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(width, height)
        this.labelRenderer.domElement.style.position = 'absolute'
        this.labelRenderer.domElement.style.top = '0'
        this.labelRenderer.domElement.style.pointerEvents = 'none'
        document.body.appendChild(this.labelRenderer.domElement)

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
        document.body.appendChild( this.renderer.domElement );

        // resize
        window.addEventListener('resize', onWindowResize, false)
        function onWindowResize() {
            width = window.innerWidth
            height = window.innerHeight
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(width, height)
            this.labelRenderer.setSize(width, height)
        }

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        const light = new THREE.AmbientLight( 0xcccccc ); // soft white light
        this.scene.add( light );

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
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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

        const createGround = () => {
            let map = this.textureLoader.load(mapTexture)
            let disMap = this.textureLoader.load(heightmap)

            const mapWidth = 1000
            const geometry = new THREE.PlaneGeometry( mapWidth, mapWidth, mapWidth * 2, mapWidth * 2 );
            const material = new THREE.MeshStandardMaterial( {
                // color: 0xffff00,
                side: THREE.DoubleSide,
                wireframe: false,
                map: map,
                displacementMap: disMap,
                displacementScale: mapWidth / 10
            });
            const groundMesh = new THREE.Mesh( geometry, material );
            groundMesh.rotateX(-Math.PI / 2)
            groundMesh.rotateZ(5.5)
            groundMesh.position.y = -mapWidth / 25
            this.scene.add( groundMesh );

            isLoading.value = false
        }
        createGround()

        this.markerFloatTime = 25
        this.markerFloatSpeed = 5
        this.markers = []
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
            this.scene.add( cone );
            this.markers.push(cone)

            const p = document.createElement('p')
            p.textContent = name
            p.style.color = '#ffffff'
            const pPointLabel = new CSS2DObject(p)
            pPointLabel.position.copy(position)
            pPointLabel.position.y += 1
            this.scene.add(pPointLabel)
        }
        for (const jeu of minijeux) {
            createMarker(jeu.position, jeu.title, jeu.description, jeu.game)
        }

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

        this.clock = new THREE.Clock()
        this.clock.start()

        this.bind()
        this.animate()
    }

    animate() {
        this.requestAnimationFrameId = requestAnimationFrame( () => this.animate() );

        this.controls.update()
        if (this.inputs.forward) this.camera.position.z -= this.velocity
        if (this.inputs.back) this.camera.position.z += this.velocity
        if (this.inputs.left) this.camera.position.x -= this.velocity
        if (this.inputs.right) this.camera.position.x += this.velocity

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

        this.labelRenderer.render(this.scene, this.camera)
        this.renderer.render( this.scene, this.camera );
    }

    start() {
        this.animate()
    }
    stop() {
        cancelAnimationFrame(this.requestAnimationFrameId)
        document.body.removeChild(this.renderer.domElement)

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
        }
    }

    createCanoe() {
        this.currentGame = new GameCanoe({engine: this})
    }
    createTowerDefense() {
        this.currentGame = new GameTowerDefense({engine: this})
    }

    bind() {
        this.addEventListener('game:stop', () => {
            console.log('game stop')
            this.currentGame.stop()
            this.camera.position.copy(this.cameraInitialPosition)
            this.camera.rotation.copy(this.cameraInitialRotation)
        })
    }
}