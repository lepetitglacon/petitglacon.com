<script setup lang="ts">
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js'

const marked = new Marked(
	markedHighlight({
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);
console.log(marked)

const apiBaseURL = 'http://localhost:3333'
const articles = await $fetch(apiBaseURL + '/articles')
const currentArticle = ref('# Click on a article')

const markdown = computed(() => marked(currentArticle.value ?? ''))

function setArticle(id) {
	currentArticle.value = articles[id].content
}

</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

	  <button v-for="(article, key) in articles" :key="key" @click="setArticle(key)">
	    {{ article.title }}
	  </button>

	  <div v-html="markdown"></div>

  </div>
</template>


