import React, {useEffect, useRef, useState, Fragment} from 'react';
import _ from 'lodash';
import { Transition } from '@headlessui/react';
import {
    ReactResistorComponent
} from "../inventr-component-lib.es.js";
import Moveable from "react-moveable";
import {createPortal} from "react-dom";
import CommonComponentOptions from "./CommonComponentOptions.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import {triggerRedraw, getTranslate} from "./utils/Utils.jsx";
import {useDragOrRotate} from "../hooks/useDragOrRotateHandler.jsx";

// Introduced constants
const RESISTOR_UNITS = {
    OHM: 'ohm',
    KILOHM: 'kilohm',
    MEGAOHM: 'megaohm'
};

export default function Resistor({ handleDeleteComponent, componentData, handleMouseDown, showMenu, onPinClicked, isActive }) {

    const targetRef= useRef();
    const moveableRef = useRef();
    const oldDataRef = useRef();

    const [resistorValue, setResistorValue] = useState(componentData.attrs.value);
    const [inputResistorValue, setInputResistorValue] = useState(componentData.attrs.value);
    const [resistorValueUnit, setResistorValueUnit] = useState(RESISTOR_UNITS.KILOHM);
    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(componentData.attrs.rotate);//the rotation angle of the component
    const [posTop, setPosTop] = useState(componentData.attrs.top);//the top position component
    const [posLeft, setPosLeft] = useState(componentData.attrs.left);//the left position component
    const [isDragged, setIsDragged] = useState(false);//wether the component is currently being dragged.
    const [pinInfo, setPinInfo] = useState(false);//wether the component is currently being dragged.
    const [initPosTop, setInitPosTop] = useState(componentData.attrs.top);//the top position component
    const [initPosLeft, setInitPosLeft] = useState(componentData.attrs.left);//the left position component

    //Hooks
    const onDragOrRotate = useDragOrRotate(setPosTop, setPosLeft);

    /**
    /**
     * The two useEffect hooks ensure that whenever resistorValue and resistorValueUnit change, the proper calculation
     * is made and the state is set accordingly.
     */
    useEffect(() => {
        // console.log(resistorValue);
        calculateResistorValue(inputResistorValue, resistorValueUnit)
    }, [inputResistorValue, resistorValueUnit]);

    useEffect(() => {
        setTimeout(() => {
            setIsComponentMenuShowing(showMenu);
        }, 100);

    }, [showMenu]);

    //rotate component when rotation angle is changed
    // useEffect(() => {
    //     if (moveableRef.current) {
    //         moveableRef.current.request("rotatable", { rotate: rotationAngle }, true);
    //         // triggerRedraw(targetRef, oldDataRef, componentData, pinInfo, posTop, posLeft, rotationAngle, true);
    //     }
    // }, [moveableRef.current, rotationAngle]);

    /**
     * if parameters change event redraw the diagram.
     */
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

    /**
     * Calculates and sets the resistor value based on the given new value and unit type.
     *
     * @param {number} newValue - The new value of the resistor.
     * @param {string} unitType - The unit type of the value ('ohm', 'kilohm', 'megaohm').
     * @returns {void}
     */
    const calculateResistorValue = (newValue, unitType) => {
        switch (unitType) {
            case RESISTOR_UNITS.OHM:
                setResistorValue(newValue);
                break;
            case RESISTOR_UNITS.KILOHM:
                setResistorValue(newValue / 1000);
                break;
            case RESISTOR_UNITS.MEGAOHM:
                setResistorValue(newValue / 1000000);
                break;
        }
    }



    /**
     * Sets the resistor value unit and triggers the onResistorValueChange function.
     * NOTE: Currently not hooked in but functional.
     * @param {string} newVal - The new resistor value unit.
     */
    const onResistorUnitsChange = (newVal) => {
        setResistorValueUnit(newVal);
    }

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
                <ReactResistorComponent id={componentData.id}
                                        isActive={isActive}
                                        isDragged={isDragged}
                                        onPinClicked={onPinClicked}
                                        onPininfoChange={(e)=>onPinInfoChange(e)}
                                        rotationTransform={rotationAngle}
                                        ref={targetRef}
                                        onMouseDown={(e)=> {
                                            e.stopPropagation();
                                            handleMouseDown(componentData.id)
                                        }}
                                        style={{
                                            'transform': `translate(${initPosLeft}px, ${initPosTop}px) rotate(${rotationAngle}deg)`,
                                            'zIndex': isDragged? 99999: componentData.attrs.zIndex
                                        }}
                                        className={'blah absolute min-w-min cursor-pointer'}
                                        value={resistorValue}></ReactResistorComponent>
            {isComponentMenuShowing && isActive && createPortal(
                <>
                    {/*NOTE: Currently not hooked in but functional.*/}
                    <div className="flex flex-none py-4">
                        <div>
                            <label htmlFor="resistor-value"
                                   className="block text-sm font-medium text-gray-700">Value</label>
                            <input step="100" min={0} type='number' value={inputResistorValue}
                                   onChange={e => setInputResistorValue(e.target.value)} name="resistor-value"
                                   className="rounded border-0 w-24"/>
                        </div>

                        <div className="ml-2">
                            <label htmlFor="resistor-units"
                                   className="block text-sm font-medium text-gray-700">Units</label>
                            <select onChange={e => onResistorUnitsChange(e.target.value)}
                                    name="resistor-units" className="rounded border-0 w-24">
                                <option value="ohm">Ω</option>
                                <option value="kilohm">KΩ</option>
                                <option value="megaohm">MΩ</option>
                            </select>
                        </div>
                    </div>


                    <CommonComponentOptions handleDeleteComponent={handleDeleteComponent}
                                            handleRotate={handleRotate}
                                            componentData={componentData}></CommonComponentOptions>
                </>,
                document.querySelector('#component-context-menu')
            )}
        </>
    )
}
