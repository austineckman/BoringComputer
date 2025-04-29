import {useEffect} from "react";

export function useKeyEventHandler(keyCode, handler) {
    useEffect(() => {
        const keyFunction = (e) => {
            if (e.keyCode === keyCode) {
                handler(e);
            }
        };
        document.addEventListener("keydown", keyFunction);
        return () => {
            document.removeEventListener("keydown", keyFunction);
        };
        // Pass handler and keyCode as dependencies
    }, [handler, keyCode]);
}
