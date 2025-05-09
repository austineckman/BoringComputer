import { useCallback } from "react";

export const useCustomEvent = (eventName, data = null) => {
    const dispatchEvent = useCallback(() => {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
        console.log('dispatchEvent',event);
    }, [eventName, data]);

    return dispatchEvent;
}

export default useCustomEvent;
