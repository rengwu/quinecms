import { createContext, useContext } from 'react';
import { emptyModel, type Model } from '../core/schema';
export const ModelContext = createContext<Model>(emptyModel);
export const useModel = () => useContext(ModelContext);
