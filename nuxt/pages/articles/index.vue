<script setup lang="ts">

const articles = ref([])

</script>

<template>

  <div class="container">
    <h2>Blog</h2>

    <div>

      <p v-if="!articles.length">Aucun article pour le moment</p>

      <template v-else>
        <div v-for="article of articles">
          <h2>{{ article.title }}</h2>
        </div>
      </template>

    </div>

  </div>

</template>

<style scoped>

</style>