<template>
  <div class="button-box">
    <el-button type="primary" @click="onClickButton('terminal')">
      客户终端
    </el-button>

    <!--<el-button type="primary" @click="onClickButton('admin')">-->
    <!--  人工客服后台-->
    <!--</el-button>-->
  </div>

  <div class="content-box">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import router from '@/router'

const onClickButton = (path: string = 'terminal') => {
  router.push({
    path: '/' + path
  })
}
</script>

<style scoped lang="scss">
.button-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}
.content-box {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
