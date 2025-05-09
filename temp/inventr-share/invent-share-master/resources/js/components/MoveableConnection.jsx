import Moveable from "react-moveable";
import {PathLine} from "react-svg-pathline";
import { useState, useEffect } from "react";
import {createPortal} from "react-dom";
import randomColor from "./helpers/RandomColorOption.jsx";
import MOVE_SETTINGS from "./constants/settings.jsx";
import wireColorOptions from "./constants/WireColorOptions.jsx";

export default function MoveableConnection({connectionData, path, handleMouseDown, handleDelete, showMenu, handleColorChange, isActive, zIndex}) {
    const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
    const [conColor, setConColor] = useState(connectionData.color);//the color of the LED
    const colorOptions = wireColorOptions();
    const [isDragged, setIsDragged] = useState(false);//wither the component is currently being dragged.
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsComponentMenuShowing(showMenu);
        }, 100);

    }, [showMenu]);

    return (
        <>
            <g id={connectionData.id}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
                style={(isHovered || isActive) && !isDragged ? {filter: `drop-shadow(0 0 3px ${conColor})`} : {}}
               className={((isActive && !isDragged) ? 'active' : '',' mPath cursor-pointer relative')}>
                <PathLine
                    points={path}
                    stroke={conColor}
                    strokeWidth="3"
                    fill="none"
                    r={4}
                />
                <PathLine
                    style={{
                        pointerEvents: "visibleStroke"  // this ensures this element will receive mouse events
                    }}
                    onMouseDown={(e)=> {
                        console.log('connection clicked');
                        e.nativeEvent.stopImmediatePropagation();
                        handleMouseDown(connectionData.id, true, true);}}
                    points={path}
                    stroke={'transparent'}
                    strokeWidth="12"
                    fill="none"
                    r={4}
                />
            </g>
            {isComponentMenuShowing && isActive && createPortal(
                <>
                    <div className="flex-row ">
                        <label className="block text-sm font-medium text-gray-700">Select color</label>
                        {colorOptions.map((color, index) => {
                            return <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newColor = e.target.dataset.value;
                                    setConColor(newColor)
                                    handleColorChange(newColor); // update the color in the context
                                }}
                               data-value={color.value}
                               className={'inline-flex m-1 w-6 h-6 rounded border justify-center border-white hover:border-2'}
                               style={{backgroundColor:color.value,
                                   border: conColor === color.value ? '3px solid white' : '1px solid white'}}
                               key={'led-col-opt' + index}></button>
                        })}
                    </div>
                    <div className={'flex items-center h-full'}>
                        <div className="p-2 cursor-pointer ml-1 mt-2" onClick={(e) => handleDelete(connectionData.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="w-5 h-5"
                                 viewBox="0 0 448 512">
                                <path
                                    d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
                            </svg>
                        </div>
                    </div>

                </>,
                document.querySelector('#component-context-menu')
            )}
        </>
    );
}
