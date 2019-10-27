import AudioPlayer   from '@/components/player.vue'
import AudioRecorder from '@/components/recorder.vue'
import Toasted from 'vue-toasted'
import VueI18n from 'vue-i18n'

const components = {
  AudioPlayer,
  AudioRecorder,

  install (Vue) {

    if (this.installed) { return }

    Vue.use(Toasted, { position: 'bottom-right' })

    Vue.prototype.$eventBus = Vue.prototype.$eventBus || new Vue

    Vue.component('audio-player', AudioPlayer)
    Vue.component('audio-recorder', AudioRecorder)

    this.installed = true

  }
}

export default components

export { AudioPlayer, AudioRecorder }
