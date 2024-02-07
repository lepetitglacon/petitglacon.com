<script setup>
import GameEngine from "~/game/GameEngine.js";
import {gameEngine, setGameEngine} from "~/composables/useGameEngine.js";

let isLoading = ref(true)
let isLoadingAssets = ref(true)
let isGameInfoShowing = ref(false)
let gameInfoTitle = ref('')
let gameInfoDescription = ref('')
let gameInfoGame = ref('')

onMounted(() => {
	setTimeout(() => {
		gameEngine.value = new GameEngine({
			isLoading,
			isLoadingAssets,
			isGameInfoShowing,
			gameInfoTitle,
			gameInfoDescription,
			gameInfoGame
		})
	}, 250)

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
    <p>LOADING <span v-if="isLoadingAssets">ASSETS</span></p>
  </div>
</template>

<style scoped>
  .main-loader {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
  }
</style>