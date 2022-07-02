import React from 'react';
import './App.css';
import { useQuery, gql } from '@apollo/client';

import {PostFrequency} from './components/postFrequency';

const GET_POSTS = gql`
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

const sortByMonth = (posts: any) => {
  const sorted = [];
  for (const post of posts) {
    const month = (new Date(Number(post.createdAt))).getMonth();
    sorted[month] ? sorted[month].push(post) : sorted[month] = [post];
  }
  console.log(sorted);
  return sorted;
}



function App() {
  const { loading, error, data } = useQuery(GET_POSTS, {variables: { amount: 100 }});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  console.log(data.allPosts);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Post Frequency by month
        </p>
        <PostFrequency posts={sortByMonth(data.allPosts)} />
        
        
        {data.allPosts.map(({ id, title, author, likelyTopics }: any) => (
          <div key={id}>
            <h3>{title}</h3>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
