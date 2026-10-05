import type { ViewProps } from '../../core/types';
export function createState(initial: ViewProps) {
  const state = $state(initial);
  return state;
}
