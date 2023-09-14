<template>
  <div class="box">
    <router-link to="/terminal">WebRTC Demo 终端</router-link>
    <router-link to="/admin">人工客服后台</router-link>

    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  width: 100%;
  max-width: 300px;
  // padding: 10px;
  height: 100%;
  margin: 0 auto;
  & > * {
    flex: none;
    margin-top: 20px;
    &:first-child {
      margin-top: 0;
    }
  }
}
</style>
