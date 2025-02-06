<script setup lang="ts">
import {useRouter} from "#vue-router";

const props = defineProps<{
  text: string|null
  route: string|null
  images: Array<any>|null
}>()

const router = useRouter()
const handleClick = (e) => {
  router.push(props?.route ?? '/')
}

</script>

<template>

    <div @click="handleClick"
         class="c-card d-flex justify-content-center align-items-center text-center"
         :class="[

         ]"
    >

      <div v-if="images?.length" class="d-flex flex-wrap">
        <div
            v-for="image of images"
            class="p-2 image-link"
            :class="[
                images?.length > 1 ? 'w-50' : 'w-100'
            ]"
        >
          <a :href="image.link" >
            <img  :src="image?.src ?? '#'">
          </a>
        </div>
      </div>

      <div v-else>
      {{ text }}
      </div>

    </div>

</template>

<style scoped>
.c-card {
  cursor: pointer;

  transition: .2s;
}
.c-card:hover {
  box-shadow: 0 0 10px black;
  color: black;
  font-family: Mont;
}
.c-card img {
  width: 100%;
  object-fit: contain;
}
.c-card .image-link:hover {
  //box-shadow: 0 0 10px black;
}
</style>