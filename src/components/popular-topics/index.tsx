import React, {useMemo} from 'react';
import { BarStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';

import type {Post, Month} from '../../types';
import {margin, monthNames, labelProps, colorArray} from '../graphConstants'


type TooltipData = {
  bar: SeriesPoint<any>;
  key: string;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};


const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};


// accessors
const getMonthId = (month: Month) => month.monthId;

const totalMonthCount = (month: Month) => {
    return Object.values(month.topics).reduce((acc: number, topic: any) => acc + topic.length, 0)
}

const topicPart = (month: Month, topicName: string) => {
    if (!month.topics[topicName]) return 0;
    
    return (month.topics[topicName].length / totalMonthCount(month));
}


let tooltipTimeout: number;

export type Props = {
    topics: Record<string, Post[]>;
    monthPosts: Month[];
    width?: number;
    height?: number
  };

export const TopTopics = ({ width = 1000, height = 500, topics, monthPosts }: Props) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({scroll: true});


  const xMax = width - margin.x;
  const yMax = height - margin.y;


  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        domain: monthNames.map((_, id) => id),
        padding: 0.4,
      }),
    [xMax],
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, 1],
        nice: true,
      }),
    [yMax],
  );

  const colorScale = scaleOrdinal({
    domain: Object.keys(topics),
    range: colorArray,
  });

  const dateScale = scaleBand<string>({
    range: [0, xMax],
    domain: monthNames,
    padding: 0.4,
  });

  return width < 10 ? null : (
    <div style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group top={margin.x/2} left={margin.x/2}>
          <BarStack
            data={monthPosts}
            keys={Object.keys(topics)}
            x={getMonthId}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
            value={topicPart}
            order='descending'
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => { 
                    return(
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={(event) => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      const eventSvgCoords = localPoint(event);
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left,
                      });
                    }}
                  />
                )}),
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
        top={yMax + margin.y/2}
        left={margin.x/2}
        scale={dateScale}
        stroke='#e5fd3d'
        hideAxisLine
        hideTicks
        tickLabelProps={() => labelProps}
      />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: margin.y / 4 - 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontSize: '14px',
        }}
      >
        <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>posts: {tooltipData.bar.data.topics[tooltipData.key].length}
          {' '}
             ({Math.round(100*topicPart(tooltipData.bar.data,tooltipData.key))}%)          
          </div>
          <div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}