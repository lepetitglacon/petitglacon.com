<script setup>
import heightmap from './assets/heightmap.png'
import mapTexture from './assets/map.png'

import * as THREE from 'three';
import { OrbitControls } from "three/addons";
import Tower from "~/game/Tower.js";
import {Clock, Vector3} from "three";
import Ennemy from "~/game/Ennemy.js";

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
      case 't':
        createTowerDefenseGame()
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

  const towers = []
  const ennemies = []
  const spawnPoint = new Vector3(-25, 1, -25)
  const arrivePoint = new Vector3(0, 1, 0)

  const createTowerDefenseGame = () => {
    for (let i = 0; i < 4; i++) {
      const tower = new Tower({
        position: new Vector3(-(i + 5), 1, -(i + 5))
      })
      tower.addToScene(scene)
      towers.push(tower)
    }
    for (let i = 0; i < 4; i++) {
      const ennemy = new Ennemy({
        position: spawnPoint
      })
      ennemy.addToScene(scene)
      ennemies.push(ennemy)
    }
  }

  const clock = new Clock()
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

    for (const tower of towers) {
      for (const ennemy of ennemies) {
        if (tower.ennemyInRange(ennemy)) {
          ennemy.mesh.material.color = 0xEEEEEE
        }
      }
    }

    for (const ennemy of ennemies) {
      ennemy.moveTo(arrivePoint, clock.getDelta())
    }

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