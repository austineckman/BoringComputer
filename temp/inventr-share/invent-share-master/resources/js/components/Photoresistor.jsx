import React, {useEffect, useRef, useState, Fragment} from 'react';
import { Transition } from '@headlessui/react';
import {
    ReactPhotoresistor
} from "../inventr-component-lib.es.js";
import Moveable from "react-moveable";
import {createPortal} from "react-dom";
import CommonComponentOptions from "./CommonComponentOptions.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import {getTranslate, triggerRedraw} from "./utils/Utils.jsx";
import {useDragOrRotate} from "../hooks/useDragOrRotateHandler.jsx";

export default function Photoresistor({ value, handleDeleteComponent, componentData, handleMouseDown, showMenu, onPinClicked, isActive }) {

    const targetRef= useRef();
    const moveableRef = useRef();
    const oldDataRef = useRef();

    const [lightValue, setLightValue] = useState(value);
    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(componentData.attrs.rotate);//the rotation angle of the component
    const [posTop, setPosTop] = useState(componentData.attrs.top);//the top position component
    const [posLeft, setPosLeft] = useState(componentData.attrs.left);//the left position component
    const [isDragged, setIsDragged] = useState(false);//wither the component is currently being dragged.
    const [pinInfo, setPinInfo] = useState(false);//wither the component is currently being dragged.
    const [initPosTop, setInitPosTop] = useState(componentData.attrs.top);//the top position component
    const [initPosLeft, setInitPosLeft] = useState(componentData.attrs.left);//the left position component

    //Hooks
    const onDragOrRotate = useDragOrRotate(setPosTop, setPosLeft);

    /**
     * Watch for menu display indication
     */
    useEffect(() => {
        setTimeout(() => {
            setIsComponentMenuShowing(showMenu);
        }, 100);

    }, [showMenu]);

    //rotate component when rotation angle is changed
    useEffect(() => {
        if (moveableRef.current) {
            moveableRef.current.request("rotatable", { rotate: rotationAngle }, true);
            triggerRedraw(targetRef, oldDataRef, componentData, pinInfo, posTop, posLeft, rotationAngle, true);
        }
    }, [moveableRef.current, rotationAngle]);

    useEffect(() => {
        triggerRedraw(targetRef, oldDataRef, componentData, pinInfo, posTop, posLeft, rotationAngle);
    }, [pinInfo, posTop,posLeft]);

    const onPinInfoChange = (e) => {
        setPinInfo(e.detail);
    }

    /**
     * Rotate the handle by 90 degrees.
     *
     * @function
     * @name handleRotate
     * @returns {undefined}
     */
    const handleRotate = () => {
        setRotationAngle((rotationAngle + 90) % 360);
    };


    // Render
    return (
        <>
            <Moveable
                ref={moveableRef}
                target={targetRef}
                draggable={MOVE_SETTINGS.DRAGGABLE}
                snappable={MOVE_SETTINGS.SNAPPABLE}
                throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
                rotatable={MOVE_SETTINGS.ROTATABLE}
                onDrag={onDragOrRotate}
                onRotate={onDragOrRotate}
                onDragStart={()=>setIsDragged(true)}
                onDragEnd={()=>setIsDragged(false)}
            ></Moveable>

            <ReactPhotoresistor width="36px"
                                ref={targetRef}
                                onMouseDown={(e)=> {
                                    e.stopPropagation();
                                    handleMouseDown(componentData.id)
                                }}
                                style={{
                                    'transform': `translate(${initPosLeft}px, ${initPosTop}px)`,
                                    'zIndex': isDragged? 99999: componentData.attrs.zIndex
                                }}
                                onPininfoChange={(e)=>onPinInfoChange(e)}
                                isActive={isActive}
                                isDragged={isDragged}
                                onPinClicked={onPinClicked}
                                rotationTransform={rotationAngle}
                                id={componentData.id}
                                className="min-w-min cursor-pointer absolute"
                                value={lightValue}></ReactPhotoresistor>

            {isComponentMenuShowing && isActive && createPortal(
                <>
                    {/*//NOTE: Functional but not atm.*/}
                    {/*<div>*/}
                    {/*    <label htmlFor="resistor-value"*/}
                    {/*           className="block text-sm font-medium text-gray-700">Light Value</label>*/}
                    {/*    <input step="1" min={0} type='number' value={lightValue}*/}
                    {/*           onChange={e => setLightValue(e.target.value)} name="resistor-value"*/}
                    {/*           className="rounded border-0 w-24"/>*/}
                    {/*</div>*/}

                    <CommonComponentOptions handleDeleteComponent={handleDeleteComponent}
                                            handleRotate={handleRotate}
                                            componentData={componentData}></CommonComponentOptions>
                </>,
                document.querySelector('#component-context-menu')
            )}
        </>
    )
}
