import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from 'react';

type Container = HTMLElement | RefObject<HTMLElement | null> | null;
const PortalContext = createContext<Container>(null);
/** Popups render into an admin-themed element instead of document.body. */
export function PortalProvider({
  container,
  children,
}: {
  container: Container;
  children: ReactNode;
}) {
  return (
    <PortalContext.Provider value={container}>
      {children}
    </PortalContext.Provider>
  );
}
export const usePortalContainer = () => useContext(PortalContext) ?? undefined;
