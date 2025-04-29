import randomColor from "../helpers/RandomColorOption.jsx";
import {makeId, browserDetect} from "./Utils.jsx";

export const handleRedrawConnections = ( e, projectContext, setProjectContext, viewport ) => {
    var componentId = e.detail.id;
    var eData = e.detail;
    var component = document.getElementById(componentId);
    var svgElement = component.shadowRoot.querySelector('svg.component-svg');
    // console.log('svg found? ',svgElement);
    if(svgElement === null) return;
    console.log('handleRedrawConnections', viewport);
    setProjectContext((prevState) => ({
        ...prevState,
        connections: prevState.connections.map((connection) => {
            let isStartPin = connection.startPin.id.startsWith('pt-' + componentId);
            let isEndPin = connection.endPin.id.startsWith('pt-' + componentId);
            let updatedConnection = { ...connection };

            var pinId, circleElement, pt, bbox, svgMatrix, transformedPoint, newCords;

            if (isStartPin) {
                pinId = updatedConnection.startPin.id;
                circleElement = svgElement.querySelector(`circle[id="${pinId}"]`);

                if (circleElement) {
                    pt = svgElement.createSVGPoint();
                    bbox = circleElement.getBBox();
                    pt.x = bbox.x + bbox.width / 2;
                    pt.y = bbox.y + bbox.height / 2;
                    svgMatrix = circleElement.getScreenCTM();

                    if (svgMatrix) {
                        transformedPoint = pt.matrixTransform(svgMatrix);
                        var graphContainer = document.getElementById('graph-container');
                        var containerRect = graphContainer.getBoundingClientRect();
                        newCords = {
                            x: (transformedPoint.x - containerRect.x) / viewport.zoom,
                            y: (transformedPoint.y - containerRect.y) / viewport.zoom,
                            id: updatedConnection.startPin.id
                        };
                        updatedConnection.startPin=newCords;
                    }
                }
            }

            if (isEndPin) {
                pinId = updatedConnection.endPin.id;
                circleElement = svgElement.querySelector(`circle[id="${pinId}"]`);

                if (circleElement) {
                    pt = svgElement.createSVGPoint();
                    bbox = circleElement.getBBox();
                    pt.x = bbox.x + bbox.width / 2;
                    pt.y = bbox.y + bbox.height / 2;
                    svgMatrix = circleElement.getScreenCTM();

                    if (svgMatrix) {
                        transformedPoint = pt.matrixTransform(svgMatrix);
                        var graphContainer = document.getElementById('graph-container');
                        var containerRect = graphContainer.getBoundingClientRect();
                        newCords = {
                            x: (transformedPoint.x - containerRect.x) / viewport.zoom,
                            y: (transformedPoint.y - containerRect.y) / viewport.zoom,
                            id: updatedConnection.endPin.id
                        };
                        updatedConnection.endPin = newCords;
                    }
                }
            }
            return isStartPin || isEndPin ? updatedConnection : connection;
        }),
        components: prevState.components.map((component) => {
            if(component.id === eData.id){
                return {
                    ...component,
                    attrs: {
                        ...component.attrs,
                        left: eData.attrs.left,
                        top: eData.attrs.top,
                        rotate: eData.attrs.rotate
                    },
                };
            } else {
                return component;
            }
        })
    }));
}

const applyRotation = (element, matrix, rotationAngle) => {
    // Here we're getting the rotation in radians.
    // You may need to adjust this part if your rotation value is stored differently
    const rotation = rotationAngle * Math.PI / 180;

    // Create the rotation matrix
    const rotationMatrix = element.ownerSVGElement.createSVGMatrix();
    rotationMatrix.a = Math.cos(rotation);
    rotationMatrix.b = Math.sin(rotation);
    rotationMatrix.c = -Math.sin(rotation);
    rotationMatrix.d = Math.cos(rotation);

    // Multiply the original matrix by the rotation matrix
    const resultMatrix = matrix.multiply(rotationMatrix);

    return resultMatrix;
}


/**
 * Calculates the path of a connection between two points.
 * @param start
 * @param end
 * @param viewport
 * @returns {*[]}
 */
export const drawConnection = (start, end, viewport) => {

    const path = [];

    const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

    path.push(start); // Push start point

    if (start.y === end.y || start.x === end.x) {
        // If start-end points are collinear vertically or horizontally
        path.push(end); // Push end point
    } else {
        // If start-end points are not collinear
        if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
            // If distance in x direction is more than in y direction
            const midHorizontal = { x: midPoint.x, y: start.y };
            path.push(midHorizontal);
            const midVertical = { x: midPoint.x, y: end.y };
            path.push(midVertical);
        } else {
            // If distance in y direction is more than in x direction
            const midVertical = { x: start.x, y: midPoint.y };
            path.push(midVertical);
            const midHorizontal = { x: end.x, y: midPoint.y };
            path.push(midHorizontal);
        }
        path.push(end); // Push end point
    }
    // console.log('drew path', path);

    return path;
};


export const handlePinOnClick = (e, projectContext, setProjectContext, startPin, setStartPin, isDrawing, setIsDrawing, zoom) => {
    var detail = JSON.parse(e.detail.data);
    var offset = e.target.parentElement.getClientRects()[0];
    var pinId = e.detail.id;
    if(pinId === undefined || pinId === null){
        pinId = 'pt-' + e.target.id + '-' + detail.name;
    }
    var svgElement = e.currentTarget.renderRoot.querySelector('svg.component-svg');
    var circleElement = svgElement.querySelector(`circle[id="${pinId}"]`);
    // Create an SVG point
    var pt = svgElement.createSVGPoint();
    var bbox = circleElement.getBBox();
    pt.x = bbox.x + bbox.width / 2;
    pt.y = bbox.y + bbox.height / 2;

    // The matrix transforms from element's coordinate system into svgElement's coordinate space:
    var svgMatrix = circleElement.getScreenCTM();
    if (svgMatrix) {
        var transformedPoint = pt.matrixTransform(svgMatrix);
        var graphContainer = document.getElementById('graph-container');

        // Calculating the position of the graph div relative to viewport
        var containerRect = graphContainer.getBoundingClientRect();


        // Get the zoom values from the viewport state.
        var x = (transformedPoint.x - containerRect.x ) / zoom;
        var y =  (transformedPoint.y - containerRect.y ) / zoom;
}
    console.log('handlePinOnClick', {'x': x, 'y': y, 'id': pinId});
    if (!isDrawing) {
        setStartPin({'x': x, 'y': y, 'id': pinId});
    } else {
        const startComponentId = startPin.id.split('-')[1];
        const endComponentId = e.target.id;
        if(startPin.id !== pinId){//&& startComponentId !== endComponentId
            setProjectContext((prevState) => ({
                ...prevState,
                connections: [...prevState.connections,
                    { 'id': makeId(4),
                        startPin,
                        'endPin':{'x': x, 'y': y, 'id': pinId },
                        'color': randomColor()
                    }]
            }));
            setStartPin(null);
        }
    }
    setIsDrawing(!isDrawing);
}



//TODO: Incomplete, not in use. Called when a component is deleted.
export const deleteConnectionsOfComponent = (componentId, projectContext, setProjectContext) => {
    console.log(componentId, 'delete conn');

    const isComponentPin = (connection, id) => connection.startPin.id.startsWith('pt-' + id) || connection.endPin.id.startsWith('pt-' + id);

    var remainingConnections = projectContext.connections.filter(connection => !isComponentPin(connection, componentId));

    setProjectContext((prevState) => ({
        ...prevState,
        connections: remainingConnections
    }));

    console.log(projectContext.connections, 'remaining conn');
}


/**
 * Handles adding a component to the project component list.
 *
 * @param {Object} e - The event object.
 * @param setProjectContext
 *
 * @param projectContext
 */
export const handleAddComponent = (e, setProjectContext, projectContext) => {

    const componentData = JSON.parse(e.currentTarget.dataset.value);
    componentData.attrs = JSON.parse(componentData.attrs);
    // console.log(...projectComponentList, componentData);
    componentData.id = makeId(4);
    // var lastComp = projectContext.components.slice(-1)
    // componentData.attrs.zIndex = lastComp[0].attrs.zIndex + 1;
    // let component = null;
    // setProjectComponentList([...projectComponentList, componentData]);
    setProjectContext((prevState) => ({
        ...prevState,
        components: [...prevState.components, componentData]
    }));
}


/**
 * Deletes a connection from the list of connections.
 *
 * @param {string | number} connId - The ID of the connection to delete.
 * @param projectContext
 * @param setProjectContext
 */
export const handleDeleteConnection = (connId, projectContext, setProjectContext) => {
    setProjectContext((prevState) => ({
        ...prevState,
        connections: projectContext.connections.filter((connection) => connection.id !== connId)
    }));
}


/**
 * Deletes a component from the project component list.
 *
 * @param componentId - The id of the component to be deleted.
 * @param projectContext
 * @param setProjectContext
 * @return {void}
 */
export const handleDeleteComponent = (componentId, projectContext, setProjectContext) => {
    // setProjectComponentList(projectComponentList.filter((component) => component.id !== componentId));
    setProjectContext((prevState) => ({
        ...prevState,
        components: projectContext.components.filter((component) => component.id !== componentId)
    }));
}
