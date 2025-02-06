<script setup lang="ts">

const projects = ref([
  {
    id: 1,
    title: 'Z3D',
    description: 'Un jeu de zombie (COD) dans le navigateur',
    stack: {
      frontend: ['React'],
      backend: ['Node', 'Express', 'socket.io']
    },
    articleUrl: '/projets/z3d',
    liveUrl: 'https://z3d.petitglacon.com'
  },
  {
    id: 1,
    title: 'Courtisans',
    description: 'Tiré du jeu de société',
    stack: {
      frontend: ['Vue'],
      backend: ['Node', 'Express', 'socket.io']
    },
    articleUrl: '/projets/courtisans',
    liveUrl: 'https://courtisans.petitglacon.com'
  }
])

</script>

<template>

  <div class="container">

    <div class="project d-flex flex-column my-3" v-for="project of projects">
      <div class="d-flex">
        <h2>{{ project.title }}</h2>
      </div>
      <p>{{ project.description }}</p>
      <div class="d-flex">
        <p class="badge bg-info mx-2" v-for="tool of project.stack.frontend">{{ tool }}</p>
        <p class="badge bg-white text-black mx-2" v-for="tool of project.stack.backend">{{ tool }}</p>
      </div>
      <div class="d-flex py-2">
        <a class="btn btn-primary mx-2" v-if="project.liveUrl" :href="project.liveUrl" target="_blank">Voir le projet live</a>
        <RouterLink class="btn btn-secondary" v-if="project.articleUrl" :to="project.articleUrl">Voir dans "projets"</RouterLink>
      </div>
    </div>

  </div>

</template>

<style scoped>
.project {
  background-color: #eee;
  border-radius: 10px;
  padding: 50px;
}
.project h2 {
  font-family: Mont;
}
</style>