import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

import ChartCandlestick from './chart-candlestick';

import "react-datepicker/dist/react-datepicker.css";

const RESOLUTION = {
  DAY: "DAY",
  HOUR: "HOUR"
};

export const CHART_DATE_FORMAT = "yyyyMMdd-hh:mm:ss.SSS";

export default function Charts(props) {
  const { isLoginSuccessful, onRequestChartsSnapshot, service } = props;
  const [ symbol, setSymbol ] = useState('');
  const [ startDate, setStartDate ] = useState('');
  const [ endDate, setEndDate ] = useState('');
  const [ formattedStartDate, setFormattedStartDate ] = useState('');
  const [ formattedEndDate, setFormattedEndDate ] = useState('');
  const [ chartInterval, setChartInterval ] = useState(RESOLUTION.DAY);
  const [ chartReqId, setChartReqId ] = useState("0");

  useEffect(() => {
    if (isLoginSuccessful && formattedStartDate === '' && formattedEndDate === '') {
      let monthBefore = new Date();
      monthBefore.setMonth(monthBefore.getMonth() - 1);
      const newChartReqId = String(parseInt(chartReqId) + 1);
      setFormattedStartDate(format(monthBefore, CHART_DATE_FORMAT));
      setFormattedEndDate(format(new Date(), CHART_DATE_FORMAT));
      setChartReqId(newChartReqId);
      service.getChartsSnapshot({
        symbol,
        startDate: format(monthBefore, CHART_DATE_FORMAT),
        endDate: format(new Date(), CHART_DATE_FORMAT),
        interval: chartInterval,
        reqId: chartReqId
      });
    }
  }, [isLoginSuccessful, chartInterval, chartReqId, onRequestChartsSnapshot, symbol, formattedStartDate, formattedEndDate, service]);

  function handleStartDateChange(e) {
    setStartDate(e);
    setFormattedStartDate(format(e, CHART_DATE_FORMAT));
  }

  function handleEndDateChange(e) {
    setEndDate(e);
    setFormattedEndDate(format(e, CHART_DATE_FORMAT));
  }

  function handleSymbolChange(e) {
    setSymbol(e.target.value);
  }

  function handleIntervalChange(e) {
    setChartInterval(e.target.value);
  }

  function generateChart() {
    const newChartReqId = String(parseInt(chartReqId) + 1);
    setChartReqId(newChartReqId);
    service.getChartsSnapshot({
      symbol,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      interval: chartInterval,
      reqId: chartReqId
    });
  }

  return (
    <div>
      {props.isLoginSuccessful ? (
        <div>
          <h3>Request snapshot</h3>
          <label>Symbol</label><input type="text" value={symbol} onChange={handleSymbolChange} onInput={handleSymbolChange}/>
          <label>Start date</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            showTimeSelect
            timeFormat="hh:mm"
            timeIntervals={30}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          <label>End date</label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            showTimeSelect
            timeFormat="hh:mm"
            timeIntervals={30}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          <select onChange={handleIntervalChange}>
            <option value={RESOLUTION.DAY}>Daily</option>
            <option value={RESOLUTION.HOUR}>Hourly</option>
          </select>
          <input type="button" value="Generate chart" onClick={generateChart}/>

          <h3>Chart Preview</h3>
          <ChartCandlestick
            data={props.candleData}
          />
        </div>
      ) : (
        <div>Please login to view charts</div>
      )}

    </div>
  )
  // }
}
