import './bootstrap';
// React Components
import { createRoot } from 'react-dom/client';
import ComponentDiagram from './components/ComponentDiagram';
import {ProjectDataLayer} from "./components/utils/ProjectDataProvider.jsx";

const inventrElement = document.getElementById('inventr-diagram');
const root = createRoot(inventrElement);
// pass the ComponentDiagram comp. and give it data
root.render(<ProjectDataLayer value={inventrElement.dataset}><ComponentDiagram/></ProjectDataLayer>);
