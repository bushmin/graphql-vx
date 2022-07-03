# graphql-vx assignment
React app testing graphql queries and data visualisation with VX

## How to run project
### `npm i`
### `npm start`

<br/>

# Process
I started with learning GraphQL+Apollo and looked through VX examples (haven't worked with either of them). I've spent a couple of days learning Apollo Client and Server, to find out later that I had no way to filter posts and had to manipulate data on the client. In the end I didn't need to dive so deep and could pick up GraphQL faster (the Apollo part of my assignment took only 30 min in total), but it was still nice learning this stuff.

During the learning process I thought about different ways to analyse data in a meaningful way, so it could be useful either for users or for business. I came up with a ton of ideas. Here are some of them:
- Posts amount by month
- Most popular topics by month
- Interpret topics as communities and aggregate their local info: top authors, average post length and amount, etc.
- Predict future trends (in upcoming week/month) based on topic gradients
- user statistics: activity by month/weeks, topic preferences, etc.
- topics correlations (which topics are more likely to appear together on a post)
- "suggested friends": find authors that are close enough to you based on a direction of a vector of interests (defined by topics you mostly post about)

I created an app with react-create-app, added typescript and ESlint. Then installed Apollo and GraphQL and made sure I can fetch data from fakerQL.

Then I installed the VX package and dived deeper in components and API. To tell you the truth, this was the place I've lost the most time on. It was easy enough to get the needed data in *my* structures in code. But to display all the charts with my data, accurately and how I wanted took lots of fine tuning by trial and errors.

In the end, I didn't have enough time to create all the visualisations I had in mind, so after 6 hours of coding in total I decided to stop with 3 charts which you can see in my project.

Lack of time also resulted in small time left for styling (almost no styles written and desktop-only for now) and for throughout code cleanup (separating logic and visualisation parts of components, reuse of tooltips, new directive for containers, etc.).

# Afterthoughts
As I have learned while messing with fakerQL, it generates random data, so there is no way of filtering or sorting data. So I had to get a small amount of posts and filter this data by hand.
In an ideal world there should be GraphQL queries for fetching the specific info I needed, like:
- posts by author (in some timespan)
- posts by topic (in some timespan)
- posts in general during some timespan
- etc.