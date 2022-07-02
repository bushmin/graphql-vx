import React, {useMemo} from 'react';
import { BarStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { Group } from '@visx/group';
import { Grid } from '@visx/grid';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';

import type {Post, MonthCollection} from '../../types';
import {margin, monthNames, labelProps} from '../graphConstants'


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


const purple1 = '#6c5efb';
const purple2 = '#c998ff';
export const purple3 = '#a44afe';
export const background = '#eaedff';
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};



// accessors
const getMonth = (month: any) => month.month;

const topicPart = (month: any, topicName: string) => {
    if (!month.topics[topicName]) return 0;
    return Math.floor(100 * month.topics[topicName].length / month.posts.length);
}


let tooltipTimeout: number;

export type Props = {
    topics: Record<string, Post[]>;
    monthPosts: MonthCollection;
    width?: number;
    height?: number
  };

export const TopTopics = ({ width = 700, height = 500, topics, monthPosts }: Props) => {
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
        domain: [0, 100],
        nice: true,
      }),
    [yMax],
  );

  const colorScale = scaleOrdinal({
    domain: Object.keys(topics),
    range: [purple1, purple2, purple3],
  });

  const dateScale = scaleBand<string>({
    range: [0, xMax],
    domain: monthNames,
    padding: 0.4,
  });

  return width < 10 ? null : (
    <div style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
        <Grid
          top={margin.y/2}
          left={margin.x/2}
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={xScale.bandwidth() / 2}
        />
        <Group top={margin.x/2} left={margin.x/2}>
          <BarStack
            data={monthPosts}
            keys={Object.keys(topics)}
            x={getMonth}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
            value={topicPart}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => { 
                    //console.log({barStack, bar});
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
          <div>posts: {tooltipData.bar.data[tooltipData.key]}</div>
          <div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}