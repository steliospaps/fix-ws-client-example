import React, {useState, useEffect} from "react";
import {Col, Button} from "shards-react";
import InputField from "./ui/input-field";
import OrderService from "../services/order-service";
import SelectField from "./ui/select-field";
import DatePicker from "react-datepicker";
import { DATETIME_FORMAT } from "../services/websocket-connection";
import { format } from 'date-fns';
import "../styles/order.css";

export default function Order({service, priceLevel, side, securityId, errorMessage, orderId, orderStatus, rejectReason}) {
  const [orderService, setOrderService] = useState(null);
  const [price, setPrice] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [orderType, setOrderType] = useState("Market");
  const [timeInForce, setTimeInForce] = useState("FillOrKill");
  const [displayDate, setDisplayDate] = useState(new Date());
  const [goodTillDate, setGoodTillDate] = useState();

  const [lastOrderedId, setLastOrderedId] = useState();

  const [currency, setCurrency] = useState("USD");
  const [account, setAccount] = useState("");

  const [ currentOrderStatus, setCurrentOrderStatus ] = useState();
  const [ confirmTimer, setConfirmTimer ] = useState();

  const [orderTypes] = useState([
    {name: "Market", value: "Market"},
    {name: "Previously Quoted", value: "PreviouslyQuoted"},
    {name: "Limit", value: "Limit"},
    {name: "Stop", value: "Stop"}
  ]);
  const [timeInForces] = useState([
    {name: "Fill or Kill", value: "FillOrKill"},
    {name: "Good Till Cancel", value: "GoodTillCancel"},
    {name: "Good Till Date", value: "GoodTillDate"},
    {name: "Immediate or Cancel", value: "ImmediateOrCancel"},
  ]);

  useEffect(() => {
    if (!orderService && service) {
      setOrderService(new OrderService(service));
    }
  }, [orderService, service]);

  useEffect(() => {
    setPrice(priceLevel);
  }, [priceLevel]);

  useEffect(() => {
    if (lastOrderedId === orderId && !confirmTimer && (orderStatus === "New" || orderStatus === "Rejected")) {
      setCurrentOrderStatus(orderStatus);

      let timeout = setTimeout(() => {
        setCurrentOrderStatus(null);
        setLastOrderedId(null);
        setConfirmTimer(null);
      }, 4000);
      setConfirmTimer(timeout);
    }

    return () => {
      if (confirmTimer) {
        clearTimeout(confirmTimer);
        setConfirmTimer(null);
      }
    }
  }, [orderStatus, orderId, lastOrderedId, confirmTimer]);

  useEffect(() => {
    if (lastOrderedId === orderId && rejectReason && !confirmTimer) {
      setCurrentOrderStatus("Rejected");
      let timeout = setTimeout(() => {
        setCurrentOrderStatus(null);
        setLastOrderedId(null);
        setConfirmTimer(null);
        clearTimeout(timeout);
      }, 4000);
      setConfirmTimer(timeout);
    }

    return () => {
      if (confirmTimer) {
        clearTimeout(confirmTimer);
        setConfirmTimer(null);
      }
    }
  }, [rejectReason, lastOrderedId, orderId, confirmTimer]);

  function handleDateChange(date) {
    setDisplayDate(date);
    setGoodTillDate(format(date, DATETIME_FORMAT));
  }

  function handleClick() {
    let newOrder = {
      price,
      orderQty,
      orderType,
      currency,
      timeInForce,
      side,
      securityId,
      account,
      ...{ goodTillDate }
    };

    if (orderType === "Stop") {
        delete newOrder.price;
        newOrder =  { ...newOrder, stopPx: price };
    }

    setLastOrderedId(orderService.placeOrder(newOrder));
  }

  return (
    <Col className="order">
      <div className="order-form">
        <InputField
          className="order-input-price-level"
          type="number"
          step={0.000001}
          value={price}
          onInput={(e) => setPrice(+e.target.value)}
          onChange={(e) => setPrice(+e.target.value)}
          labelName="Price Level"
        />
        <InputField
          className="order-input-quantity"
          type="number"
          step={1}
          value={orderQty}
          onInput={(e) => setOrderQty(+e.target.value)}
          onChange={(e) => setOrderQty(+e.target.value)}
          labelName="Quantity"
        />
        <SelectField
          options={orderTypes}
          labelName={"Type"}
          id={"order-types"}
          onSelectChanged={(e) => setOrderType(e)}
        />
        <SelectField
          options={timeInForces}
          labelName={"Good Till"}
          id={"time-in-force"}
          onSelectChanged={(e) => setTimeInForce(e)}
        />
        {timeInForce === "GoodTillDate" &&
          <div className="order-good-till-date">
            <label htmlFor="datepicker-good-till-date">
              Date/Time
            </label>
            <div className="order-datepicker-container">
              <DatePicker
                id="datepicker-good-till-date"
                selected={displayDate}
                className={"form-control"}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </div>
        }
        {currentOrderStatus === "New" && <div className="order-confirm">Placed Order!</div>}
        {currentOrderStatus === "Rejected" && errorMessage && <div className="order-error">{errorMessage}</div>}
        <Button className="order-button" onClick={handleClick}>Place Order</Button>
      </div>
    </Col>
  )
}