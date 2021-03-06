export type Author = {
    id: string;
    firstName: string;
    lastName: string;
  };

export type Topic = {
    label: string;
    likelihood: number;
  };

export type Post = {
    id: string;
    title: string;
    createdAt: string;
    author: Author;
    likelyTopics: Topic[];
}


export type TopicCollection = Record<string, Post[]>;

export type Month = {
    monthId: number;
    posts: Post[];
    topics: Record<string, Post[]>;
  };


export type SortedData = {
    months: Month[];
    topics: TopicCollection;
  };