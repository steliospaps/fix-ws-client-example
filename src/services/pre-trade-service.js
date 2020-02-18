import { useEffect } from 'react';

export default function PreTradeServiceComponent({ service, onMessage, onOpen, onError, onClose }) {
  useEffect(() => {
    if (service) {
      service.fixpWebsocket.onopen = () => {
        onOpen();
      }

      service.fixpWebsocket.onerror = () => {
        onError();
      }

      service.fixpWebsocket.onclose = () => {
        onClose();
      }

      service.fixpWebsocket.onmessage = ({ data }) => {
        onMessage(JSON.parse(data));
      }
    }
  })

  return null;
}
