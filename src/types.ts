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
    likelyTopics: Topic[]
}

export type AuthorCollection = Record<string, {
    posts: Post[];
    author: Author
  }>

export type MonthCollection = {
    month: number,
    posts: Post[];
    topics: Record<string, Post[]>;
  }[];


export type SortedData = {
    months: MonthCollection
    authors: AuthorCollection,
    topics: Record<string, Post[]>
  };