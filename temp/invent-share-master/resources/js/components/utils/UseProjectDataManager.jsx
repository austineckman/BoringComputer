import {isEqual, throttle} from 'lodash';
import {useContext, useEffect, useRef} from "react";
import {ProjectContext} from "./ProjectDataProvider.jsx";

export const useProjectDataManager = (projectComponentList, connections) => {
    const [projectContext, setProjectContext] = useContext(ProjectContext);
    const prevContextValue = useRef(projectContext);
    const throttledDispatch = useRef(
        throttle((projectContext) => {
            console.log('context value has changed');
            const myEvt = new CustomEvent('data-update', {
                'detail': JSON.stringify(projectContext)
            });
            document.dispatchEvent(myEvt);
        }, 3000)
    ).current;

    useEffect(() => {
        console.log(' DATA CHANGE useEffect triggered', projectContext);
        if (!isEqual(prevContextValue.current, projectContext)) {
            throttledDispatch(projectContext);
        }
        prevContextValue.current = projectContext;
    }, [projectComponentList, connections, projectContext, setProjectContext]);
}
