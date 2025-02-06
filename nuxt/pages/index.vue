<script setup lang="ts">

import Card from "~/components/index/Card.vue";
</script>

<template>
	<div id="index" class="container h-100 w-100 d-flex flex-column">

    <div class="d-flex justify-content-between pt-3">
      <div class="w-100 m-2">
        <h2>Dev eloppeur</h2>
      </div>
      <div class="w-100 d-flex flex-column justify-content-around flex-wrap">

        <div class="d-flex">
          <Card text="Frontend" route="/projets/frontend"/>
          <Card text="Backend" route="/projets/backend"/>
          <Card text="Game dev" route="/projets/gamedev"/>
          <Card text="Architecture logicielle" route="/projets/arch"/>
        </div>

        <div class="d-flex">
          <Card text="Typo3" route="/projets/typo3"/>
          <Card text="Backend" route="/projets/backend"/>
          <Card :images="[
              {
                src: '/github.png',
                link: 'https://google.com',
              },
              {
                src: '/logo.png',
                link: 'https://github.com/lepetitglacon',
              },{
                src: '/github.png',
                link: 'https://github.com/lepetitglacon',
              },
              {
                src: '/logo.png',
                link: 'https://github.com/lepetitglacon',
              },
          ]"/><Card :images="[
              {
                src: '/github.png',
                link: 'https://github.com/lepetitglacon',
              }
          ]"/>

        </div>
      </div>
    </div>

    <div class="d-flex">
      <div class="w-100 d-flex">
        <Card text="2D" route="/projets/arch"/>
        <Card text="3D" route="/projets/arch"/>
        <Card text="Conception (figma)" route="/projets/arch"/>
        <Card text="Conception" route="/projets/arch"/>
      </div>
      <h2>Info graphiste</h2>
    </div>
	</div>
</template>

<style scoped>
#index h2 {
  font-size: 10em;
  font-family: Mont;
}
#index > div {
  margin-bottom: 10vh;
}
.c-card {
  width: 150px;
  height: 150px;

  padding: 10px;
  margin: 5px;

  background-color: rgba(0, 0, 0, 0.27);
  border-radius: 20px;
}
.c-card not .images {
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.27);
  border-radius: 20px;
}
.c-card img{
  width: 32px;
}
</style>