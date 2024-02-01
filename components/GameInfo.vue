<script setup>
import heightmap from '../assets/heightmap.png'

defineProps([
    'title',
    'description'
])

const model = defineModel()

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
    <button>Jouer</button>
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