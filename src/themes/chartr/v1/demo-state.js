export const SESSIONS = Object.freeze({
  'free-claude': Object.freeze({
    space: 'Free sessions',
    label: 'claude',
    icon: 'claude',
  }),
  'expensif-claude': Object.freeze({
    space: 'expensif',
    label: 'claude',
    icon: 'claude',
  }),
  'expensif-group': Object.freeze({
    space: 'expensif',
    label: '4 tabs',
    icon: 'split',
  }),
  'ladybird-zsh': Object.freeze({
    space: 'ladybird',
    label: 'zsh',
    icon: 'terminal',
  }),
});
export const INITIAL_STATE = Object.freeze({
  view: 'spaces',
  session: 'expensif-group',
  left: 'claude',
  right: 'wayfinder',
});
export const CHOICES = Object.freeze({
  view: Object.freeze(['tabs', 'spaces', 'chats']),
  session: Object.freeze(Object.keys(SESSIONS)),
  left: Object.freeze(['claude', 'codex']),
  right: Object.freeze(['zsh', 'wayfinder']),
});

export function sessionChoices(state) {
  if (state.view === 'chats') return [];
  return CHOICES.session.filter(
    (id) =>
      state.view === 'spaces' ||
      SESSIONS[id].space === SESSIONS[state.session].space,
  );
}

// The demo has no other actions, project data, terminal connection, or persisted state.
export function transition(state, group, value) {
  if (!Object.hasOwn(CHOICES, group) || !CHOICES[group].includes(value))
    return state;
  if (state.view === 'chats' && group !== 'view') return state;
  if (group === 'session' && !sessionChoices(state).includes(value))
    return state;
  if (
    (group === 'left' || group === 'right') &&
    state.session !== 'expensif-group'
  )
    return state;
  return {
    ...state,
    [group]: value,
    ...(group === 'view' && value === 'chats'
      ? { session: 'expensif-group', left: 'claude' }
      : {}),
  };
}
