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
button {
  background-color: #04AA6D; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}
button:hover {
  background-color: #16d58f;
}
</style>