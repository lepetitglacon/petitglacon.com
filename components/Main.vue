<script setup>
import {appState, APP_STATES, setAppState} from "~/composables/useAppState.js";
import MainContent from "~/components/MainContent.vue";

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
  <div id="aside">
    <div>
      <h1>Petitglaçon</h1>
      <p>小さな氷</p>
    </div>

    <div class="aside-group">
      <h2>Blog</h2>
      <ul>
        <li v-for="article in articles" :key="article.id">
          <button @click="handleArticleClick">
            <span>{{ article.title }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="aside-group">
      <h2>Projects</h2>
      <div class="github-container">
        <a class="github-link" href="https://github.com/lepetitglacon">
          <img class="github-logo" src="https://cdn-icons-png.flaticon.com/512/25/25231.png">
        </a>
      </div>
    </div>

    <div class="aside-group aside-play">
      <h2>Mini games</h2>
      <button @click="handleGameClick">
        <span>Play</span>
      </button>
    </div>

  </div>

	<div id="content" ref="contentRef">
		<MainContent v-if="appState === APP_STATES.MAIN"/>
		<MainMap v-if="appState === APP_STATES.GAME"/>
	</div>

</template>

<style>
#aside {
	display: flex;
	flex-direction: column;
	background-color: sandybrown;
}
.aside-group {
  padding: 30px 10px;
}
.aside-play {
  display: flex;
  flex-direction: column;
}
.github-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.github-logo {
  width: 64px;
  height: 64px;
}
.github-link {
  text-decoration: none;
}
#content {
	width: 100%;
	height: 100%;
}
</style>