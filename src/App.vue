<template>
  <div class="box">
    <div class="input">
      <p class="input-label">FreeSwitch 服务器 WebSocket 地址：</p>
      <input v-model="WS_URI" class="input-text" type="text">
    </div>
    <div class="input">
      <p class="input-label">本机 SIP 地址：</p>
      <input v-model="LOCAL_SIP_URI" class="input-text" type="text">
    </div>
    <div class="input">
      <p class="input-label">本机 SIP 密码：</p>
      <input v-model="PASSWORD" class="input-text" type="password">
    </div>
    <div class="input">
      <p class="input-label">TURN 服务器地址：</p>
      <input v-model="TURN_URI" class="input-text" type="text">
    </div>

    <hr>

    <div class="input">
      <p class="input-label">对方 SIP 地址：</p>
      <input v-model="REMOTE_SIP_URI" class="input-text" type="text">
    </div>

    <audio ref="audioRef" controls autoplay></audio>

    <div class="button-box">
      <div class="button button-enable" @click.stop.capture="onClickSwitch">
        {{ buttonText }}
      </div>
      <div class="button" :class="active ? 'button-enable' : 'button-disable'" @click.stop.capture="onClickCall">
        呼叫
      </div>
      <div class="button" :class="active ? 'button-enable' : 'button-disable'" @click.stop.capture="onClickSend">
        发消息
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import * as JsSip from 'jssip'
import { CallOptions } from 'jssip/lib/UA'
import { AnswerOptions } from 'jssip/lib/RTCSession'

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

// const hostname: string = '176'
const hostname: string = '84'

const WS_URI = ref('')
const LOCAL_SIP_URI = ref('')
const PASSWORD = ref('')
const TURN_URI = ref('')
const REMOTE_SIP_URI = ref('')

if (hostname === '84') {
  WS_URI.value = 'ws://192.168.23.84:5066'
  LOCAL_SIP_URI.value = 'sip:1007@192.168.23.84;transport=ws'
  PASSWORD.value = '1234'
  TURN_URI.value = 'turn:192.168.23.176:3478?transport=tcp'
  REMOTE_SIP_URI.value = 'sip:1006@192.168.23.84;transport=ws'
} else if (hostname === '176') {
  WS_URI.value = 'ws://192.168.23.176:5066'
  LOCAL_SIP_URI.value = 'sip:1014@192.168.23.176;transport=ws'
  PASSWORD.value = '1234'
  TURN_URI.value = 'turn:192.168.23.176:3478?transport=tcp'
  REMOTE_SIP_URI.value = 'sip:1015@192.168.23.176;transport=ws'
}

const socket = new JsSip.WebSocketInterface(WS_URI.value)
const config = {
  sockets: [socket],
  outbound_proxy_set: WS_URI.value,
  uri: LOCAL_SIP_URI.value,
  password: PASSWORD.value,
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

ua.on('newRTCSession', (e: any) => {
  console.log('newRTCSession', e)
  if (e.originator == 'remote') {
    console.log('incoming')
    // 回答传入会话。此方法仅适用于传入会话。
    e.session.answer(<AnswerOptions>{
      'mediaConstraints': { 'audio': true, 'video': false },
      'mediaStream': localStream
    });
  } else {
    console.log('outgoing')
  }
})
ua.on('newMessage', (e: any) => {
  console.log('newMessage', e?.request?.body, e)
})
ua.on('newOptions', (e: any) => {
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
    'progress': function (e: any) {
      console.log('call is in progress', e);
    },
    'failed': function (e: any) {
      console.log('call failed with cause: ', e);
    },
    'ended': function (e: any) {
      console.log('call ended with cause: ', e);
    },
    'confirmed': function (e: any) {
      console.log('call confirmed', e);
    }
  };

  const options: CallOptions = {
    'eventHandlers': eventHandlers,
    'mediaConstraints': { 'audio': true, 'video': false },
    'mediaStream': localStream ?? undefined,
    'sessionTimersExpires': 120,
    'pcConfig': {
      'iceServers': [
        // { 'urls': ['stun:a.example.com', 'stun:b.example.com'] },
        { 'urls': TURN_URI.value, 'username': 'username', 'credential': 'PASSWORD.value' }
      ]
    }
  };

  session = ua.call(REMOTE_SIP_URI.value, options);
  console.log('session', session)
}

const onClickSend = () => {
  const text = 'HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello';
  const eventHandlers = {
    'succeeded': function (e: any) {
      console.log('message succeeded', e)
    },
    'failed': function (e: any) {
      console.log('message succeeded', e)
    }
  };

  const options = {
    'eventHandlers': eventHandlers
  };

  ua.sendMessage(REMOTE_SIP_URI.value, text, options);
}

const audioRef = ref()
let localStream: MediaStream | null = null
</script>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  width: 100%;
  max-width: 450px;
  padding: 10px;
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
hr {
  display: block;
  width: 100%;
}
.input {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 400px;
}
.input-label {
  align-self: flex-start;
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;
}
.input-text {
  display: block;
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #1abc9c;
  font-size: 18px;
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
    display: none;
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
}
</style>
