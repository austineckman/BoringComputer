import {useState, useCallback, useEffect, useRef} from 'react';

export function useViewport(viewportSettings) {
    const [viewport, setViewport] = useState({
        offset: {
            x: 0.0,
            y: 0.0,
        },
        zoom: 1//viewportSettings?.zoom ||
    });

    const viewportRef = useRef(viewport);
    useEffect(() => {
        viewportRef.current = viewport;
    }, [viewport]);

    const [isDragging, setIsDragging] = useState(false);

    const handleDiagramMouseDown = useCallback((e) => {
        console.log();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const centerViewport = (w,h) => {
        setViewport((prev) => ({
            ...prev,
            offset: {
                x: w/2,
                y: 0
            }
        }));
    }

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) {
            return;
        }
        if (e.buttons !== 1) {
            setIsDragging(false);
            return;
        }
        setViewport((prev) => ({
            ...prev,
            offset: {
                //WHOAH! warning! do not update this offset here or you get jacked up component connections which do not match their pins.
                //but then if not updated, the pan don't work -.-
                x: prev.offset.x + e.movementX,
                y: prev.offset.y + e.movementY
            }
        }));
    }, [isDragging]);
    // console.log(viewport);

    const handleWheel = useCallback((e) => {

        if (!e.ctrlKey) {
            return;
        }
        e.stopPropagation();
        const delta = -e.deltaY / 1000;
        const newZoom = Math.pow(2, Math.log2(viewport.zoom) + delta);
        const minZoom = 0.1;
        const maxZoom = 10;
        if (newZoom < minZoom || newZoom > maxZoom) {
            return;
        }
        setViewport((prev) => ({
            ...prev,
            zoom: newZoom
        }));
    }, [viewport.zoom]);

    return [
        viewport,
        centerViewport,
        handleDiagramMouseDown,
        handleMouseUp,
        handleMouseMove,
        handleWheel,
        viewportRef, // return ref instead of function
    ];
}
