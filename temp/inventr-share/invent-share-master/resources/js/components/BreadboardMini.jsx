import React, {useEffect, useRef, useState, Fragment} from 'react';
import {
    ReactBreadboardMini,
    ReactBuzzerComponent,
    ReactHeroBoardElement
} from "../inventr-component-lib.es.js";
import Moveable from "react-moveable";
import {createPortal} from "react-dom";
import CommonComponentOptions from "./CommonComponentOptions.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import {getTranslate, triggerRedraw} from "./utils/Utils.jsx";
import {useDragOrRotate} from "../hooks/useDragOrRotateHandler.jsx";

export default function BreadboardMini({ componentData, handleDeleteComponent, handleMouseDown, showMenu, onPinClicked, isActive }) {

    const targetRef = useRef();
    const moveableRef = useRef();
    const oldDataRef = useRef();

    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(componentData.attrs.rotate);//the rotation angle of the component
    const [posTop, setPosTop] = useState(componentData.attrs.top);//the top position component
    const [posLeft, setPosLeft] = useState(componentData.attrs.left);//the left position component
    const [isDragged, setIsDragged] = useState(false);//wither the component is currently being dragged.
    const [pinInfo, setPinInfo] = useState([]);//wither the component is currently being dragged.
    const [initPosTop, setInitPosTop] = useState(componentData.attrs.top);//the top position component
    const [initPosLeft, setInitPosLeft] = useState(componentData.attrs.left);//the left position component

    //Hooks
    const onDragOrRotate = useDragOrRotate(setPosTop, setPosLeft);

    /**
     * Rotate the handle by 90 degrees.
     *
     * @function
     * @name handleRotate
     * @returns {undefined}
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

            <ReactBreadboardMini
                id={componentData.id}
                ref={targetRef}
                isActive={isActive}
                isDragged={isDragged}
                onPininfoChange={(e)=>onPinInfoChange(e)}
                onPinClicked={onPinClicked}
                onMouseDown={(e)=> {
                    e.stopPropagation();
                    handleMouseDown(componentData.id, true)
                }}
                className={'absolute min-w-min cursor-pointer'}
                style={{
                    'transform': `translate(${initPosLeft}px, ${initPosTop}px)`,
                    'zIndex': isDragged? 99999: componentData.attrs.zIndex}}
                rotationTransform={rotationAngle}
                hasSignal={componentData.attrs.hasSignal}
            ></ReactBreadboardMini>

            {isComponentMenuShowing && isActive && createPortal(
                <>
                    <CommonComponentOptions handleDeleteComponent={handleDeleteComponent}
                                            handleRotate={handleRotate}
                                            componentData={componentData}></CommonComponentOptions>
                </>,
                document.querySelector('#component-context-menu')
            )}
        </>
    )
}
