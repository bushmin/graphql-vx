import type {TopicCollection} from '../../types';

// Convert topic object to suitable for heatmap
// While counting frequency of posts with both topics over minLikelihood
export const countTopicLinks = (topics: TopicCollection, minLikelihood: number) => {
    const topicNames = Object.keys(topics);
    const reverseTopics = [...topicNames].reverse();
    const topicConnections = [];
     for (const topic of topicNames) {

        const connections: Record<string, number> = Object.fromEntries(topicNames.map(
            name => [name, 0]
        ));

        for (const post of topics[topic]) {
            for (const postTopic of post.likelyTopics) {
                if (postTopic.likelihood > minLikelihood) {
                    connections[postTopic.label] += 1;
                }
            }
        }
        const bins = [];
        for (const binTopic of reverseTopics) {
            const totalTopicCount = topics[binTopic].length + topics[topic].length - connections[binTopic];
            bins.push({bin: binTopic, count: connections[binTopic] / totalTopicCount});
        }

        topicConnections.push({bin: topic, bins});
     }
     return topicConnections;
}