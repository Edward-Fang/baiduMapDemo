import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'

const middlewareLink = new ApolloLink((operation, forward) => {
  const token = '#'
  operation.setContext({
    headers: {
      'accept-language': 'zh-cn',
      'Authorization': `Bearer ${token}` 
    }
  })
  return forward(operation).map((response) => {
    if (response.msg === "SIGNIN") {
      return toLogin()
    }
    return response
  })
})

const cache = new InMemoryCache() // 缓存实现

const createGqlApolloService = origin => {
  const httpLink = createHttpLink({  uri: `${origin}/graphql` })
  return new ApolloClient({
    link: middlewareLink.concat(httpLink),
    cache,
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore'
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      }
    }
  })
}

export { createGqlApolloService }
