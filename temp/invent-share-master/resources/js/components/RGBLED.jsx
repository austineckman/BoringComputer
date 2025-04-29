import React, {useEffect, useRef, useState, Fragment} from 'react';
import {
    ReactRGBLEDComponent
} from "../inventr-component-lib.es.js";
import Moveable from "react-moveable";
import {createPortal} from "react-dom";
import ledColorOptions from "./constants/LedColorOptions.jsx";
import CommonComponentOptions from "./CommonComponentOptions.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import {triggerRedraw, getTranslate} from "./utils/Utils.jsx";
import {useDragOrRotate} from "../hooks/useDragOrRotateHandler.jsx";
export default function RGBLED({ componentData, handleDeleteComponent, handleMouseDown, showMenu, onPinClicked, isActive }) {

    const targetRef = useRef();
    const moveableRef = useRef();
    const oldDataRef = useRef();

    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    const [ledRed, setLedRed] = useState(componentData.attrs.ledRed);//the color of the LED
    const [ledGreen, setLedGreen] = useState(componentData.attrs.ledGreen);//the color of the LED
    const [ledBlue, setLedBlue] = useState(componentData.attrs.ledBlue);//the color of the LED
    const [commonPin, setCommonPin] = useState(componentData.attrs.ledBlue);//the color of the LED
    const [rotationAngle, setRotationAngle] = useState(componentData.attrs.rotate);//the rotation angle of the component
    const [posTop, setPosTop] = useState(componentData.attrs.top);//the top position component
    const [posLeft, setPosLeft] = useState(componentData.attrs.left);//the left position component
    const [isDragged, setIsDragged] = useState(false);//wither the component is currently being dragged.
    const [pinInfo, setPinInfo] = useState();//the pin info coming from the library component LedElement.
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


    const onPinInfoChange = (e) => {
        setPinInfo(e.detail);
    }

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
            <div >
                <ReactRGBLEDComponent id={componentData.id}
                                      className="min-w-min cursor-pointer absolute"
                                      onPininfoChange={(e)=>onPinInfoChange(e)}
                                      onPinClicked={onPinClicked}
                                      isActive={isActive}
                                      isDragged={isDragged}
                                      ledRed={ledRed}
                                      ledGreen={ledGreen}
                                      ledBlue={ledBlue}
                                      controlPin={commonPin}
                                      rotationTransform={rotationAngle}
                                      ref={targetRef}
                                      onMouseDown={(e)=> {
                                          e.stopPropagation();
                                          handleMouseDown(componentData.id)
                                      }}
                                      style={{
                                          'transform': `translate(${initPosLeft}px, ${initPosTop}px)`,
                                          'zIndex': isDragged? 99999: componentData.attrs.zIndex
                                      }}
                ></ReactRGBLEDComponent>
            </div>
            {isComponentMenuShowing && isActive && createPortal(
                <>
                    {/*<div className="mr-2 ">*/}
                    {/*    <label htmlFor="red-value"*/}
                    {/*           className="block text-sm font-medium text-gray-700">Red</label>*/}
                    {/*    <input name="red-value"*/}
                    {/*           step="0.01" min={0} max={1} type='number' value={ledRed}*/}
                    {/*           onChange={e => setLedRed(e.target.value)}*/}
                    {/*           className="rounded border-0 w-24 min-w-0 "/>*/}
                    {/*</div>*/}
                    {/*<div className="mr-2 ">*/}
                    {/*    <label htmlFor="green-value"*/}
                    {/*           className="block text-sm font-medium text-gray-700">Green</label>*/}
                    {/*    <input name="green-value"*/}
                    {/*           step="0.01" min={0} max={1} type='number' value={ledGreen}*/}
                    {/*           onChange={e => setLedGreen(e.target.value)}*/}
                    {/*           className="rounded border-0 w-24 min-w-0 "/>*/}
                    {/*</div>*/}
                    {/*<div className="mr-2">*/}
                    {/*    <label htmlFor="blue-value"*/}
                    {/*           className="block text-sm font-medium text-gray-700">Blue</label>*/}
                    {/*    <input name="blue-value"*/}
                    {/*           step="0.01" min={0} max={1} type='number' value={ledBlue}*/}
                    {/*           onChange={e => setLedBlue(e.target.value)}*/}
                    {/*           className="rounded border-0 w-24"/>*/}
                    {/*</div>*/}
                    {/*<div className="">*/}
                    {/*    <label htmlFor="common-pin"*/}
                    {/*           className="block text-sm font-medium text-gray-700 flex-nowrap">Common Pin</label>*/}
                    {/*    <select onChange={e => setCommonPin(e.target.value)}*/}
                    {/*            name="common-pin" className="rounded border-0">*/}
                    {/*        <option value="anode">Anode</option>*/}
                    {/*        <option value="cathode">Cathode</option>*/}
                    {/*    </select>*/}
                    {/*</div>*/}


                    <CommonComponentOptions handleDeleteComponent={handleDeleteComponent}
                                            handleRotate={handleRotate}
                                            componentData={componentData}
                                            showDescription={true}></CommonComponentOptions>
                </>,
                document.querySelector('#component-context-menu')
            )}
        </>
    )
}
