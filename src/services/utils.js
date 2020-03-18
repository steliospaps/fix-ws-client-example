import * as Timestamp from 'timestamp-nano';
import { format } from 'date-fns';
import { DATETIME_FORMAT } from './websocket-connection';

export function buildMsgType(MsgType) {
    return { MsgType, ApplVerID: "FIX50SP2", SendingTime: generateSendingTime() };
}

export function generateSendingTime() {
  return format(new Date(), DATETIME_FORMAT);
}

export function generateTimestamp() {
  const date = Timestamp.fromDate(new Date());
  return parseInt(String(date.getTimeT()) + String(date.getNano()));
}

