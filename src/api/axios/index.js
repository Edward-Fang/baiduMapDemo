import { createRest } from '@/api/request'

const request = createRest('#')

const digitalBaseUrl = '/digital'
const baseData = {
  listBaseData: (modelName, data = {}) => {
    return request.post(`${digitalBaseUrl}/api/v1/mdm/doc/${modelName}/list`, data)
  }
}
export default {
  ...baseData
}
