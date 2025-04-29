import { useState } from 'react';
import {getTranslate} from "../components/utils/Utils.jsx";

export const useDragOrRotate = (setPosTop, setPosLeft) => {

    const onDragOrRotate = (e) => {
        e.target.style.transform = e.transform;
        let translation = getTranslate(e.transform);
        setPosTop(translation[1]);
        setPosLeft(translation[0]);
    }

    return onDragOrRotate;
};
