import React, {useState} from 'react';
import {Col, Row} from "shards-react";
import QuoteButton from './quote-button';
import '../styles/quote.css';

const DIRECTION = {
  BID: "BID",
  ASK: "ASK",
}

export default function Quote(props) {
  const { symbol, buy, sell, onDirectionClick, className} = props;
  const [ buyClass ] = useState("quote-buy");
  const [ sellClass ] = useState("quote-sell");

  function handleClick(direction) {
    onDirectionClick({ direction, symbol });
  }

  return (
    <Col sm="6" md="6" lg="3" className="quote-container">
      <Row>
        <Col className="quote-symbol">
          {symbol}
        </Col>
      </Row>
      <Row className={`quote-directions ${className}`}>
        <QuoteButton className={buyClass}
          value={buy.toFixed(6)}
          direction={DIRECTION.BID}
          onClick={handleClick}
        />
        <QuoteButton className={sellClass}
          value={sell.toFixed(6)}
          direction={DIRECTION.ASK}
          onClick={handleClick}
        />
      </Row>
    </Col>
  );
}
