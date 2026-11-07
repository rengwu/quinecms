import { createRoot } from 'react-dom/client';
import Gallery from './Gallery';
import { forceStates } from './force-states';
import { focusWithoutScrolling } from './dom';

forceStates();
focusWithoutScrolling();
createRoot(document.getElementById('root')!).render(<Gallery />);
