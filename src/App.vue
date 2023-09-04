<template>
  <div class="box">
    <p>本机SIP地址：{{ SIP_URI }}</p>
    <p>对方SIP地址：{{ CALL_SIP_URI }}</p>
    <audio ref="audioRef" controls autoplay></audio>
    <div class="button-box">
      <div class="button button-enable" @click.stop.capture="onClickSwitch">
        {{ buttonText }}
      </div>
      <div class="button" :class="active ? 'button-enable' : 'button-disable'" @click.stop.capture="onClickCall">
        呼叫
      </div>
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
  return active.value ? '断开' : '连接'
})
/**
 * 点击启停按钮
 */
const onClickSwitch = () => {
  // 切换状态
  if (active.value) {
    stopService()
  } else {
    startService()
  }
}
/**
 * 点击呼叫按钮
 */
const onClickCall = () => {
  if (!active.value) {
    return
  }
  makeCall()
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

let hostname: string = '176'
// hostname = '84'

let WS_URI = ''
let SIP_URI = ''
let PASSWORD = ''
let TURN_URI = ''
let CALL_SIP_URI = ''

if (hostname === '84') {
  WS_URI = 'ws://192.168.23.84:5066'
  SIP_URI = 'sip:1007@192.168.23.84;transport=ws'
  PASSWORD = '1234'
  TURN_URI = 'turn:192.168.23.176?transport=tcp'
  CALL_SIP_URI = 'sip:1008@192.168.23.84;transport=ws'
} else if (hostname === '176') {
  WS_URI = 'ws://192.168.23.176:5066'
  SIP_URI = 'sip:1014@192.168.23.176;transport=ws'
  PASSWORD = '1234'
  TURN_URI = 'turn:192.168.23.176?transport=tcp'
  CALL_SIP_URI = 'sip:1015@192.168.23.176;transport=ws'
}

const socket = new JsSip.WebSocketInterface(WS_URI)
const config = {
  sockets: [socket],
  outbound_proxy_set: WS_URI,
  uri: SIP_URI,
  password: PASSWORD,
  session_timers: false,
  register: true,
}
const ua = new JsSip.UA(config)
ua.on('connecting', (e) => {
  console.log('connecting', e)
})
ua.on('connected', (e) => {
  console.log('connected', e)
})
ua.on('disconnected', (e) => {
  console.log('disconnected', e)
})

ua.on('newRTCSession', (e) => {
  console.log('newRTCSession', e)
  if (e.originator == 'remote') {
    console.log('incoming')
    //回答传入会话。此方法仅适用于传入会话。
    e.session.answer({
      'mediaConstraints': { 'audio': true, 'video': true },
      'mediaStream': localStream
    });
  } else {
    console.log('outgoing')
  }
})
ua.on('newMessage', (e) => {
  console.log('newMessage', e)
})
ua.on('newOptions', (e) => {
  console.log('newOptions', e)
})

ua.on('registered', (e) => {
  console.log('registered', e)
})
ua.on('unregistered', (e) => {
  console.log('unregistered', e)
})
ua.on('registrationFailed', (e) => {
  console.log('registrationFailed', e)
})
ua.on('registrationExpiring', (e) => {
  console.log('registrationExpiring', e)
})

ua.on('sipEvent', (e) => {
  console.log('sipEvent', e)
})

const initSip = () => {
  ua.start()
}

const killSip = () => {
  ua.stop()
}

let session = null
const makeCall = () => {
  // Register callbacks to desired call events
  const eventHandlers = {
    'progress': function (e) {
      console.log('call is in progress', e);
    },
    'failed': function (e) {
      console.log('call failed with cause: ', e);
    },
    'ended': function (e) {
      console.log('call ended with cause: ', e);
    },
    'confirmed': function (e) {
      console.log('call confirmed', e);
    }
  };

  const options = {
    'eventHandlers': eventHandlers,
    'mediaConstraints': { 'audio': true, 'video': false },
    'mediaStream': localStream,
    'sessionTimersExpires': 120,
    // 'pcConfig': {
    //   'iceServers': [
    //     // { 'urls': ['stun:a.example.com', 'stun:b.example.com'] },
    //     { 'urls': TURN_URI, 'username': 'username', 'credential': 'password' }
    //   ]
    // }
  };

  session = ua.call(CALL_SIP_URI, options);
}

const audioRef = ref()
let localStream = null
</script>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  & > * {
    margin-bottom: 20px;
  }
}
.button-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 80px;
  height: 45px;
  margin-left: 1em;
  border-radius: 6px;
  font-size: 20px;
  color: #fff;
  user-select: none;
  &:first-child {
    margin-left: 0;
  }
  &.button-enable {
    background-color: #1abc9c;
    cursor: pointer;
    &:hover {
      background-color: #48c9b0;
      box-shadow: none;
    }
    &:active {
      background-color: #16a085;
      box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .5);
    }
  }
  &.button-disable {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
}
</style>
