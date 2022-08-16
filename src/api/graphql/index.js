import { createGraphql } from '@/api/request'
import gql from 'graphql-tag'

const client = createGraphql('#')

const common = {
  // 查询实时告警
  listRealTimeMessage: (variables = {}) => {
    return client.query({
      query: gql`
        query ($orgCode: String) {
          listRealTimeMessage(orgCode: $orgCode) {
            businessCode
            businessId
            content
            createTime
            extJson
            id
            isDeleted
            messageType
            receiver
            receiverMail
            receiverMobile
            receiverName
            redirectUrl
            status
            templateCode
            title
            updateTime
          }
        }
      `,
      variables
    })
  }
}

export default {
  ...common
}
