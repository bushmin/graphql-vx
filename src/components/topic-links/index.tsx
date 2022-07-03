import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleSqrt, scaleBand } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';


import type {TopicCollection} from '../../types';
import {heatmapMargin, topicLabelProps, verticalTopicLabelProps} from '../graphConstants'


type TooltipData = {
    //bar: SeriesPoint<any>;
    key: string;
    index: number;
    height: number;
    width: number;
    x: number;
    y: number;
    color: string;
  };
  


const cool1 = '#122549';
const cool2 = '#b4fbde';
const background = '#000000';
const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
    color: 'white',
  };


const countTopicLinks = (topics: TopicCollection, minLikelihood: number) => {
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

let tooltipTimeout: number;

export type Props = {
  width?: number;
  height?: number;
  events?: boolean;
  topics: TopicCollection;
  minLikelihood: number
};


export const TopicLinks = ({
  width = 1100,
  height = 1000,
  events = true,
  topics,
  minLikelihood
}: Props) => {
    const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<any>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({scroll: true});

  // bounds
  const yMax = height - heatmapMargin.y;
  const xMax = yMax;

  const binData = useMemo(() => countTopicLinks(topics, minLikelihood), [topics, minLikelihood]);
  const binKeys = Object.keys(topics);

  const binWidth = xMax / binKeys.length;

  // scales
const xScale = scaleLinear<number>({
    range: [0, xMax],
    domain: [0, binKeys.length],
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, binKeys.length],
  });
  const rectColorScale = scaleSqrt<string>({
    range: [cool1, cool2],
    domain: [0, 0.16], //! count max connection!
  });
  const topicScale = scaleBand<string>({
    range: [0, xMax],
    domain: binKeys,
  });



  return width < 10 ? null : (
    <div style={{ position: 'relative' }}>

        <svg ref={containerRef} width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} rx={14} fill={background} />
        <Group left={heatmapMargin.x/2}>
            <HeatmapRect
            data={binData}
            xScale={xScale}
            yScale={yScale}
            colorScale={rectColorScale}
            binWidth={binWidth}
            binHeight={binWidth}
            gap={5}
            >
            {(heatmap) =>
                heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                    <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="visx-heatmap-rect"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                    onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={() => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const left = bin.x + bin.width / 2;
                        const top = bin.y + bin.height / 2;
                        showTooltip({
                          tooltipData: bin,
                          tooltipTop: top,
                          tooltipLeft: left,
                        });
                      }}
                    />
                )),
                )
            }
            </HeatmapRect>
        </Group>

        <AxisBottom
            top={heatmapMargin.y/2}
            left={heatmapMargin.x/2}
            scale={topicScale}
            hideAxisLine
            hideTicks
            tickLabelProps={() => topicLabelProps}
        />
        <AxisLeft
            top={heatmapMargin.y/2 + 30}
            left={heatmapMargin.x/2}
            scale={topicScale}
            hideAxisLine
            hideTicks
            tickLabelProps={() => verticalTopicLabelProps}
        />
    </svg>

    {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
        <div>
            <strong>{tooltipData.key}</strong>
        </div>
        <div>
            {`${tooltipData.bin.bin} + ${tooltipData.datum.bin}:
            ${Math.round(tooltipData.bin.count*100)}%`}
        </div>

        </TooltipInPortal>
    )}
  </div>
  );
};