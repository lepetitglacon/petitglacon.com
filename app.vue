<script setup>
import 'bootstrap/dist/css/bootstrap.css';


import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";
import Main from "~/components/Main.vue";
import Header from "~/components/layout/Header.vue";
</script>

<template>

  <template>

<!--    <Header></Header>-->

    <Main v-if="appState === APP_STATES.MAIN"></Main>
    <MainMap v-if="appState === APP_STATES.GAME"/>
  </template>

</template>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>