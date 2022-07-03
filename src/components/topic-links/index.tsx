import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleLog, scaleBand } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { GenericCell } from '@visx/heatmap/lib/types';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';


import type {TopicCollection} from '../../types';
import {labelProps} from '../graphConstants';
import {countTopicLinks}  from './utils';


const heatmapMargin = {x: 220, y: 120};
const verticalTopicLabelProps = {
    ...labelProps,
    textAnchor: 'end',
  } as const;
const cool1 = '#122549';
const cool2 = '#b4fbde';
const background = '#222222';
const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
    color: 'white',
  };


let tooltipTimeout: number;

export type Props = {
  width?: number;
  height?: number;
  topics: TopicCollection;
  minLikelihood: number
};


export const TopicLinks = ({
  width = 1100,
  height = 1000,
  topics,
  minLikelihood
}: Props) => {
    const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<GenericCell<any, any>>();
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
    const rectColorScale = scaleLog<string>({
        range: [cool1, cool2],
        domain: [0.05, 0.15], //heuristic parameters for better colors
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
                    tickLabelProps={() => labelProps}
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
                    {`${tooltipData.bin.bin} + ${tooltipData.datum.bin}:
                    ${Math.round(tooltipData.bin.count*100)}%`}
                </div>

                </TooltipInPortal>
            )}
        </div>
    );
};