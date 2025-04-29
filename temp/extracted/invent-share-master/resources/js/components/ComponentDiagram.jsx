import React, {
    useState,
    useEffect,
    useRef,
    Fragment,
    useContext
} from 'react';
import { Transition } from '@headlessui/react';



import MoveableConnection from "./MoveableConnection.jsx";
import AddComponentFlyoutMenu from "./AddComponentFlyoutMenu.jsx";

import html2canvas from "html2canvas-pro";

import {
    deleteConnectionsOfComponent,
    handleDeleteConnection,
    handleRedrawConnections,
    drawConnection,
    handlePinOnClick,
    handleAddComponent,
    handleDeleteComponent,
} from "./utils/DiagramUtils.jsx";

import {useViewport} from "../hooks/useViewport.jsx";

import { useKeyEventHandler } from "../hooks/useKeyEventHandler.jsx"
import {componentMap} from "./utils/ComponentGenerator.jsx";
import {ProjectContext} from "./utils/ProjectDataProvider.jsx";
import {useProjectDataManager} from "./utils/UseProjectDataManager.jsx";
import {useCustomEvent} from "../hooks/useCustomEvent.jsx";
import BrowserPopup from "./utils/BrowserPopup.jsx";
import {toJSON} from "lodash/seq.js";
import {trimCanvas} from "./utils/TrimCanvas.jsx";

/**
 * Renders a component diagram based on the provided diagram data.
 *
 * @param {Object} diagramData - The data used to render the diagram components.
 * @param {string} diagramData.type - The type of the component.
 * @param {string} diagramData.id - The unique identifier of the component.
 * @param {number} diagramData.top - The top position of the component on the canvas.
 * @param {number} diagramData.left - The left position of the component on the canvas.
 * @param {Object} diagramData.attrs - Additional attributes of the component.
 * @param {string} diagramData.attrs.value - The value of the component.
 * @return {JSX.Element} - The rendered component diagram.
 */
export default function ComponentDiagram({diagramData}) {

    const parentWrapperRef = useRef();
    const graphContainerRef = useRef();
    const drawAreaRef = useRef();

    const [projectContext, setProjectContext] = useContext(ProjectContext);

    const [graphSize, setGraphSize] = useState({'w':0, 'h':0});
    const [isMenuShowing, setIsMenuShowing] = useState(false);
    const [focusedComponentId, setFocusedComponentId] = useState(null);
    const [focusedConnectionId, setFocusedConnectionId] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [middlePins, setMiddlePins] = useState([]);
    const [startPin, setStartPin] = useState(null);
    const [diagramExpanded, setDiagramExpanded] = useState(false);


    // custom infinite workspace logic extracted into its own hook.
    const [
        viewport,
        centerViewport,
        handleDiagramMouseDown,
        handleMouseUp,
        handleMouseMove,
        handleWheel,
        viewportRef
    ] = useViewport(projectContext.diagram.viewport);


    // Creating handlers
    const escapeHandler = () => setIsDrawing(false);
    const backspaceHandler = () => {
        // Code for component or connection deletion here
        if(focusedComponentId !== null) handleDeleteComponentWrapper();
        if(focusedConnectionId !== null) handleDeleteConnectionWrapper();
    };

    //async watch Mounted component only sets workspace dimensions.
    useEffect(() => {
        console.log('mount');
        // Anything in here is fired on component mount.
        setGraphSize({w:graphContainerRef.current.clientWidth * viewport.zoom, h:parentWrapperRef.current.clientHeight * viewportRef.current.zoom});
        graphContainerRef.current.addEventListener('redraw-connections', handleRedrawConnectionsWrapper);

        //for the purpose of clearing focus status on components:
        document.addEventListener('click', onClickEvent);
        document.addEventListener('project-saved', onProjectSaved);
        // saveProjectBtn
        let el = document.getElementById('saveProjectBtn');
        console.log(el);
        if(el) {
            el.addEventListener("click", captureScreenshot);
        }

        return () => {
            // Anything in here is fired on component unmount.
            graphContainerRef.current.removeEventListener('redraw-connections', handleRedrawConnectionsWrapper);
            document.removeEventListener('click', onClickEvent);
            if(el) {
                el.removeEventListener("click", captureScreenshot);
            }
        }
    }, []);

    const onProjectSaved = () => {
        console.log('PROJECT saved');
    }

    /**
     * Captures a screenshot of a specified HTML element and dispatches a custom event with the screenshot data URL.
     *
     * @function captureScreenshot
     */
    const captureScreenshot = () => {
        var canvasPromise = html2canvas(parentWrapperRef.current, {
            useCORS: true,
            backgroundColor:null
        });
        canvasPromise.then((canvas)=> {
            let trimmedCanvas = trimCanvas(canvas);
            if(!trimmedCanvas) return;
            var dataURL = trimmedCanvas.toDataURL("image/png");

            const myEvt = new CustomEvent('save-thumbnail', {
                'detail': dataURL
            });
            document.dispatchEvent(myEvt);
        });
    }

    const undo = (e) => {
        console.log('undo?');
        if (!e.ctrlKey) {
            return;
        }

    };
    const redo = (e) => {
        console.log('undo?');
        if (!e.ctrlKey) {
            return;
        }
    };


    // Using custom hooks
    useKeyEventHandler(27, escapeHandler); // Escape key
    useKeyEventHandler(8, backspaceHandler); // Backspace key
    useKeyEventHandler(90, undo); // ctrl-z keys
    useProjectDataManager( projectContext.connections, projectContext.components);


    /**
     * Adjusts the draw area for the graph container.
     */
    const adjustDrawArea = () => {
        const parentOfGraphContainer = graphContainerRef.current.parentElement;
        if (!parentOfGraphContainer) return;

        const graphContainerPosition = graphContainerRef.current.getBoundingClientRect();
        const graphContainerParentPosition = parentOfGraphContainer.getBoundingClientRect();
        // distances relative to parent
        const dx = (graphContainerParentPosition.x - graphContainerPosition.x)/ viewport.zoom;
        const dy = (graphContainerParentPosition.y - graphContainerPosition.y)/ viewport.zoom;

        let parentWidth = parentOfGraphContainer.clientWidth;
        let parentHeight = parentOfGraphContainer.clientHeight;
        // Adjust drawArea size
        let graphWidth = parentWidth / viewport.zoom;
        let graphHeight = parentHeight / viewport.zoom;
        drawAreaRef.current.style.width = `${graphWidth}px`;
        drawAreaRef.current.style.height = `${graphHeight}px`;
        //Then adjust its viewBox
        drawAreaRef.current.setAttribute('viewBox', `${dx} ${dy} ${graphWidth} ${graphHeight}`);
        // adjust its position to match graph-container using CSS
        drawAreaRef.current.style.top = `${dy}px`;
        drawAreaRef.current.style.left = `${dx}px`;
    }

    useEffect(adjustDrawArea, [viewport.zoom, viewport.offset]);

    /**
     * Closes the menu by setting the values of `isMenuButtonShowing` and `isMenuShowing` to `false`.
     * @function
     *
     * @example
     * handleCloseMenu();
     */
    const handleCloseMenu = () => {
        setIsMenuShowing(false);
    }

    /**
     * Handle opening the menu for a given id
     * this is triggered by a component getting selected/focused upon
     * @param {string} id - The id of the component
     * @param {boolean} [showMenu=true] - Whether to show the menu or not (default: true)
     * @param isConnection
     */
    const handleOpenMenu = (id, showMenu = true, isConnection = false) => {
        if(showMenu){
            setIsMenuShowing(true);
        } else {
            handleCloseMenu();
        }
        if(!isConnection){
            setFocusedComponentId(id);
            setFocusedConnectionId(null);
        }
        else{
            setFocusedComponentId(null);
            setFocusedConnectionId(id);
        }
    }

    /**
     * Function: handleAddComponentWrapper
     * Description: This function is a wrapper function for handleAddComponent. It calls handleAddComponent with the given event, setProjectContext, and projectContext arguments.
     * Params:
     * - e {Event} - The event object.
     * Returns: None
     */
    const handleAddComponentWrapper = (e) => {
        handleAddComponent(e, setProjectContext, projectContext);
    }

    /**
     * Performs the necessary actions when deleting a component.
     *
     * This function calls 2 other functions, `handleDeleteComponent` and `deleteConnectionsOfComponent`, to delete the focused component and its connections. It updates the project context
     * using the `setProjectContext` function provided. Additionally, it closes the menu by calling the `handleCloseMenu` function.
     */
    const handleDeleteComponentWrapper = () => {
        handleDeleteComponent(focusedComponentId, projectContext, setProjectContext);
        deleteConnectionsOfComponent(focusedComponentId, projectContext, setProjectContext);
        handleCloseMenu();
    }

    /**
     * Executes the necessary actions to handle deleting a connection and close the menu.
     *
     * @function handleDeleteConnectionWrapper
     * @returns {void}
     */
    const handleDeleteConnectionWrapper = () => {
        handleDeleteConnection(focusedConnectionId, projectContext, setProjectContext);
        handleCloseMenu();
    }

    /**
     * Wrapper function for handling pin on click event.
     *
     * @param {Event} e - The event object.
     */
    const handlePinOnClickWrapper = (e) => {
        handlePinOnClick(e, projectContext, setProjectContext, startPin, setStartPin, isDrawing, setIsDrawing, viewportRef.current.zoom);
    }

    /**
     * Function to handle redrawing connections.
     *
     * @param {Event} e - The event object.
     */
    const handleRedrawConnectionsWrapper = (e) => {
        // console.log(viewportRef.current);
        handleRedrawConnections(e, projectContext, setProjectContext, viewportRef.current);
    }

    /**
     * Function to handle diagram expansion.
     * It dispatches a custom event "diagram-expand",
     * updates the diagramExpanded state,
     * and centers the viewport based on the graph size.
     */
    const handleExpandDiagram = () => {
        const myEvt = new CustomEvent('diagram-expand');
        window.dispatchEvent(myEvt);
        setDiagramExpanded(!diagramExpanded);
        centerViewport(graphSize.w, graphSize.h);
    }


    /**
     * Handles the click event on the draw area.
     * If isDrawing is true, adds a new middle pin based on the click coordinates.
     * If isDrawing is false, clears the middle pins.
     *
     * @param {event} e - The click event object.
     * @returns {void}
     */
    const onDrawAreaClick = (e) => {
        // console.log('onDrawAreaClick');
        // if(isDrawing === true){
        //     var offset = e.currentTarget.getClientRects()[0];
        //     var x = e.clientX - offset.left;
        //     var y = e.clientY - offset.top;
        //
        //     setMiddlePins([...middlePins, {'x': x, 'y': y}]);
        // }
        // else {
        //     setMiddlePins([]);
        // }
    }

    /**
     * Function to handle the mouse over event and get the X and Y coordinates.
     *
     * @param {Event} e - The mouse over event.
     */
    const onMouseOverXY = (e) => {
        if(isDrawing) {
            var offset = e.currentTarget.parentElement.getClientRects()[0];
            var x = Math.round(e.clientX - offset.left);
            var y = Math.round(e.clientY - offset.top);
        }
    }

    /**
     * Handles the onClick event. If click occurs outside of component-diagram scope, de-selects any active component.
     * @param {Event} e - The event object.
     */
    const onClickEvent = (e) => {
        //console.log(e.target.id, e.target.parentElement.id);
        if( !hasContainerId(e.target, 'graph-container') && !hasContainerId(e.target, 'component-context-menu')) {
            setFocusedComponentId(null);
            setFocusedConnectionId(null);
            setIsMenuShowing(false);

        }
    }

    //TODO:: Put this in the utility if it becomes an oft needed function.
    /**
     * Checks whether an element or any of its parent elements has a specific container id.
     *
     * @param {HTMLElement} element - The element to start the search from.
     * @param {string} idTarget - The container id to check for.
     * @returns {boolean} - Returns `true` if the element or any of its parent elements has the specified container id, `false` otherwise.
     */
    function hasContainerId(element, idTarget) {
        while (element) {
            if (element.id === idTarget) {
                return true;
            }
            element = element.parentElement;
        }
        return false;
    }


    return (
        <div id="dabber" className="flex flex-col h-full relative cursor-pointer">

            {/*Browser Popup Note - Chrome Browser Recco*/}
            <BrowserPopup></BrowserPopup>

            <div className="flex flex-row justify-between">

                <AddComponentFlyoutMenu
                    onCreateClick={handleAddComponentWrapper}>
                </AddComponentFlyoutMenu>

                <div className="p-2">
                    <div id="expandDiagramBtn" className="btn btn-ghost btn-sm text-primary"
                         onMouseDown={handleExpandDiagram}>
                        {diagramExpanded}
                        {!diagramExpanded ?
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                            </svg>
                            :
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M 8.999 4.513 L 8.999 9.013 M 4.499 8.989 L 8.999 8.989 M 3.75 3.75 L 9 9 M 9.049 19.458 L 9.049 14.958 M 4.572 14.889 L 9.072 14.889 M 4.134 19.799 L 9 15 M 19.482 9.027 L 14.982 9.027 M 14.982 4.513 L 14.982 9.013 M 20.25 3.75 L 17.625 6.375 L 15 9 M 19.491 14.987 L 14.991 14.987 M 14.975 19.488 L 14.975 14.988 M 20.25 20.25 L 15 15"></path>
                            </svg>
                        }
                    </div>
                </div>
            </div>

            <div
                ref={parentWrapperRef}
                onMouseDown={handleDiagramMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                onTouchMove={handleWheel}
                className="relative overflow-hidden w-full h-full">

                <div
                    className={'absolute w-full h-full inset-0 overflow-hidden'}>

                    <div id="graph-container"
                         ref={graphContainerRef}
                         style={{
                             transformOrigin:'center',
                             transform: `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.zoom})`
                         }}>
                        {/*className="absolute w-full h-full inset-0"*/}

                        {projectContext?.components?.map((componentData, index) => {
                            const Component = componentMap[componentData.name];
                            // Check if such component exists in map
                            if (Component) {
                                return <Component
                                    isActive={focusedComponentId === componentData.id}
                                    handleMouseDown={handleOpenMenu}
                                    componentData={componentData}
                                    showMenu={isMenuShowing}
                                    onPinClicked={handlePinOnClickWrapper}
                                    key={componentData.id + '-' + index}
                                    handleDeleteComponent={handleDeleteComponentWrapper}
                                />;
                            }
                            // Return null or some default component for unknown component names
                            return null;
                        })}

                        <svg className="drawArea absolute inset-0"
                             ref={drawAreaRef}
                             viewBox={'0 0 ' + graphSize.w + ' ' + graphSize.h}
                             style={{
                                 zIndex:30,
                                 transformOrigin:'center',
                                 width: graphSize.w + 'px',
                                 height: graphSize.h + 'px',
                                 pointerEvents: "none"
                             }}
                             onClick={onDrawAreaClick}
                             onMouseMove={onMouseOverXY}>
                            {projectContext?.connections?.map((connection, index) => {
                                const path = drawConnection(connection.startPin, connection.endPin, viewport);
                                return (
                                    <MoveableConnection key={connection.id + '-' + index}
                                                        zIndex={index + 20}
                                                        isActive={focusedConnectionId === connection.id}
                                                        showMenu={isMenuShowing}
                                                        connectionData={connection}
                                                        handleMouseDown={handleOpenMenu}
                                                        handleDelete={handleDeleteConnectionWrapper}
                                                        path={path}
                                                        // use a function to update the color and then
                                                        // pass that function to MoveableConnection
                                                        handleColorChange={(newColor) => {
                                                            connection.color = newColor;
                                                            setProjectContext({...projectContext});
                                                        }}></MoveableConnection>
                                );
                            })}
                        </svg>
                    </div>
                </div>

            </div>

            {/* reactjs usePortal menu wrapper"*/}
            <Transition
                as={Fragment}
                show={isMenuShowing}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div id="component-context-menu"
                     style={{bottom: 6, left: 6, right: 6}}
                     className="z-50 flex flex-wrap bg-gray-300 rounded absolute px-4">
                    <div className="absolute top-1 right-1 pl-2 cursor-pointer" onMouseDown={handleCloseMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="red" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>
            </Transition>
        </div>
    )
}
