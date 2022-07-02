export type Post = {
    id: string;
    title: string;
    createdAt: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
    likelyTopics: {
      label: string;
      likelihood: number;
    };
}