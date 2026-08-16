/** Surface styles shared across Manila components (kept out of component files
 *  so react-refresh sees pure-component modules). */

/** Subtle paper grain overlay for cream surfaces (single restrained texture). */
export function paperGrain(): React.CSSProperties {
  return {
    backgroundImage:
      'repeating-linear-gradient(0deg, rgba(46,42,38,0.016) 0px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(46,42,38,0.012) 0px, transparent 1px, transparent 4px)',
  };
}

/** Flat wood-gradient + faint vertical grain for cabinet surfaces (never photoreal). */
export function woodFace(raised = false): React.CSSProperties {
  const base = raised
    ? 'linear-gradient(180deg, #46362A 0%, #3E2F23 55%, #362920 100%)'
    : 'linear-gradient(180deg, #3E2F23 0%, #342820 100%)';
  return {
    backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 2px, transparent 2px, transparent 11px), ${base}`,
  };
}
