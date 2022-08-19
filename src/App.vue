<template>
  <div id="container"></div>
  <div style="display: none">
    <div class="info-box" ref="infoContent">
      <div class="name" :title="curOwner.owner_name || ''">
        {{ curOwner.owner_name || '' }}
      </div>
      <div v-if="curOwner.owner_type_rel_code === 'MARSHALL_CUSTOMER'" class="show-indoor">
        <i class="iconfont icon-xkdt"></i>查看平面图
      </div>
      <div v-else class="address" :title="`${curOwner.t_province_rel_pname || ''}${curOwner.t_city_rel_cname || ''}${curOwner.t_district_rel_dname || ''
      }${curOwner.owner_address || ''}`">
        {{
            `${curOwner.t_province_rel_pname || ''}${curOwner.t_city_rel_cname || ''}${curOwner.t_district_rel_dname || ''
            }${curOwner.owner_address || ''}`
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
  if (e.dataItem?.children) {
    map.setZoom(map.getZoom() + 1.5)
  } else if (e.dataItem) {
    const owner = get(e, 'dataItem.geometry.origin')
    map.panTo({
      lng: owner.longitude,
      lat: owner.latitude
    })
    openInfoWindow(owner)
  }
}

const alarmLayer = new mapvgl.CircleLayer({
  type: 'bubble', // bubble，带冒泡扩散效果的圆
  radius: 40, // 扩散效果的半径大小
  duration: 1, // 扩散效果的动画周期 默认 1
  trail: 1, // 扩散效果的间隔时间 默认 1
  enablePicked: true,
  onClick: markerClickHandle
})
const clusterLayer = new mapvgl.ClusterLayer({
  minSize: 35, // 聚合点显示的最小直径
  maxSize: 45, // 聚合点显示的最大直径
  clusterRadius: 250, // 聚合范围半径
  maxZoom: 16, // 聚合的最大级别，当地图放大级别高于此值将不再聚合
  minZoom: 0, // 聚合的最小级别，当地图放大级别低于此值将不再聚合
  // 是否显示文字
  showText: true,
  // 开始聚合的最少点数，点数多于此值才会被聚合
  minPoints: 2,
  // 设置文字样式
  textOptions: {
    fontSize: 12,
    color: 'white',
    // 格式化数字显示
    format: function (count) {
      return count >= 10000
        ? Math.round(count / 1000) + 'k'
        : count >= 1000
          ? Math.round(count / 100) / 10 + 'k'
          : count
    }
  },
  // 设置非聚合的点的icon
  iconOptions: {
    width: 54,
    height: 54,
    icon: 'src/assets/home/monitor1.png'
  },
  enablePicked: true,
  onClick: markerClickHandle
})

onMounted(async () => {
  map = new BMapGL.Map('container')
  map.centerAndZoom(new BMapGL.Point(104.57, 34.56), 5)
  map.setMapStyleV2({ styleId: MAP_STYLE })
  map.enableScrollWheelZoom(true)
  const view = new mapvgl.View({ map })
  view.addLayer(alarmLayer)
  view.addLayer(clusterLayer)
  await refreshOwner()
})

let alarmOwnerCodes = []
const refreshOwner = async () => {
  const realState = useRealState()
  await realState.realRefresh('hzyyzx')
  alarmOwnerCodes = unionBy(realState.real.value, 'businessCode').map(i => i.businessCode) // 所有实时告警的家庭/单位
  const res = await axios.listBaseData('t_business_owner', { eq: { t_operation_org_svc_rel_org_code: 'hzyyzx' } })
  const resData = res.data?.data ?? []
  await refreshMapOwner(resData)
}

let normalPoints = []
let alarmPoints = []
const refreshMapOwner = async list => {
  const points = list.map(item => ({
    code: item.owner_code,
    geometry: {
      origin: item,
      type: 'Point',
      coordinates: [item.longitude, item.latitude]
    },
    color: alarmOwnerCodes.includes(item.owner_code) ? '#FF4B1D' : ''
  }))

  normalPoints = points.filter(item => !alarmOwnerCodes.includes(item.code))
  alarmPoints = points.filter(item => alarmOwnerCodes.includes(item.code))
  clusterLayer.setData(normalPoints) // 所有正常的点，采用聚合
  alarmLayer.setData(alarmPoints) // 所有告警(红色)的点，不聚合
}

let infoContent = ref()
let curOwner = ref({})
const openInfoWindow = owner => {
  console.log(111111);
  if (owner) {
    curOwner.value = owner
    const point = new BMapGL.Point(owner.longitude, owner.latitude)
    const infoWindow = new BMapGL.InfoWindow(infoContent.value, {
      width: 268,
      height: 111,
      offset: new BMapGL.Size(68, -50)
    })
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
      border-left: 1px dashed #ffb000;
    }
  }

  img {
    display: none;
  }
}
</style>
