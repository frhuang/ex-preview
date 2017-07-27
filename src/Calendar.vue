<template>
  <div ref="wrapper">

  </div>
</template>

<script>
import axios from 'axios';
export default {
  created () {
    var head = document.getElementsByTagName('head')[0];
    var script1 = document.createElement('script');
    script1.charset = "UTF-8";
    script1.src = "/static/js/zepto.min.js";
		var script2 = document.createElement('script');
    script2.charset = "UTF-8";
    script2.src = "/static/js/calendar.js";
    head.appendChild(script1);
    head.appendChild(script2);
    var self = this;
		let status1 = false;
		let status2 = false;
    script1.onload = function () {
			status1 = true
			if (status1 && status2) {
				self.initCalendar();
			}
    }
		script2.onload = function () {
			status2 = true
			if (status1 && status2) {
				self.initCalendar();
			}
    }
    this.getDBJson();
  },
  mounted () {

  },
  methods: {
    getDBJson () {
      axios.get('/static/json/db.json')
        .then(res => {
          // console.log(res);
          // this.initCalendar();
        })
    },
    initCalendar () {
      var el = this.$refs["wrapper"]
       calendar = new Calendar(el, {
        callback: this.showContent
      });
    },
    showContent () {
      console.log('showcontent')
    }
  }
}
</script>

