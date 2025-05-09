import randomColor from "../helpers/RandomColorOption.jsx";
import {ProjectContext} from "./ProjectDataProvider.jsx";
import {useContext} from "react";
import _ from "lodash";

/**
 * Generates a random string of characters.
 *
 * @param {number} length - The length of the generated string.
 * @returns {string} The random string of characters with the specified length.
 */
export const makeId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


export const triggerRedraw = (targetRef, oldDataRef, componentData, pinInfo, posTop, posLeft, rotationAngle, force = false) => {
    const newData = {
        ...componentData,
        attrs: {
            ...componentData.attrs,
            top: posTop,
            left: posLeft,
            rotate: rotationAngle
        }
    };

    // console.log(componentData, newData)

    // If old data and new data are deeply equal, no redraw is necessary - return early
    if (force === false && _.isEqual(oldDataRef.current, newData)) {
        return;
    }
    const myEvt = new CustomEvent('redraw-connections', {
        detail: newData
    });

    targetRef.current.offsetParent.dispatchEvent(myEvt);

    // Update oldDataRef.current to be newData for the next call
    oldDataRef.current = newData;
}


export const browserDetect = () => {
    var agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
        case agent.indexOf("edge") > -1: return "edge";
        case agent.indexOf("opr") > -1 && !!window.opr: return "opera";
        case agent.indexOf("chrome") > -1 && !!window.chrome: return "chrome";
        case agent.indexOf("trident") > -1: return "ie";
        case agent.indexOf("firefox") > -1: return "firefox";
        case agent.indexOf("safari") > -1: return "safari";
        default: return "other";
    }
}

export const getTranslate = (transform) => {
    const arr = transform.split(/[()]/);
    const translate = arr[1].split(",");
    return translate.map(v => parseFloat(v));
}
