<script setup>
import heightmap from './assets/heightmap.png'
import mapTexture from './assets/map.png'

import * as THREE from 'three';
import { OrbitControls } from "three/addons";
import { CSS2DRenderer, CSS2DObject } from "three/addons";

let isLoading = ref(true)
let isGameInfoShowing = ref(false)
let gameInfoTitle = ref('')
let gameInfoDescription = ref('')

onMounted(() => {
  let width = window.innerWidth
  let height = window.innerHeight

  const textureLoader = new THREE.TextureLoader()
  const labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  document.body.appendChild(labelRenderer.domElement)


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
  camera.position.y = 5
  camera.position.z = 5;
  camera.rotateX(-Math.PI / 4)

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height );
  document.body.appendChild( renderer.domElement );

  // resize
  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    labelRenderer.setSize(width, height)
  }

  const controls = new OrbitControls( camera, renderer.domElement );

  const light = new THREE.AmbientLight( 0xcccccc ); // soft white light
  scene.add( light );

  const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  cube.position.y = 1
  scene.add( cube );

  // raycast
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let intersections = [];
  function onPointerMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  window.addEventListener( 'pointermove', onPointerMove );
  window.addEventListener( 'mousedown', (e) => {
   if (e.button === 0) {
     if (intersections.length) {
       console.log("you clicked objects : ", intersections)
       gameInfoTitle.value = intersections[0].object.userData.label
       gameInfoDescription.value = intersections[0].object.userData.description
       isGameInfoShowing.value = true
     }
   }
  });

  createGround()
  function createGround() {
    let map = textureLoader.load(mapTexture)
    let disMap = textureLoader.load(heightmap)

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
    groundMesh.position.y = -mapWidth / 25
    scene.add( groundMesh );
    isLoading.value = false
  }

  const markerFloatTime = 25
  const markerFloatSpeed = 5
  const markers = []
  function createMarker(position, name, description) {
    const geometry = new THREE.ConeGeometry( 1, 5, 32 );
    const material = new THREE.MeshStandardMaterial( {
      color: 0xff2222
    });
    const cone = new THREE.Mesh(geometry, material );
    cone.position.copy(position)
    cone.rotateX(Math.PI)
    cone.userData.label = name
    cone.userData.description = description
    scene.add( cone );
    markers.push(cone)

    const p = document.createElement('p')
    p.textContent = name
    p.style.color = '#ffffff'
    const pPointLabel = new CSS2DObject(p)
    pPointLabel.position.copy(position)
    pPointLabel.position.y += 1
    scene.add(pPointLabel)

  }
  createMarker(new THREE.Vector3(-75, -12, -35), 'Station nautique', 'Faites des courses de kanoe, et affrontez le champion Clément Jaquet')
  createMarker(new THREE.Vector3(-25, -12, -45), 'Boulevard de la mort', '')
  createMarker(new THREE.Vector3(-150, -10, -150), 'Place flore', '')

  const velocity = 0.05
  const inputs = {
    forward: false,
    left: false,
    right: false,
    back: false,
    jump: false,
  }

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'z':
        inputs.forward = true
        break;
      case 'q':
        inputs.left = true
        break;
      case 's':
        inputs.back = true
        break;
      case 'd':
        inputs.right = true
        break;
    }
  })

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'z':
        inputs.forward = false
        break;
      case 'q':
        inputs.left = false
        break;
      case 's':
        inputs.back = false
        break;
      case 'd':
        inputs.right = false
        break;
    }
  })

  const clock = new THREE.Clock()
  clock.start()
  function animate() {
    requestAnimationFrame( animate );

    controls.update()
    if (inputs.forward) cube.position.z -= velocity
    if (inputs.back) cube.position.z += velocity
    if (inputs.left) cube.position.x -= velocity
    if (inputs.right) cube.position.x += velocity

    if (mouse.x !== 0 && mouse.y !== 0) {
      raycaster.setFromCamera( mouse, camera );
      let markersToPaintRed = markers;
      intersections = raycaster.intersectObjects( markers );
      for ( let i = 0; i < intersections.length; i ++ ) {
        intersections[ i ].object.material.color.set( 0xff00ff );
        markersToPaintRed = markersToPaintRed.filter((el) => el !== intersections[i].object)
      }
      for ( let i = 0; i < markersToPaintRed.length; i ++ ) {
          markersToPaintRed[i].material.color.set( 0xff0000 );
      }
    }

    for ( let i = 0; i < markers.length; i ++ ) {
      markers[i].position.y += (Math.sin(clock.getElapsedTime() * markerFloatSpeed) / markerFloatTime)
    }

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    labelRenderer.render(scene, camera)
    renderer.render( scene, camera );
  }

  animate();
})




const handleArticleClick = (e) => {

}
let articles = ref([
  {
    title: 'Blog 1',
    description: 'Small description'
  },
  {
    title: 'Blog 2',
    description: 'Small description'
  },
  {
    title: 'Blog 3',
    description: 'Small description'
  }
])

</script>

<template>
  <div id="text" v-if="!isLoading">
    <h1>Petitglaçon | 小冰块 | 小さな氷</h1>
    <h2>Blog | 博客 | ブログ</h2>

    <div>
      <ul>
        <li v-for="article in articles" :key="article.id">
          <button @click="handleArticleClick">
            <span>{{ article.title }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div>

    </div>

    <a href="https://github.com/lepetitglacon">Github</a>
  </div>

  <GameInfo v-if="isGameInfoShowing" :title="gameInfoTitle" :description="gameInfoDescription" v-model="isGameInfoShowing"></GameInfo>

  <div v-if="isLoading" class="main-loader">
    <p>LOADING</p>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
#text {
  position: absolute;
  color: white;
}
.main-loader {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;
}
</style>