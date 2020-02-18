import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ChartCandlestick from './chart-candlestick';
import "react-datepicker/dist/react-datepicker.css";
import { Button } from 'shards-react';
import ChartService from '../services/chart-service';
import { SUBSCRIPTION_REQUEST_TYPE } from '../services/ig-websocket-service';
import  '../styles/charts.css';
import { usePrevious } from './hooks/custom-hooks';

const RESOLUTION = {
  DAY: "DAY",
  HOUR: "HOUR",
  FIFTEEN_MIN: "FIFTEEN_MIN",
  FIVE_MIN: "FIVE_MIN",
  SECOND: "SECOND",
  TICK: "TICK"
};

const RESOLUTION_SELECTION = {
  DAY: "Day",
  HOUR: "1 hour",
  FIFTEEN_MIN: "15 mins",
  FIVE_MIN: "5 mins",
  SECOND: "1s",
  TICK: "Tick"
}

const DIRECTION = {
  BID: "Bid",
  ASK: "Offer"
}

export const CHART_DATE_FORMAT = "yyyyMMdd-HH:mm:ss.SSS";

export default function Charts({ service, subscribedSymbol, subscribedReqId, symbol, direction, containerWidth, candleSubscriptionData, candleData }) {
  const [ chartInterval, setChartInterval ] = useState(RESOLUTION.DAY);
  const [ chartService, setChartService ] = useState(null);
  const prevSymbol = usePrevious(symbol);
  const prevInterval = usePrevious(chartInterval);

  useEffect(() => {
    if (!chartService) {
      setChartService(new ChartService(service));
    }
  }, [chartService, service]);

  useEffect(() => {
    function requestChartSnapshot(symbol) {
      let startDate = new Date();
      if (chartInterval === RESOLUTION.DAY) {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (chartInterval === RESOLUTION.HOUR || chartInterval === RESOLUTION.FIFTEEN_MIN || chartInterval === RESOLUTION.FIVE_MIN) {
        startDate.setDate(startDate.getDate() - 1);
      } else {
        startDate.setHours(startDate.getHours() - 1);
      }

      chartService.getChartsSnapshot({
        symbol,
        startDate: format(startDate, CHART_DATE_FORMAT),
        endDate: format(new Date(), CHART_DATE_FORMAT),
        interval: chartInterval,
      });
    }

    function isDifferentFromPrevious(current, previous) {
      return ((previous && previous !== current));
    }

    if (chartService && symbol && direction) {
      if (isDifferentFromPrevious(symbol, prevSymbol) || !prevSymbol ||
          isDifferentFromPrevious(chartInterval, prevInterval)) {
        if (prevSymbol) {
          chartService.getChartDataSubscription({
            symbol: prevSymbol,
            interval: prevInterval,
            type: SUBSCRIPTION_REQUEST_TYPE.UNSUBSCRIBE
          });
        }
        requestChartSnapshot(symbol);
        chartService.getChartDataSubscription({
          symbol,
          interval: chartInterval,
          type: SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE
        });
      }
    }

  }, [ symbol, chartInterval, chartService, direction, prevSymbol, prevInterval ]);

  function handleResolutionSelection(resolution) {
    setChartInterval(resolution);
  }

  return (
    <div className="chart-container">
      <div>
        <h3>{symbol}</h3>
        <div className="chart-resolutions">
          {Object.keys(RESOLUTION_SELECTION).map(resolution => 
            <Button theme="secondary" 
              onClick={() => handleResolutionSelection(resolution)} key={resolution}>
              {RESOLUTION_SELECTION[resolution]}
            </Button>
          )}
        </div>
        <ChartCandlestick
          symbol={symbol}
          data={candleData}
          direction={DIRECTION[direction]}
          width={containerWidth}
          latestTick={candleSubscriptionData}
        />
      </div>
    </div>
  )
}
