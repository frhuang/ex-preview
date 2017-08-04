<template>
  <div class="home">
    <viewer 
      :imagelist="imagelist"></viewer> 
    <!-- <photo-view :imagelist="imagelist"></photo-view> -->
  </div>
</template>

<script>
import Viewer from './viewer/Viewer'
export default {
  data() {
    return {
      showViewer: true,
      imagelist: [
        'https://gpic.qpic.cn/gbar_pic/2aqluyraXicEfqicaK3aV4iaib5icib78qF0eFxokIEKSewIg8hQW0kiavCQg/1000',
        'https://gpic.qpic.cn/gbar_pic/lDVAjxOVicMnyU4OWLShicffM3TvZYFia4ywL0B5oC3BLPDCoIkgdkJLA/0',
        '/static/img/1.jpg',
        '/static/img/2.jpg',
        '/static/img/test.png','https://gpic.qpic.cn/gbar_pic/2aqluyraXicEfqicaK3aV4ia3YQE3mKcibH02jibympJ4gzCUEjk2Iz5BwQ/1000',
      ]
    }
  },
  methods: {
    zoom(val) {
      console.log(val);
    },
    slide(val) {
      console.log(val);
    }
  },
  components: {
    Viewer
  }
}
</script>

