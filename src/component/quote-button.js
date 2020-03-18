import React from 'react';
import {Col, Row} from 'shards-react';
import '../styles/quote-button.css';

export default function QuoteButton({ direction, value, onClick, className}) {
  function handleClick() {
    onClick({ direction, value });
  }

  return (
    <Col onClick={() => handleClick()} className={`${className} quote-button-container`}>
      <Row>
        <Col className="quote-button-value">
          {value}
        </Col>
      </Row>
      <Row>
        <Col className="quote-button-label">
          {direction}
        </Col>
      </Row>
    </Col>
  );
}
