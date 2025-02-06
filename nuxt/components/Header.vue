<script setup lang="ts">
const route = useRoute()
const router = useRouter()
</script>

<template>

	<nav class="navbar navbar-expand-lg">

      <div class="container-fluid">
        <div class="container d-flex">

          <RouterLink to="/" class="navbar-brand" ><img src="/logo.png"></RouterLink>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <RouterLink to="/articles" class="nav-link" active-class="active">Blog</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/projets" class="nav-link" active-class="active">Projets</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/arts" class="nav-link" active-class="active">Arts</RouterLink>
              </li>
            </ul>
            <div class="d-flex" role="search">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <RouterLink to="/arts" class="nav-link" >Contact</RouterLink>
                </li>
                <li class="nav-item">
                  <a href="https://github.com/lepetitglacon" target="_blank" class="nav-link" >
                    <img class="github-img" src="/github.png">
                  </a>
                </li>
              </ul>
          </div>

        </div>
      </div>
    </div>
	</nav>

</template>

<style scoped>
.active {
  font-family: Mont;
}

.github-img {
  width: 32px;
}
</style>