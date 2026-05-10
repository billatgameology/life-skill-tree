import type { Skill, Category, DomainKey } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asSkill(data: any): Skill {
  return { ...data, domain: data.domain as DomainKey };
}

// ─── Digital Basics ───
import connectWifi from './connect-wifi.json';
import connectBluetooth from './connect-bluetooth.json';
import manageDeviceSettings from './manage-device-settings.json';
import createPasswords from './create-passwords.json';
import spotPhishing from './spot-phishing.json';
import restartUpdateApp from './restart-update-app.json';

// ─── Navigation ───
import readStreetMap from './read-street-map.json';
import useGps from './use-gps.json';
import readTransitSchedules from './read-transit-schedules.json';
import planMultiStopTrip from './plan-multi-stop-trip.json';
import navigateWithoutGps from './navigate-without-gps.json';
import readSigns from './read-signs.json';

// ─── Money & Finance ───
import trackSpending from './track-spending.json';
import needsVsWants from './needs-vs-wants.json';
import comparePrices from './compare-prices.json';
import makeBudget from './make-budget.json';
import compareBankAccounts from './compare-bank-accounts.json';
import saveForGoal from './save-for-goal.json';

// ─── Food & Cooking ───
import foodSafety from './food-safety.json';
import makeScrambledEggs from './make-scrambled-eggs.json';
import boilPasta from './boil-pasta.json';
import cookRice from './cook-rice.json';
import simpleStirFry from './simple-stir-fry.json';
import useKnife from './use-knife.json';
import shopForOneMeal from './shop-for-one-meal.json';
import followRecipe from './follow-recipe.json';
import storeFood from './store-food.json';

// ─── Home Care ───
import doLaundry from './do-laundry.json';
import resetMessyRoom from './reset-messy-room.json';
import tightenScrew from './tighten-screw.json';
import hammerNail from './hammer-nail.json';
import fixLooseHandle from './fix-loose-handle.json';
import unclogDrain from './unclog-drain.json';
import changeLightbulb from './change-lightbulb.json';
import trashRecycling from './trash-recycling.json';

// ─── Communication ───
import writeProfessionalEmail from './write-professional-email.json';
import makePhoneCall from './make-phone-call.json';
import introduceYourself from './introduce-yourself.json';
import repairSmallDisagreement from './repair-small-disagreement.json';
import askForHelp from './ask-for-help.json';
import giveInstructions from './give-instructions.json';

// ─── Health & Safety ───
import treatSmallCut from './treat-small-cut.json';
import treatMinorBurn from './treat-minor-burn.json';
import stopNosebleed from './stop-nosebleed.json';
import emergencyNumbers from './emergency-numbers.json';
import washHands from './wash-hands.json';
import brushFloss from './brush-floss.json';
import findDoctor from './find-doctor.json';
import careForMildIllness from './care-for-mild-illness.json';

// ─── Organization ───
import useCalendar from './use-calendar.json';
import makeTodoList from './make-todo-list.json';
import prioritizeTasks from './prioritize-tasks.json';
import packForTrip from './pack-for-trip.json';
import sortImportantPapers from './sort-important-papers.json';
import arriveOnTime from './arrive-on-time.json';

// ─── All skills ───
const rawSkills: Skill[] = [
  asSkill(connectWifi), asSkill(connectBluetooth), asSkill(manageDeviceSettings),
  asSkill(createPasswords), asSkill(spotPhishing), asSkill(restartUpdateApp),

  asSkill(readStreetMap), asSkill(useGps), asSkill(readTransitSchedules),
  asSkill(planMultiStopTrip), asSkill(navigateWithoutGps), asSkill(readSigns),

  asSkill(trackSpending), asSkill(needsVsWants), asSkill(comparePrices),
  asSkill(makeBudget), asSkill(compareBankAccounts), asSkill(saveForGoal),

  asSkill(foodSafety), asSkill(makeScrambledEggs), asSkill(boilPasta),
  asSkill(cookRice), asSkill(simpleStirFry), asSkill(useKnife),
  asSkill(shopForOneMeal), asSkill(followRecipe), asSkill(storeFood),

  asSkill(doLaundry), asSkill(resetMessyRoom), asSkill(tightenScrew),
  asSkill(hammerNail), asSkill(fixLooseHandle), asSkill(unclogDrain),
  asSkill(changeLightbulb), asSkill(trashRecycling),

  asSkill(writeProfessionalEmail), asSkill(makePhoneCall), asSkill(introduceYourself),
  asSkill(repairSmallDisagreement), asSkill(askForHelp), asSkill(giveInstructions),

  asSkill(treatSmallCut), asSkill(treatMinorBurn), asSkill(stopNosebleed),
  asSkill(emergencyNumbers), asSkill(washHands), asSkill(brushFloss),
  asSkill(findDoctor), asSkill(careForMildIllness),

  asSkill(useCalendar), asSkill(makeTodoList), asSkill(prioritizeTasks),
  asSkill(packForTrip), asSkill(sortImportantPapers), asSkill(arriveOnTime),
];

// ─── Category metadata ───
export const CATEGORIES: Record<DomainKey, Category> = {
  'digital-basics':  { key: 'digital-basics',  name: 'Digital Basics',     color: '#5A9BA0', icon: '\u{1F4BB}' },
  'navigation':      { key: 'navigation',      name: 'Navigation',         color: '#5A7D9B', icon: '\u{1F5FA}' },
  'money-finance':   { key: 'money-finance',   name: 'Money & Finance',    color: '#B8964A', icon: '\u{1F4B0}' },
  'food-cooking':    { key: 'food-cooking',    name: 'Food & Cooking',     color: '#5B8B6B', icon: '\u{1F372}' },
  'home-care':       { key: 'home-care',       name: 'Home Care',          color: '#9B7E5A', icon: '\u{1F3E0}' },
  'communication':   { key: 'communication',   name: 'Communication',      color: '#8A6B9B', icon: '\u{1F4AC}' },
  'health-safety':   { key: 'health-safety',   name: 'Health & Safety',    color: '#9B5A5A', icon: '\u{2695}'  },
  'organization':    { key: 'organization',    name: 'Organization',       color: '#6B7B8D', icon: '\u{1F4CB}' },
};

export const CATEGORY_KEYS: DomainKey[] = [
  'digital-basics', 'navigation', 'money-finance', 'food-cooking',
  'home-care', 'communication', 'health-safety', 'organization',
];

// ─── Radial positioning ───
const CX = 700, CY = 550;
const R1 = 160, R2 = 310, R3 = 460;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function assignPositions(skills: Skill[]): Skill[] {
  const counters = new Map<string, number>();
  return skills.map((s) => {
    const key = `${s.domain}-${s.level}`;
    const idx = counters.get(key) || 0;
    counters.set(key, idx + 1);
    const catIdx = CATEGORY_KEYS.indexOf(s.domain);
    const baseAngle = (catIdx * 360) / 8 - 90;
    if (s.level === 1) return { ...s, ...polar(CX, CY, R1, baseAngle) };
    if (s.level === 2) return { ...s, ...polar(CX, CY, R2, baseAngle + (idx === 0 ? -22 : 22)) };
    return { ...s, ...polar(CX, CY, R3, baseAngle + (idx === 0 ? -15 : idx === 1 ? 0 : 15)) };
  });
}

export const ALL_SKILLS: Skill[] = assignPositions(rawSkills);
export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(ALL_SKILLS.map((s) => [s.id, s]));
export function getChildren(skillId: string): Skill[] { return ALL_SKILLS.filter((s) => s.prerequisites.includes(skillId)); }
export function getSkillState(_skill: Skill, completedIds: string[]): 'completed' | 'active' {
  return completedIds.includes(_skill.id) ? 'completed' : 'active';
}
