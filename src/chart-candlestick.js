import React from 'react';
import { ChartCanvas, Chart } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { parse } from 'date-fns';
import { last } from "react-stockcharts/lib/utils";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { MouseCoordinateX, MouseCoordinateY } from "react-stockcharts/lib/coordinates";
import { CHART_DATE_FORMAT } from './charts';

export default function ChartCandlestick(props) {

  const parsedData = props.data.map((candle, index) => {
    const { High, Low, First, Last, StartDate } = candle;
    let parsedDate = parse(StartDate, CHART_DATE_FORMAT, new Date());
    parsedDate.setDate(parsedDate.getDate() + index);

    return {
      date: parsedDate,
      open: +First.Bid,
      close: +Last.Bid,
      high: +High.Bid,
      low: +Low.Bid
    }
  });

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

  const width = 900;
  const height = 400;

  const margin = { left: 100, right: 50, top: 10, bottom: 30 };
  const gridHeight = height - margin.top - margin.bottom;
  const gridWidth = width - margin.left - margin.right;
  const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 };
  const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 };
  const zoomEvent = true;

  return (
    <div>
      <div>chart candlestick</div>
      {props.data.length > 0 && 
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
            displayFormat={timeFormat("%Y-%m-%d")} />
          <YAxis 
            axisAt="left"
            orient="left"
            ticks={7}
            zoomEnabled={zoomEvent}
            {...yGrid}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")} 
            zoomEnabled={zoomEvent}/>
          <CandlestickSeries />
        </Chart>
      </ChartCanvas>
      }
    </div>
  );
}
