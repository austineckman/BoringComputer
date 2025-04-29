// Moveable component settings
const MOVE_SETTINGS = {
    ROTATABLE: true,
    DRAGGABLE: true,
    THROTTLE_DRAG: 1,
    EDGE_DRAGGABLE: false,
    SNAPPABLE: true,
    BOUNDS: {"left": 0, "top": 0, "right": 0, "bottom": 0, "position": "css"},
}

//we do not let these be changes by the app
Object.freeze(MOVE_SETTINGS);

export default MOVE_SETTINGS;
