import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientTealBlue } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';

const verticalMargin = 120;

// accessors
const getPostsInMonth = (month: any) => month.length;

export type Props = {
  posts: any;
  width?: number;
  height?: number
};

export const PostFrequency = ({ width = 700, height = 500, posts }: Props) => {
  // bounds
  const xMax = width;
  const yMax = height - verticalMargin;

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        round: true,
        domain: [0,1,2,3,4,5,6,7,8,9,10,11],
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

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <GradientTealBlue id="teal" />
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group top={verticalMargin / 2}>
        {posts.map((d: any, index: number) => {
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
              fill="rgba(23, 233, 217, .5)"
            />
          );
        })}
      </Group>
    </svg>
  );
}