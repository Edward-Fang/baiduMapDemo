import dayjs from 'dayjs'
import { graphql } from '@/api'

const useRealState = defineStore({
  id: 'myStore',
  state: () => ({
    real: []
  }),
  actions: {
    async realRefresh(orgCode) {
      const res = await graphql.listRealTimeMessage({ orgCode })
      const list = res.data.listRealTimeMessage || []
      const messageList = list.map(m => {
        m.createTime = dayjs(m.createTime).format('YYYY-MM-DD HH:mm:ss')
        return m
      })
      this.real.value = messageList
    }
  }
})

export default useRealState
