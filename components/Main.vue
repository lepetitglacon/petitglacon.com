<script setup>
import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";
let articles = ref([
  {
    id: 1,
    title: 'Blog 1',
    description: 'Small description'
  },
  {
    id: 2,
    title: 'Blog 2',
    description: 'Small description'
  },
  {
    id: 3,
    title: 'Blog 3',
    description: 'Small description'
  }
])

const handleArticleClick = (e) => {

}
const handleGameClick = (e) => {
  setAppState(APP_STATES.GAME)
}
</script>

<template>
  <div id="text">
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
      <button @click="handleGameClick">
        <span>Play</span>
      </button>
    </div>

    <a href="https://github.com/lepetitglacon">Github</a>
  </div>
</template>

<style scoped>

</style>