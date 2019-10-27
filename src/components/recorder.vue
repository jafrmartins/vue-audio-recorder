<style lang="scss">
.ar {
  width: 420px;
  font-family: "Roboto", sans-serif;
  border-radius: 16px;
  background-color: #fafafa;
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.17);
  position: relative;
  box-sizing: content-box;

  &-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &-records {
    height: 138px;
    padding-top: 1px;
    overflow-y: auto;
    margin-bottom: 20px;

    &__record {
      width: 320px;
      height: 45px;
      padding: 0 10px;
      margin: 0 auto;
      line-height: 45px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e8e8e8;
      position: relative;

      &--selected {
        border: 1px solid #e8e8e8;
        border-radius: 24px;
        background-color: #ffffff;
        margin-top: -1px;
        padding: 0 34px;
      }
    }
  }

  &-recorder {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    &__duration {
      color: #aeaeae;
      font-size: 32px;
      font-weight: 500;
      margin-top: 20px;
      margin-bottom: 16px;
    }

    &__stop {
      position: absolute;
      top: 10px;
      right: -52px;
    }

    &__time-limit {
      position: absolute;
      color: #aeaeae;
      font-size: 12px;
      top: 128px;
    }

    &__records-limit {
      position: absolute;
      color: #aeaeae;
      font-size: 13px;
      top: 78px;
    }
  }

  &-spinner {
    display: flex;
    height: 30px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 144px;
    z-index: 10;

    &__dot {
      display: block;
      margin: 0 8px;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      background: #05cbcd;
      animation-name: blink;
      animation-duration: 1.4s;
      animation-iteration-count: infinite;
      animation-fill-mode: both;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes blink {
        0% {
          opacity: 0.2;
        }
        20% {
          opacity: 1;
        }
        100% {
          opacity: 0.2;
        }
      }
    }
  }

  &__text {
    color: rgba(84, 84, 84, 0.5);
    font-size: 16px;
  }

  &__blur {
    filter: blur(2px);
    opacity: 0.7;
  }

  &__overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
  }

  &__upload-status {
    text-align: center;
    font-size: 10px;
    padding: 2px;
    letter-spacing: 1px;
    position: absolute;
    bottom: 0;

    &--success {
      color: green;
    }

    &--fail {
      color: red;
    }
  }

  &__rm {
    cursor: pointer;
    position: absolute;
    width: 6px;
    height: 6px;
    padding: 6px;
    line-height: 6px;
    margin: auto;
    left: 10px;
    bottom: 0;
    top: 0;
    color: rgb(244, 120, 90);
  }

  &__downloader,
  &__uploader {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
  }

  &__downloader {
    right: 115px;
  }

  &__uploader {
    right: 85px;
  }
}

@import "../scss/icons";
</style>

<template>
  <div class="ar">

    <div class="ar__overlay" v-if="isUploading"></div>
    <div class="ar-spinner" v-if="isUploading">
      <div class="ar-spinner__dot"></div>
      <div class="ar-spinner__dot"></div>
      <div class="ar-spinner__dot"></div>
    </div>

    <div class="d-flex justify-content-between p-4">
      <div class="d-flex d-inline-flex w-100 justify-content-between">
        <button
          type="button"
          value="train"
          data-toggle="button"
          aria-pressed="false"
          autocomplete="off"
          class="btn btn-danger"
          @click="toggleAction"
        >Train Voice</button>
        <button disabled class="btn btn-success" v-text="'Utilizador: '+username"></button>
        <button
          type="button"
          value="detect"
          data-toggle="button"
          aria-pressed="false"
          autocomplete="off"
          class="btn btn-primary"
          @click="toggleAction"
        >Detect Voice</button>
      </div>
    </div>

    <div class="ar-content" :class="{'ar__blur': isUploading}">
      <div class="ar-recorder">
        <icon-button
          class="ar-icon ar-icon__lg"
          :name="iconButtonType"
          :class="{
            'ar-icon--rec': isRecording,
            'ar-icon--pulse': isRecording && volume > 0.02
          }"
          @click.native="toggleRecorder"
        />
      </div>

      <div class="ar-recorder__duration">{{recordedTime}}</div>

      <!-- <div
        class="ar-recorder__records-limit"
        v-if="attempts"
      >Gravações: {{attemptsLeft}}/{{attempts}}</div>
      <div class="ar-recorder__duration">{{recordedTime}}</div>
      <div class="ar-recorder__time-limit" v-if="time">Tempo Máximo da Gravação: {{time}}m</div> -->

      <!-- <div class="ar-records">
        <div
          class="ar-records__record"
          :class="{'ar-records__record--selected': record.id === selected.id}"
          :key="record.id"
          v-for="(record, idx) in recordList"
          @click="choiceRecord(record)"
        >
          <div class="ar__rm" v-if="record.id === selected.id" @click="removeRecord(idx)">&times;</div>
          <div class="ar__text">Record: {{ record.filename }}</div>
          <div class="ar__text">{{record.duration}}</div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import AudioPlayer from "./player";
import Downloader from "./downloader";
import IconButton from "./icon-button";
import Recorder from "@/lib/recorder";
import UploaderPropsMixin from "@/mixins/uploader-props";
import async from "async-es";
import { convertTimeMMSS } from "@/lib/utils";

export default {
  mixins: [UploaderPropsMixin],
  props: {
    attempts: { type: Number },
    time: { type: Number },

    bitRate: { type: Number, default: 128 },
    sampleRate: { type: Number, default: 44100 },

    showDownloadButton: { type: Boolean, default: true },
    showUploadButton: { type: Boolean, default: true },

    micFailed: { type: Function },
    beforeRecording: { type: Function },
    pauseRecording: { type: Function },
    afterRecording: { type: Function },
    failedUpload: { type: Function },
    beforeUpload: { type: Function },
    successfulUpload: { type: Function },
    selectRecord: { type: Function }
  },
  data() {
    return {
      headers: {},
      dataType: 'training',
      username: null,
      isUploading: false,
      recorder: this._initRecorder(),
      recordList: [],
      selected: {},
      uploadStatus: null
    };
  },
  components: {
    AudioPlayer,
    Downloader,
    IconButton
  },
  mounted() {

    this.$eventBus.$on("start-upload", () => {
      this.isUploading = true;
      this.beforeUpload && this.beforeUpload("before upload");
    });

    this.$eventBus.$on("end-upload", msg => {
      this.isUploading = false;
      if (msg.status === "success") {
        this.successfulUpload && this.successfulUpload(msg.response);
      } else {
        this.failedUpload && this.failedUpload(msg.response);
      }
    });

  },
  methods: {
    promptUsername() {
      this.username = prompt("Por favor introduza o nome do utilizador.");
    },
    getFilename() {
      return `${this.dataType}_${this.uuidv4()}_${this.username}`;
    },
    uuidv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    beforeDestroy() {
      this.stopRecorder();
    },
    toggleAction(event) {
      if (event.target.value == "train") {
        this.promptUsername();
      } else {
        alert("detect voice");
      }
    },
    toggleRecorder() {
      if (this.attempts && this.recorder.records.length >= this.attempts) {
        return;
      }
      if (!this.isRecording || (this.isRecording && this.isPause)) {
        this.recorder.start();
      } else {
        if(!this.username) {
          this.promptUsername()
        }
        this.dataType == "training"
          ? this.dataType == "sample"
          : this.dataType;
        this.stopRecorder();
        this.isUploading = true;
        this.uploadRecords(err => {
          this.isUploading = false;
          this.recordList = this.recorder.recordList();
        });
      }
    },
    stopRecorder() {
      if (!this.isRecording) {
        return;
      } this.recorder.stop();
    },
    removeRecord(idx) {
      this.recordList.splice(idx, 1);
      this.$set(this.selected, "url", null);
      this.$eventBus.$emit("remove-record");
    },
    uploadRecords(done) {
      let callbacks = [];
      this.recorder.records.map(record => {
        callbacks.push(next => {
          this.selected = record;
          this.selectRecord && this.selectRecord(record);
          record.filename = this.getFilename()
          this.upload(record, (err, filename) => {
            if (err) {
              this.$toasted.error(`error: ${err.message}`);
              return next(err);
            } else {
              this.$toasted.success(`success: ${filename}.${this.format}`);
              return next(null, filename);
            }
          })
        });
      });
      async.parallel(callbacks, (err, results) => {
        this.recorder.records = []
        return done(err, results);
      });
    },
    upload(record, next) {
      this.$eventBus.$emit("start-upload");
      const data = new FormData();
      const type = record.blob.type.split("/")[1];
      data.append("username", this.username);
      data.append("audio", record.blob, `${record.filename}.${type}`);
      const headers = Object.assign(this.headers, {});
      headers["Content-Type"] = `multipart/form-data;`;
      this.$http
        .post(this.uploadUrl, data, { headers: headers })
        .then(resp => {
          next(null, record.filename)
          this.$eventBus.$emit("end-upload", {
            status: "success",
            response: resp
          });
        })
        .catch(error => {
          next(error)
          this.$eventBus.$emit("end-upload", {
            status: "fail",
            response: error
          });
        });
    },
    choiceRecord(record) {
      if (this.selected === record) {
        return;
      }
      this.selected = record;
      this.selectRecord && this.selectRecord(record);
    },
    _initRecorder() {
      return new Recorder({
        beforeRecording: this.beforeRecording,
        afterRecording: this.afterRecording,
        pauseRecording: this.pauseRecording,
        micFailed: this.micFailed,
        bitRate: this.bitRate,
        sampleRate: this.sampleRate,
        format: this.format
      });
    }
  },
  computed: {
    attemptsLeft() {
      return this.recordList.length;
    },
    iconButtonType() {
      return this.isRecording && this.isPause
        ? "mic"
        : this.isRecording
        ? "pause"
        : "mic";
    },
    isPause() {
      return this.recorder.isPause;
    },
    isRecording() {
      return this.recorder.isRecording;
    },
    recordedTime() {
      if (this.time && this.recorder.duration >= this.time * 60) {
        this.stopRecorder();
      }
      return convertTimeMMSS(this.recorder.duration);
    },
    volume() {
      return parseFloat(this.recorder.volume);
    }
  }
};
</script>
