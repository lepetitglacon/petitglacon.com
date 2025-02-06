<script setup>

</script>

<template>
  <Header/>

  <div id="page" class="container">
    <p>Oups, la page n'a pas été trouvée : 404 Not Found</p>
    <p>Retourner à l'<RouterLink to="/">accueil</RouterLink></p>
  </div>

  <Footer/>
</template>

<style scoped>
#page {
  flex: 1;
  height: 100%;
}
</style>