import React, {useEffect, useRef, useState, Fragment} from 'react';
import {
    ReactLEDElement
} from "../inventr-component-lib.es.js";
import Moveable from "react-moveable";
import {createPortal} from "react-dom";
// import ledColorOptions from "./constants/LedColorOptions.jsx";
import CommonComponentOptions from "./CommonComponentOptions.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import {getTranslate, triggerRedraw} from "./utils/Utils.jsx";
import {useDragOrRotate} from "../hooks/useDragOrRotateHandler.jsx";

export default function LED({ componentData, handleDeleteComponent, handleMouseDown, showMenu, onPinClicked, isActive }) {

    const targetRef = useRef();
    const moveableRef = useRef();
    const oldDataRef = useRef();

    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    // const [ledValue, setLedValue] = useState(componentData.attrs.value);//wether the LED is on or off NOTE: functional but not in use atm.
    const [ledColor, setLedColor] = useState(componentData.attrs.color);//the color of the LED NOTE: functional but not in use atm.
    const [rotationAngle, setRotationAngle] = useState(componentData.attrs.rotate);//the rotation angle of the component
    const [pinInfo, setPinInfo] = useState();//the pin info coming from the library component LedElement.
    // const colorOptions = ledColorOptions();//NOTE: functional but not in use atm.
    const [isDragged, setIsDragged] = useState(false);//wether the component is currently being dragged.
    const [posTop, setPosTop] = useState(componentData.attrs.top);//the top position component
    const [posLeft, setPosLeft] = useState(componentData.attrs.left);//the left position component
    const [initPosTop, setInitPosTop] = useState(componentData.attrs.top);//the top position component
    const [initPosLeft, setInitPosLeft] = useState(componentData.attrs.left);//the left position component

    //Hooks
    const onDragOrRotate = useDragOrRotate(setPosTop, setPosLeft);

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
    }, [pinInfo, posTop, posLeft]);


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

            <ReactLEDElement id={componentData.id}
                             className="min-w-min cursor-pointer absolute"
                             ref={targetRef}
                             onMouseDown={(e)=> {
                                 e.stopPropagation();
                                 handleMouseDown(componentData.id)
                             }}
                             onPinClicked={onPinClicked}
                             onPininfoChange={(e)=>onPinInfoChange(e)}
                             style={{
                                 'transform': `translate(${initPosLeft}px, ${initPosTop}px)`,
                                 'zIndex': isDragged? 99999: componentData.attrs.zIndex}}
                             color={ledColor}
                             flip={false}
                             isActive={isActive}
                             isDragged={isDragged}
                             rotationTransform={rotationAngle}
                             brightness={componentData.attrs.brightness}
                             value={componentData.attrs.value}
            ></ReactLEDElement>

            {isComponentMenuShowing && isActive && createPortal(
                <>
                    {/*//NOTE: Functional but not used atm.*/}
                    {/*<div className="flex-row ">*/}
                    {/*    <label htmlFor="led-value"*/}
                    {/*           className="block text-sm font-medium text-gray-700">Select*/}
                    {/*        color</label>*/}
                    {/*    {colorOptions.map((color, index) => {*/}
                    {/*        return <button onClick={(e) => {*/}
                    {/*            setLedColor(e.target.dataset.value)*/}
                    {/*        }}*/}
                    {/*                       data-value={color.value}*/}
                    {/*                       className={'inline-flex m-1 w-6 h-6 rounded border justify-center border-white hover:border-2 bg-' + (color.value + (color.value !== 'white' ? '-500' : '') + (ledColor === color.value ? ' border-4' : ' '))}*/}
                    {/*                       key={'led-col-opt' + index}></button>*/}
                    {/*    })}*/}
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
