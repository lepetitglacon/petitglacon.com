<script setup>
import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";

</script>

<template>

  <div>
    <Main v-if="appState === APP_STATES.MAIN"/>
    <MainMap v-if="appState === APP_STATES.GAME"/>
  </div>

</template>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>