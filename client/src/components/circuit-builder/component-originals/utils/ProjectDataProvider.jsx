
// Create a Context
import {createContext, useState, useEffect} from "react";
import {isEqual} from 'lodash';
import {projectData} from "../constants/sample-data.jsx";

export const ProjectContext = createContext();
export const ProjectDataLayer = props => {
    if(props.value.content !== undefined) {
        const parsedData = JSON.parse(props.value.content);
        const parsedProjectData = JSON.parse(parsedData.data);
        const [data, setData] = useState(parsedProjectData);

        useEffect(() => {
            const newData = JSON.parse(props.value.content);
            const newParsedProjectData = JSON.parse(newData.data);
            if (!isEqual(data, newParsedProjectData)) {
                setData(newParsedProjectData);
            }
        }, [props.value.content]);


        //Possibly missing attributes:
        //As we are missing parts of data, namely the 'components' and 'connections' rn. I am adding them hardcoded here.
        // parsedProjectData.connections = projectData.connections;
        // parsedProjectData.components = projectData.components;
        // parsedProjectData.diagram = {
        //     viewport: {
        //         offset:{
        //             x:0,
        //             y:0,
        //         },
        //         zoom: 1
        //     }
        // };
        //END of hardcode data.

        return (
            <ProjectContext.Provider value={[data, setData]}>
                {props.children}
            </ProjectContext.Provider>
        );
    }

};
