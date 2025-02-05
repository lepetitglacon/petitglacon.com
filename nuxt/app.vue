<script setup lang="ts">

import 'bootstrap/dist/css/bootstrap.min.css'
import 'assets/css/main.css'

// import { Marked } from "marked";
// import { markedHighlight } from "marked-highlight";
// import hljs from 'highlight.js'
//
// const marked = new Marked(
// 	markedHighlight({
// 		emptyLangClass: 'hljs',
// 		langPrefix: 'hljs language-',
// 		highlight(code, lang) {
// 			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
// 			return hljs.highlight(code, { language }).value;
// 		}
// 	})
// );
// console.log(marked)
//
// const apiBaseURL = 'http://localhost:3333'
// const articles = ref()
// try {
// 	articles.value = await $fetch(apiBaseURL + '/articles')
// } catch (e) {
//
// }
// const currentArticle = ref('# Click on a article')
//
// const markdown = computed(() => marked(currentArticle.value ?? ''))
//
// function setArticle(id) {
// 	currentArticle.value = articles[id].content
// }



</script>

<template>
	<Header/>

	<div id="page" class="d-flex">
		<NuxtRouteAnnouncer>
			<template #default="{message}">
				<p>{{message}}</p>
			</template>
		</NuxtRouteAnnouncer>

		<NuxtPage/>
	</div>

	<Footer/>
</template>

<style scoped>
#page {
	flex: 1;
	height: 100%;
}
</style>

