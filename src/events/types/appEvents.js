/**
 * @fileoverview Application Events
 * Core application event types for the 3D editor
 */

/**
 * Core application events
 */
export const AppEvents = {
  // Application lifecycle
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_SHUTDOWN: 'app:shutdown',
  APP_ERROR: 'app:error',

  // UI events
  UI_RESIZE: 'ui:resize',
  UI_THEME_CHANGE: 'ui:theme:change',
  UI_LANGUAGE_CHANGE: 'ui:language:change',
  UI_SHORTCUT: 'ui:shortcut',
  UI_MENU_ACTION: 'ui:menu:action',
  UI_TOOLBAR_ACTION: 'ui:toolbar:action',
  UI_PANEL_TOGGLE: 'ui:panel:toggle',
  UI_DIALOG_OPEN: 'ui:dialog:open',
  UI_DIALOG_CLOSE: 'ui:dialog:close',
  UI_NOTIFICATION: 'ui:notification',
  UI_PROGRESS: 'ui:progress'
};

/**
 * Get app event category
 * @param {string} event - Event name
 * @returns {string} Event category
 */
export function getAppEventCategory(event) {
  if (event.startsWith('app:')) {
    return 'application';
  }
  if (event.startsWith('ui:')) {
    return 'user-interface';
  }
  return 'unknown';
} 