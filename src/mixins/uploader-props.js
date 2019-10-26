export default {
  props: {
    filename  : { type: String  },
    format    : { type: String, default: 'mp3'      },
    headers   : { type: Object, default: () => ({}) },
    uploadUrl : { type: String                      }
  }
}
