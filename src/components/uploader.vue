<style lang="scss">
  @import '../scss/icons';
</style>

<template>
  <div></div>
  <!-- <icon-button name="save" class="ar-icon ar-icon__xs ar-icon--no-border" @click.native="clickHandler"/> -->
</template>

<script>
  import IconButton from './icon-button'
  import UploaderPropsMixin from '@/mixins/uploader-props'

  export default {
    mixins: [UploaderPropsMixin],
    props: {
      trigger: { type: Function },
      record: { type: Object },
    },
    components: {
      IconButton
    },
    mounted() {

      this.$eventBus.$on(`trigger-upload-${this.record.id}`, (record) => {
        this.upload()
      })

    },
    methods: {
      clickHandler() {
        if(this.trigger) { this.trigger() } else { this.upload() }
      },
      upload() {
        if (!this.record.url) {
          return
        }
        this.$eventBus.$emit('start-upload')
        const data = new FormData()
        const type = this.record.blob.type.split('/')[1]
        data.append('audio', this.record.blob, `${this.record.filename}.${type}`)
        const headers = Object.assign(this.headers, {})
        headers['Content-Type'] = `multipart/form-data;`
        this.$http.post(this.uploadUrl, data, { headers: headers }).then(resp => {
          this.$eventBus.$emit('end-upload', { status: 'success', response: resp })
        }).catch(error => {
          this.$eventBus.$emit('end-upload', { status: 'fail', response: error })
        })

      }
    }
  }
</script>
