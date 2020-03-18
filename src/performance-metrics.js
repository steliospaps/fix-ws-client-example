import React, { useEffect, useState } from 'react';

export default function PerformanceMetrics({ quoteMessage }) {
    const [ serverTimeDiff, setServerTimeDiff ] = useState(0);
    const [ pricingServerTimeDiff, setPricingServerTimeDiff ] = useState(0);

    useEffect(() => {
        function setPerformanceMetrics(quoteMessage) {
            const serverTime = new Date(quoteMessage.SendingTime);
            const bidTime = new Date(parseInt(quoteMessage.BidID.substring(0, 13))).getTime();
            const offerTime = new Date(parseInt(quoteMessage.OfferID.substring(0, 13))).getTime();
            const pricingServerTime = bidTime > offerTime ? bidTime : offerTime;
            const date = new Date().getTime();
            const serverTimeDiff = date - serverTime.getTime();
            const pricingServerTimeDiff = date - pricingServerTime;
            setServerTimeDiff(serverTimeDiff);
            setPricingServerTimeDiff(pricingServerTimeDiff);
        }

        if (quoteMessage && quoteMessage.BidID && quoteMessage.OfferID) {
            setPerformanceMetrics(quoteMessage);
        }
    }, [quoteMessage]);

    return (
        <div className="performance-metrics">
        {serverTimeDiff != null && pricingServerTimeDiff != null &&
        <div>
            <div>Transit times:</div>
            <div>Server(ms): {serverTimeDiff} Pricing(ms): {pricingServerTimeDiff}</div>
        </div>
        }
        </div>
    )
}