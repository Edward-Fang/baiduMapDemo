<template>
  <div id="container"></div>
  <div style="display:none">
    <div class="info-box" ref="infoContent">
      <div class="name" :title="curOwner.owner_name || ''">
        {{ curOwner.owner_name || '' }}
      </div>
      <div v-if="curOwner.owner_type_rel_code === 'MARSHALL_CUSTOMER'" class="show-indoor" @click="alert('hhh')">
        <i class="iconfont icon-xkdt"></i>查看平面图
      </div>
      <div v-else class="address"
        :title="`${curOwner.t_province_rel_pname || ''}${curOwner.t_city_rel_cname || ''}${curOwner.t_district_rel_dname || ''}${curOwner.owner_address || ''}`">
        {{ `${curOwner.t_province_rel_pname || ''}${curOwner.t_city_rel_cname || ''}${curOwner.t_district_rel_dname ||
            ''}${curOwner.owner_address || ''}`
        }}
      </div>
      <div class="info-arrow"></div>
    </div>
  </div>
</template>

<script setup>
import { axios } from '@/api'
import unionBy from 'lodash/unionBy'
import get from 'lodash/get'
import useRealState from '@/store'
const MAP_STYLE = 'd3c0394a9d7084e5f2a5c4f605d4932c'
let map = {}

const markerClickHandle = e => {
  const owner = get(e, 'dataItem.geometry.origin')
  openInfoWindow(owner)
}

const normalLayer = new mapvgl.CircleLayer({
  type: 'simple', // 默认值，普通圆，扩散效果的相关设置对其无效
  enablePicked: true, // 是否开启鼠标事件
  onClick: markerClickHandle
})
const alarmLayer = new mapvgl.CircleLayer({
  type: 'bubble', // bubble，带冒泡扩散效果的圆
  radius: 40, // 扩散效果的半径大小
  duration: 1, // 扩散效果的动画周期 默认 1
  trail: 1, // 扩散效果的间隔时间 默认 1
  enablePicked: true,
  onClick: markerClickHandle
})

onMounted(async () => {
  map = new BMapGL.Map('container')
  map.centerAndZoom(new BMapGL.Point(104.57, 34.56), 5)
  map.setMapStyleV2({ styleId: MAP_STYLE })
  map.enableScrollWheelZoom(true)
  const view = new mapvgl.View({ map })
  view.addLayer(normalLayer)
  view.addLayer(alarmLayer)
  await refreshOwner()
})

const alarmOwnerCodes = ref([])
const refreshOwner = async () => {
  const realState = useRealState()
  await realState.realRefresh('hzyyzx')
  alarmOwnerCodes.value = unionBy(realState.real.value, 'businessCode').map(i => i.businessCode)
  const res = await axios.listBaseData('t_business_owner', { eq: { t_operation_org_svc_rel_org_code: 'hzyyzx' } })
  const resData = res.data?.data ?? []
  await refreshMapOwner(resData)
}

const normalPoints = ref([])
const alarmPoints = ref([])
const refreshMapOwner = async (list) => {
  const points = list.map(item => ({
    code: item.owner_code,
    geometry: {
      origin: item,
      type: 'Point',
      coordinates: [item.longitude, item.latitude]
    },
    color: alarmOwnerCodes.value.includes(item.owner_code) ? '#FF4B1D' : '#14FF8A',
    size: 10
  }))
  normalPoints.value = points.filter(item => !alarmOwnerCodes.value.includes(item.code))
  alarmPoints.value = points.filter(item => alarmOwnerCodes.value.includes(item.code))
  normalLayer.setData(normalPoints.value)
  alarmLayer.setData(alarmPoints.value)
}

const infoContent = ref()
const curOwner = ref({})
const openInfoWindow = (owner) => {
  if (owner) {
    curOwner.value = owner
    const point = new BMapGL.Point(owner.longitude, owner.latitude)
    const infoWindow = new BMapGL.InfoWindow(
      infoContent.value,
      { width: 268, height: 111, offset: new BMapGL.Size(68, -50) }
    )
    map.openInfoWindow(infoWindow, point)
  }
}
</script>

<style lang="scss" scoped>
#container {
  height: 100vh;
}

:deep(.BMap_bubble_pop) {
  border-width: 0 !important;
  padding: 0 !important;
  background: transparent !important;

  .BMap_bubble_top {
    display: none;
  }

  .BMap_bubble_center {
    width: 100% !important;
  }

  .BMap_bubble_content {
    color: #fff !important;
    overflow: visible !important;
    width: 100% !important;
  }

  .BMap_bubble_buttons {
    display: none;
  }

  .info-box {
    width: 100%;
    height: 100%;
    background-image: url('./assets/home/monitor/info-bg.png');
    background-size: 100% 100%;
    text-align: center;
    padding-top: 30px;

    .name {
      width: 100%;
      height: 18px;
      line-height: 18px;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .show-indoor {
      width: 127px;
      height: 38px;
      background-image: url('./assets/home/monitor/info-btn.png');
      background-size: 100% 100%;
      margin: 9px auto 0;
      font-size: 16px;
      color: #fff;
      line-height: 38px;
      cursor: pointer;
      box-sizing: border-box;

      i {
        margin-right: 10px;
      }
    }

    .address {
      padding: 10px 20px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.8;
    }

    .info-arrow {
      position: absolute;
      bottom: -110px;
      left: 40px;
      width: 0;
      height: 110px;
      border-left: 1px dashed #FFB000;
    }
  }

  img {
    display: none;
  }
}
</style>
