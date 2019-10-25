import AudioPlayer   from '@/components/player.vue'
import AudioRecorder from '@/components/recorder.vue'
import { ToggleButton } from 'vue-js-toggle-button'

const components = {
  AudioPlayer,
  AudioRecorder,
  ToggleButton,

  install (Vue) {
    if (this.installed) {
      return
    }

    this.installed = true

    Vue.prototype.$eventBus = Vue.prototype.$eventBus || new Vue

    Vue.component('audio-player', AudioPlayer)
    Vue.component('audio-recorder', AudioRecorder)
    Vue.component('toggle-button', ToggleButton)

  }
}

export default components

export { AudioPlayer, AudioRecorder }
