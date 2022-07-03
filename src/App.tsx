import React, {useMemo} from 'react';
import './App.css';
import { useQuery } from '@apollo/client';

import {GET_POSTS} from './graphql/queries';
import {PostFrequency} from './components/post-frequency';
import {TopTopics} from './components/popular-topics';
import {TopicLinks} from './components/topic-links';
import type {Post, SortedData} from './types';

const DEFAULT_LIKELIHOOD = 0.2;

const megaSort = (posts: Post[], minLikelihood = DEFAULT_LIKELIHOOD) => {

  if (!posts) return;

  const sorted = {
    months: [],
    authors: {},
    topics: {}
  } as SortedData;

  for (const post of posts) {
    const month = (new Date(Number(post.createdAt))).getMonth();


    let monthPosts = sorted.months[month]?.posts;
    monthPosts ? monthPosts.push(post) : monthPosts = [post];
    sorted.months[month] || (sorted.months[month] = {monthId: month, posts: [], topics: {}});

    for (const topic of post.likelyTopics) {
      if (topic.likelihood > minLikelihood) {
        let topicPosts = sorted.topics[topic.label];
        topicPosts ? topicPosts.push(post) : sorted.topics[topic.label] = [post];

        let monthTopicPosts = sorted.months?.[month]?.topics?.[topic.label];
        monthTopicPosts ? monthTopicPosts.push(post) : sorted.months[month].topics[topic.label] = [post];
      }
    }

    const authorId = post.author.id;
    if (sorted.authors[authorId]) sorted.authors[authorId].posts.push(post);
    else {
      sorted.authors[authorId] = {
        author: post.author,
        posts: [post]
      }
    }
  }

  console.log(sorted);

  return sorted;
}



function App() {
  const { loading, error, data } = useQuery(GET_POSTS, {variables: { amount: 1000 }});

  const sortedData = useMemo(() => megaSort(data?.allPosts), [data])


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  if (!sortedData) return null;


  return (
    <div className="App">
      <p>Post Frequency by month</p>
      <PostFrequency posts={sortedData.months.map(month => month.posts)} />
      
      <br /><br />

      <p>Most popular topics by month (likelihood &gt; {DEFAULT_LIKELIHOOD})</p>
      <TopTopics
      topics={sortedData.topics}
      monthPosts={sortedData.months}
       />

      <p>Topic connections</p>
      <TopicLinks
        topics={sortedData.topics}
        minLikelihood={DEFAULT_LIKELIHOOD}
      />
    </div>
  );
}

export default App;
