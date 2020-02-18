import React from 'react';
import { ChartCanvas, Chart } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { parse } from 'date-fns';
import { last } from "react-stockcharts/lib/utils";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { MouseCoordinateX, MouseCoordinateY, CrossHairCursor, EdgeIndicator } from "react-stockcharts/lib/coordinates";
import { CHART_DATE_FORMAT } from './charts';

export default function ChartCandlestick({ data: candleData, direction, width, latestTick }) {
  let parsedData = candleData.map((candle) => {
    const { High, Low, First, Last, EndDate } = candle;
    let parsedDate = parse(EndDate, CHART_DATE_FORMAT, new Date());
    return {
      date: parsedDate,
      open: +First[direction],
      close: +Last[direction],
      high: +High[direction],
      low: +Low[direction]
    }
  });

  if (latestTick) {
    const { High, Low, First, Last } = latestTick;
    parsedData[parsedData.length - 1] = {
      ...parsedData[parsedData.length - 1],
      open: +First[direction],
      close: +Last[direction],
      high: +High[direction],
      low: +Low[direction]
    }
  }

  const xScaleProvider = discontinuousTimeScaleProvider;
  const {
    data,
    xScale,
    xAccessor,
    displayXAccessor,
  } = xScaleProvider(parsedData);

  const xExtents = [
    xAccessor(last(data)),
    xAccessor(data[0])
  ];

  const height = 400;

  const margin = { left: 50, right: 50, top: 10, bottom: 30 };
  const gridHeight = height - margin.top - margin.bottom;
  const gridWidth = width - margin.left - margin.right;
  const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 };
  const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 };
  const zoomEvent = true;

  return (
    <div className="chart-candlestick-container">
      {candleData.length > 0 && 
      <ChartCanvas 
        height={height}
        ratio={1}
        width={width}
        margin={margin}
        type={"hybrid"}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >

        <Chart id={1} yExtents={d => [d.high, d.low]}>
          <XAxis 
            axisAt="bottom" 
            orient="bottom" 
            ticks={7} 
            zoomEnabled={zoomEvent}
            {...xGrid} 
          />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%d %b")} />
          <YAxis 
            axisAt="left"
            orient="left"
            ticks={7}
            zoomEnabled={zoomEvent}
            tickFormat={e => e.toPrecision(6)}
            {...yGrid}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")} 
            zoomEnabled={zoomEvent}/>
          <CandlestickSeries />
          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            fontSize={11}
            displayFormat={n => n.toPrecision(6)}
            yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
      }
    </div>
  );
}
