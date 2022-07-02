import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientPurpleRed } from '@visx/gradient';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import type {Post} from '../types';
import {margin, monthNames} from './graphConstants'

// accessors
const getPostsInMonth = (month: Post[]) => month.length;

export type Props = {
  posts: Post[][];
  width?: number;
  height?: number
};

export const PostFrequency = ({ width = 700, height = 500, posts }: Props) => {
  // bounds
  const xMax = width - margin.x;
  const yMax = height - margin.y;

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        round: true,
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
        domain: [0, Math.max(...posts.map(getPostsInMonth))],
      }),
    [yMax],
  );

  const dateScale = scaleBand<string>({
    range: [0, xMax],
    domain: monthNames,
    padding: 0.4,
  });

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <GradientPurpleRed id="teal" />
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group left={margin.x / 2} top={margin.y / 2}>
        {posts.map((d: Post[], index: number) => {
          const month = index;
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(getPostsInMonth(d)) ?? 0);
          const barX = xScale(month);
          const barY = yMax - barHeight;
          return (
            <Bar
              key={`bar-${month}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="rgba(23, 233, 217)"
            />
          );
        })}
      </Group>

      <AxisLeft
        top={margin.y/2}
        left={margin.x/2}
        scale={yScale}
        stroke='#e5fd3d'
        hideTicks
        label='# of posts'
        tickLabelProps={() => ({
          fill: '#e5fd3d',
          fontSize: 11,
          textAnchor: 'middle',
        })}
      />

      <AxisBottom
        top={yMax + margin.y/2}
        left={margin.x/2}
        scale={dateScale}
        stroke='#e5fd3d'
        hideAxisLine
        hideTicks
        tickLabelProps={() => ({
          fill: '#e5fd3d',
          fontSize: 15,
          textAnchor: 'middle',
        })}
      />
    </svg>
  );
}