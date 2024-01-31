<script setup>
import heightmap from './assets/heightmap.png'
import mapTexture from './assets/map.png'

import * as THREE from 'three';
import { OrbitControls } from "three/addons";

let isLoading = ref(true)

onMounted(() => {
  const width = window.innerWidth
  const height = window.innerHeight

  const textureLoader = new THREE.TextureLoader()

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
  camera.position.y = 5
  camera.position.z = 5;
  camera.rotateX(-Math.PI / 4)

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height );
  document.body.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );

  const light = new THREE.AmbientLight( 0xcccccc ); // soft white light
  scene.add( light );

  const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  cube.position.y = 1
  scene.add( cube );

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

  const velocity = 0.05
  const inputs = {
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
    console.log(e)
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

  function animate() {
    requestAnimationFrame( animate );

    // controls.object.position.copy(cube.position)
    controls.update()

    if (inputs.forward) cube.position.z -= velocity
    if (inputs.back) cube.position.z += velocity
    if (inputs.left) cube.position.x -= velocity
    if (inputs.right) cube.position.x += velocity

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

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

  <div v-if="isLoading">
    LOADING
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
</style>