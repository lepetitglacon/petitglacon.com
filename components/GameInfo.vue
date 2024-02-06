<script setup>
import heightmap from '../assets/heightmap.png'
import {gameEngine} from "~/composables/useGameEngine.js";

const props = defineProps([
    'title',
    'description',
    'game'
])

const model = defineModel()

function handlePlay(e) {
  model.value = false
  gameEngine.value.setGame(props.game)
}
function handleClose(e) {
  model.value = false
}
</script>

<template>
<div class="game-info-container">
  <div class="game-info">
    <p>{{title}}</p>
    <p>{{description}}</p>
    <div class="img-container">
      <img class="img" :src="heightmap">
      <img class="img" :src="heightmap">
      <img class="img" :src="heightmap">
    </div>
    <button v-if="game" @click="handlePlay">Jouer</button>
    <button @click="handleClose" class="close-button">Fermer</button>
  </div>
</div>
</template>

<style scoped>
.game-info-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;
  z-index: 50;

  width: 100vw;
  height: 100vh;
}
.game-info {
  position: relative;

  background-color: white;
  pointer-events: all;

  z-index: 5;
  padding: 50px;
}
.close-button {
  position: absolute;
  right: 0;
  top: 0;

  background-color: #9d0d0d;
}
.close-button:hover {
  background-color: #c41414;
}
.img-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.img {
  width: 200px;
  padding: 10px;
}
</style>