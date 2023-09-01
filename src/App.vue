<template>
  <div class="box">
    <div class="button" @click.stop.capture="onClickButton">
      {{ buttonText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import * as JsSip from 'jssip'

// 按钮状态
const active = ref(false)
// 按钮文本
const buttonText = computed(() => {
  return active.value ? '停止' : '启动'
})
/**
 * 点击按钮
 */
const onClickButton = () => {
  // 切换状态
  if (active.value) {
    stopService()
  } else {
    startService()
  }
}

/**
 * 启动服务
 */
const startService = () => {
  console.log('%c 启动服务', 'padding: 0 10em; background-color: green; color: #fff')
  active.value = true
  initSip()
}
/**
 * 停止服务
 */
const stopService = () => {
  console.log('%c 停止服务', 'padding: 0 10em; background-color: grey; color: #fff')
  active.value = false
  killSip()
}
// 关闭或刷新页面前停止服务
window.addEventListener('beforeunload', () => {
  console.log('beforeunload')
  stopService()
})

const socket = new JsSip.WebSocketInterface('ws://192.168.23.84:5066')
const config = {
  sockets: [socket],
  uri: 'sip:1005@192.168.23.84',
  password: '1234',
}
const ua = new JsSip.UA(config)
ua.on('connecting', () => {
  console.log('connecting')
})
ua.on('connected', () => {
  console.log('connected')
})
ua.on('disconnected', () => {
  console.log('disconnected')
})

const initSip = () => {
  ua.start()

  setTimeout(() => {
    stopService()
  }, 3000)
}

const killSip = () => {
  ua.stop()
}
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 160px;
  height: 90px;
  background-color: #1abc9c;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  box-shadow: none;
}
.button:hover {
  background-color: #48c9b0;
  box-shadow: none;
}
.button:active {
  background-color: #16a085;
  box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .5);
}
</style>
