import { gql } from '@apollo/client';


export const GET_POSTS = gql`
query Posts($amount: Int) {
  allPosts(count: $amount) {
    id
    title
    createdAt
    author {
      id
      firstName
      lastName
    }
    likelyTopics {
      label
      likelihood
    }
  }
}
`;