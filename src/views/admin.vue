<template>
  <div>人工坐席</div>
  <div class="button" style="width: 0"></div>
  <div class="button button-enable" @click="onClickManual">转人工</div>
</template>

<script setup lang="ts">
const onClickManual = () => {
  console.log('转人工')
  // fetch()
}

import { computed, ref } from 'vue'
import * as JsSip from 'jssip'
import {
  CallOptions,
  IncomingMessageEvent,
  IncomingOptionsEvent,
  OutgoingMessageEvent,
  OutgoingOptionsEvent,
  RTCSessionEvent,
  UA
} from 'jssip/lib/UA'
import {
  AnswerOptions,
  IncomingAckEvent,
  IncomingEvent,
  OutgoingAckEvent,
  OutgoingEvent,
  RTCSession,
  SDPEvent
} from 'jssip/lib/RTCSession'
import VConsole from 'vconsole';

// 或者使用配置参数来初始化，详情见文档
// const vConsole = new VConsole({ theme: 'dark' });
const vConsole = new VConsole();
// 接下来即可照常使用 `console` 等方法
console.log('Hello world', vConsole);
// 结束调试后，可移除掉
// vConsole.destroy();

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
const hostname: string = '113'

const WS_URI = ref('')
const LOCAL_SIP_URI = ref('')
const PASSWORD = ref('')
const TURN_URI = ref('')
const REMOTE_SIP_URI = ref('')

if (hostname === '113') {
  WS_URI.value = 'wss://192.168.23.113:7443'
  LOCAL_SIP_URI.value = 'sip:1007@192.168.23.113;transport=ws'
  PASSWORD.value = '1234'
  TURN_URI.value = 'turn:192.168.23.176:3478?transport=tcp'
  REMOTE_SIP_URI.value = 'sip:1008@192.168.23.113;transport=ws'
} else if (hostname === '176') {
  WS_URI.value = 'ws://192.168.23.176:5066'
  LOCAL_SIP_URI.value = 'sip:1014@192.168.23.176;transport=ws'
  PASSWORD.value = '1234'
  TURN_URI.value = 'turn:192.168.23.176:3478?transport=tcp'
  REMOTE_SIP_URI.value = 'sip:1015@192.168.23.176;transport=ws'
}

let ua: UA | null = null

let outgoingSession: RTCSession | null = null
let incomingSession: RTCSession | null = null
let currentSession: RTCSession | null = null

const audioRef = ref()
// let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null

// 成功的回调函数
const success = (stream) => {
  console.log("已点击允许,开启成功");
}
// 异常的回调函数
const error = (error) => {
  console.log("访问用户媒体设备失败：", error.name, error.message);
}
const getUserMedia = (constrains) => {
  if (navigator.mediaDevices.getUserMedia) {
    // 最新标准API
    navigator.mediaDevices.getUserMedia(constrains).then(stream => {
      success(stream);
    }).catch(err => {
      error(err);
    });
  } else if (navigator.webkitGetUserMedia) {
    // webkit内核浏览器
    navigator.webkitGetUserMedia(constrains).then(stream => {
      success(stream);
    }).catch(err => {
      error(err);
    });
  } else if (navigator.mozGetUserMedia) {
    // Firefox浏览器
    navigator.mozGetUserMedia(constrains).then(stream => {
      success(stream);
    }).catch(err => {
      error(err);
    });
  } else if (navigator.getUserMedia) {
    // 旧版API
    navigator.getUserMedia(constrains).then(stream => {
      success(stream);
    }).catch(err => {
      error(err);
    });
  }
}

// @ts-ignore
if (navigator?.mediaDevices?.getUserMedia || navigator?.getUserMedia || navigator?.webkitGetUserMedia || navigator?.mozGetUserMedia) {
  getUserMedia({ video: true, audio: true }); // 调用用户媒体设备，访问摄像头、录音
} else {
  alert('你的浏览器不支持访问用户媒体设备')
  console.error("你的浏览器不支持访问用户媒体设备");
}
const initSip = () => {
  // 如果当前页面支持麦克风权限，比如https页面，或者用户手动开启
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: any) => {
    // 用户允许麦克风
    // @ts-ignore
    console.log('有麦克风权限', stream)
    // 测试结束，关闭麦克风
    try {
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop()
      })
    } catch (e) {
      console.error('测试麦克风后关闭失败', e)
    }
  }).catch((error: any) => {
    // 用户拒绝麦克风
    console.error('没有麦克风权限', error)
    alert('请检查浏览器麦克风权限 无法接通电话')
  })

  const socket = new JsSip.WebSocketInterface(WS_URI.value)
  const config = {
    sockets: [socket],
    outbound_proxy_set: WS_URI.value,
    uri: LOCAL_SIP_URI.value,
    password: PASSWORD.value,
    session_timers: false,
    register: true,
  }
  ua = new JsSip.UA(config)
  ua.on('connecting', (e) => {
    console.log('connecting', e)
  })
  ua.on('connected', (e) => {
    console.log('connected', e)
  })
  ua.on('disconnected', (e) => {
    console.log('disconnected', e)
  })

  ua.on('newRTCSession', (e: RTCSessionEvent) => {
    console.log('*************** e.session', e.session)
    // 通话呼入
    if (e.originator == 'remote') {
      // 接电话
      console.log('incoming')
      incomingSession = e.session
      incomingSession.answer(<AnswerOptions>{
        mediaConstraints: {
          audio: true,
          video: false,
          mandatory: { maxWidth: 640, maxHeight: 360 }
        },
        mediaStream: remoteStream
      })
      console.log('--------------- incoming', e.session?.connection)
    } else {
      // 打电话
      console.log('outgoing')
      outgoingSession = e.session
      outgoingSession.on('connecting', function () {
        currentSession = outgoingSession
        outgoingSession = null
      })
      console.log('--------------- outgoing', e.session?.connection)
    }
    e.session.on('accepted', function (data: OutgoingEvent) {
      console.info('onAccepted - ', data)
      if (data.originator == 'remote' && currentSession == null) {
        currentSession = incomingSession
        incomingSession = null
        console.info('setCurrentSession - ', currentSession)
      }
    })
    e.session.on('confirmed', function (data: IncomingAckEvent | OutgoingAckEvent) {
      console.info('onConfirmed - ', data)
      if (data.originator == 'remote' && currentSession == null) {
        currentSession = incomingSession
        incomingSession = null
        console.info('setCurrentSession - ', currentSession)
      }
      const stream = new MediaStream();
      const receivers = e.session.connection?.getReceivers();
      console.log('receivers', receivers)
      if (receivers) receivers.forEach((receiver) => stream.addTrack(receiver.track));
      audioRef.value.srcObject = stream;
      // 最后都要播放
      audioRef.value.play();
    })
    e.session.on('sdp', function (data: SDPEvent) {
      // console.info('onSDP, type - ', data.type, ' sdp - ', data.sdp)
      console.info('onSDP, type - ', data.type)
    })
    e.session.on('progress', function (data: IncomingEvent | OutgoingEvent) {
      console.log('--------------- progress', e.session?.connection)
      if (data.originator == 'remote') {
        console.info('onProgress, response - ', data.response)
      }
    })
  })
  ua.on('newMessage', (e: IncomingMessageEvent | OutgoingMessageEvent) => {
    console.log('newMessage', e?.request?.body)
  })
  ua.on('newOptions', (e: IncomingOptionsEvent | OutgoingOptionsEvent) => {
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

  ua.start()
}

const killSip = () => {
  ua?.terminateSessions()
  ua?.stop()
  ua = null
}

const makeCall = () => {
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
    // 'mediaStream': remoteStream ?? undefined,
    'sessionTimersExpires': 120,
    // 'pcConfig': {
    //   'iceServers': [
    //     // { 'urls': ['stun:a.example.com', 'stun:b.example.com'] },
    //     { 'urls': TURN_URI.value, 'username': 'username', 'credential': 'PASSWORD.value' }
    //   ]
    // }
  };
  outgoingSession = ua?.call(REMOTE_SIP_URI.value, options) ?? null;
  console.log('makeCall session', outgoingSession)
}

const onClickSend = () => {
  const text = 'HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello';
  const eventHandlers = {
    'succeeded': function () {
      console.log('message succeeded')
    },
    'failed': function () {
      console.log('message failed')
    }
  };
  const options = {
    'eventHandlers': eventHandlers
  };
  ua?.sendMessage(REMOTE_SIP_URI.value, text, options);
}
</script>

<style scoped lang="scss">
</style>
