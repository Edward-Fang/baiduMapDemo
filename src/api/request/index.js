import { createRestService } from './rest-service'
import { createGqlApolloService } from './graphql-apollo-service'

const request = {
  rest: {},
  graphql: {
    apollo: {},
  }
}

const createRest = origin => {
  if (!request.rest[origin]) {
    request.rest[origin] = createRestService(origin)
  }
  return request.rest[origin]
}

const createGraphql = (origin, tool = 'apollo') => {
  if (!request.graphql[tool][origin]) {
    request.graphql[tool][origin] = createGqlApolloService(origin)
  }
  return request.graphql[tool][origin]
}

export { createRest, createGraphql }
