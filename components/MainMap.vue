<script setup>
import GameEngine from "~/game/GameEngine.js";
import {gameEngine, setGameEngine} from "~/composables/useGameEngine.js";

let isLoading = ref(true)
let isGameInfoShowing = ref(false)
let gameInfoTitle = ref('')
let gameInfoDescription = ref('')
let gameInfoGame = ref('')

onMounted(() => {
  gameEngine.value = new GameEngine({
    isLoading,
    isGameInfoShowing,
    gameInfoTitle,
    gameInfoDescription,
    gameInfoGame
  })
})
</script>

<template>
  <GameInfo v-if="isGameInfoShowing"
            :title="gameInfoTitle"
            :description="gameInfoDescription"
            :game="gameInfoGame"
            v-model="isGameInfoShowing"
  />

  <div v-if="isLoading" class="main-loader">
    <p>LOADING</p>
  </div>
</template>

<style scoped>
  .main-loader {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100vw;
    height: 100vh;
  }
</style>