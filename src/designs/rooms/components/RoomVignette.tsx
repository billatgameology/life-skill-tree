import { PLACE_MAP, type PlaceId } from '../places';

const CREAM = '#F4E8D6';
const AMBER = '#F0B860';
const DARK = '#22363C';

interface RoomVignetteProps {
  placeId: PlaceId;
  size?: number;
}

/** Tiny flat illustration of each place, used in lists and room headers. */
export default function RoomVignette({ placeId, size = 48 }: RoomVignetteProps) {
  const tint = PLACE_MAP[placeId].tint;

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="shrink-0">
      {placeId === 'front-door' && (
        <>
          <rect x="16" y="9" width="16" height="31" rx="2" fill={tint} />
          <rect x="16" y="4" width="16" height="3.5" rx="1" fill={AMBER} opacity="0.75" />
          <circle cx="28.5" cy="25" r="1.8" fill={CREAM} />
          <rect x="13" y="41" width="22" height="3" rx="1.5" fill={CREAM} opacity="0.35" />
        </>
      )}
      {placeId === 'kitchen' && (
        <>
          <rect x="12" y="27" width="24" height="14" rx="2" fill={tint} />
          <circle cx="17" cy="31" r="1.4" fill={CREAM} opacity="0.7" />
          <circle cx="22" cy="31" r="1.4" fill={CREAM} opacity="0.7" />
          <rect x="17" y="18" width="14" height="9" rx="2" fill={CREAM} opacity="0.85" />
          <rect x="15" y="20" width="2.5" height="2" fill={CREAM} opacity="0.6" />
          <rect x="30.5" y="20" width="2.5" height="2" fill={CREAM} opacity="0.6" />
          <path d="M24 14 q3 -3 0 -7" stroke={AMBER} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {placeId === 'living-room' && (
        <>
          <rect x="20" y="8" width="9" height="7" rx="1" fill={AMBER} opacity="0.4" />
          <rect x="10" y="20" width="28" height="10" rx="3" fill={tint} />
          <rect x="8" y="28" width="32" height="8" rx="3" fill={tint} opacity="0.85" />
          <rect x="5" y="22" width="4.5" height="14" rx="2" fill={tint} />
          <rect x="38.5" y="22" width="4.5" height="14" rx="2" fill={tint} />
          <rect x="11" y="36" width="3" height="4" fill={CREAM} opacity="0.4" />
          <rect x="34" y="36" width="3" height="4" fill={CREAM} opacity="0.4" />
        </>
      )}
      {placeId === 'desk' && (
        <>
          <rect x="8" y="28" width="32" height="3" rx="1" fill={tint} />
          <rect x="10" y="31" width="3" height="11" fill={tint} opacity="0.85" />
          <rect x="35" y="31" width="3" height="11" fill={tint} opacity="0.85" />
          <rect x="12" y="24.5" width="9" height="3.5" rx="1" fill={CREAM} opacity="0.7" />
          <rect x="29" y="18" width="2" height="10" fill={tint} />
          <polygon points="25,18 35,18 32,12" fill={AMBER} opacity="0.9" />
          <circle cx="30" cy="20" r="4.5" fill={AMBER} opacity="0.25" />
        </>
      )}
      {placeId === 'laundry' && (
        <>
          <rect x="13" y="13" width="22" height="27" rx="3" fill={tint} />
          <circle cx="24" cy="28" r="7.5" fill={DARK} />
          <circle cx="24" cy="28" r="4.5" fill="none" stroke={CREAM} strokeWidth="1" opacity="0.5" />
          <circle cx="17" cy="17" r="1.5" fill={CREAM} opacity="0.7" />
          <rect x="11" y="8" width="26" height="2.5" fill={CREAM} opacity="0.4" />
          <rect x="15" y="3" width="6.5" height="5" rx="1" fill={AMBER} opacity="0.65" />
        </>
      )}
      {placeId === 'bedroom' && (
        <>
          <rect x="8" y="15" width="4" height="19" rx="1.5" fill={tint} />
          <rect x="8" y="26" width="32" height="8" rx="2" fill={tint} opacity="0.85" />
          <rect x="13" y="22.5" width="9" height="5" rx="2" fill={CREAM} opacity="0.85" />
          <rect x="24" y="26" width="16" height="8" rx="2" fill={AMBER} opacity="0.35" />
          <rect x="9" y="34" width="3" height="5" fill={CREAM} opacity="0.4" />
          <rect x="36" y="34" width="3" height="5" fill={CREAM} opacity="0.4" />
        </>
      )}
      {placeId === 'bathroom' && (
        <>
          <rect x="9" y="24" width="30" height="12" rx="6" fill={CREAM} opacity="0.85" />
          <rect x="13" y="36" width="4" height="5" fill={CREAM} opacity="0.5" />
          <rect x="31" y="36" width="4" height="5" fill={CREAM} opacity="0.5" />
          <rect x="34" y="14" width="2.5" height="10" fill={tint} />
          <rect x="28" y="14" width="8.5" height="2.5" fill={tint} />
          <circle cx="17" cy="16" r="2" fill="none" stroke={tint} strokeWidth="1.2" />
          <circle cx="23" cy="12" r="1.5" fill="none" stroke={tint} strokeWidth="1.2" />
        </>
      )}
      {placeId === 'quiet-corner' && (
        <>
          <circle cx="34" cy="12" r="6.5" fill={AMBER} opacity="0.35" />
          <circle cx="34" cy="12" r="6.5" fill="none" stroke={CREAM} strokeWidth="1" opacity="0.4" />
          <rect x="10" y="16" width="8" height="19" rx="3" fill={tint} />
          <rect x="10" y="28" width="22" height="8" rx="3" fill={tint} opacity="0.85" />
          <rect x="28" y="23" width="7" height="13" rx="2.5" fill={tint} opacity="0.7" />
          <rect x="39" y="33" width="6" height="6" rx="1" fill={tint} opacity="0.5" />
          <ellipse cx="42" cy="30" rx="3" ry="4" fill={tint} opacity="0.8" />
        </>
      )}
      {placeId === 'street' && (
        <>
          <rect x="6" y="40" width="36" height="2.5" fill={CREAM} opacity="0.3" />
          <rect x="22" y="12" width="2.5" height="28" fill={tint} />
          <circle cx="23.2" cy="10" r="3.5" fill={AMBER} opacity="0.9" />
          <circle cx="23.2" cy="10" r="7" fill={AMBER} opacity="0.22" />
          <rect x="10" y="44" width="5" height="2" fill={CREAM} opacity="0.35" />
          <rect x="21" y="44" width="5" height="2" fill={CREAM} opacity="0.35" />
          <rect x="32" y="44" width="5" height="2" fill={CREAM} opacity="0.35" />
        </>
      )}
      {placeId === 'shops' && (
        <>
          <rect x="10" y="18" width="28" height="22" fill={tint} opacity="0.3" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={10 + i * 7} y="13" width="7" height="6" fill={i % 2 === 0 ? tint : CREAM} opacity={i % 2 === 0 ? 1 : 0.8} />
          ))}
          <rect x="13" y="24" width="12" height="10" fill={AMBER} opacity="0.4" />
          <rect x="29" y="26" width="6" height="14" fill={CREAM} opacity="0.3" />
        </>
      )}
      {placeId === 'town' && (
        <>
          <polygon points="8,19 40,19 24,8" fill={tint} />
          <circle cx="24" cy="15" r="2.2" fill={AMBER} />
          <rect x="12" y="21" width="4.5" height="16" fill={CREAM} opacity="0.5" />
          <rect x="21.5" y="21" width="4.5" height="16" fill={CREAM} opacity="0.5" />
          <rect x="31" y="21" width="4.5" height="16" fill={CREAM} opacity="0.5" />
          <rect x="8" y="38" width="32" height="3.5" fill={tint} opacity="0.8" />
        </>
      )}
      {placeId === 'phone' && (
        <>
          <rect x="15.5" y="5" width="17" height="36" rx="4" fill={tint} opacity="0.25" stroke={tint} strokeWidth="1.6" />
          <rect x="18.5" y="10" width="11" height="24" rx="1.5" fill={AMBER} opacity="0.35" />
          <circle cx="21.5" cy="14" r="1.4" fill={CREAM} opacity="0.6" />
          <circle cx="26.5" cy="14" r="1.4" fill={CREAM} opacity="0.6" />
          <circle cx="21.5" cy="19" r="1.4" fill={CREAM} opacity="0.6" />
          <circle cx="26.5" cy="19" r="1.4" fill={CREAM} opacity="0.6" />
          <circle cx="24" cy="38" r="1.4" fill={CREAM} opacity="0.6" />
        </>
      )}
    </svg>
  );
}
