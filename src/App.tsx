import React from 'react';
import './App.css';
import { useQuery, gql } from '@apollo/client';

const GET_POSTS = gql`
  query {
    allPosts(count: 10) {
      id
      title
      createdAt
      author {
        id
        lastName
      }
      likelyTopics {
        label
        likelihood
      }
    }
  }
`;


const DisplayPosts = () => {
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  console.log(data.allPosts);

  return data.allPosts.map(({ id, title, author, likelyTopics }: any) => (
    <div key={id}>
      <h3>{title}</h3>
      <br />
      <b>Author:</b>
      <p>{author.firstName} {author.lastName}</p>
      <br />
      <b>Topic:</b>
      <p>{likelyTopics[0].label} {likelyTopics[0].likelihood}</p>
      <br />
    </div>
  ));
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit
          {' '}
          <code>src/App.tsx</code>
          {' '}
          and save to reload.
        </p>
        <DisplayPosts />
      </header>
    </div>
  );
}

export default App;
