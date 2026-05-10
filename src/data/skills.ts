import type { Skill, Category, DomainKey } from '@/lib/types';
import skillLayouts from './skill-layouts.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asSkill(data: any): Skill {
  return { ...data, domain: data.domain as DomainKey };
}

export type SkillPosition = { x: number; y: number };
export type PositionedSkill = Skill & SkillPosition;

export type SkillLayoutData = {
  tree: Record<string, SkillPosition>;
};

export const SKILL_LAYOUTS: SkillLayoutData = skillLayouts;

// ─── Digital Basics ───
import connectWifi from '../skills/connect-wifi.json';
import connectBluetooth from '../skills/connect-bluetooth.json';
import manageDeviceSettings from '../skills/manage-device-settings.json';
import createPasswords from '../skills/create-passwords.json';
import spotPhishing from '../skills/spot-phishing.json';
import restartUpdateApp from '../skills/restart-update-app.json';

// ─── Navigation ───
import readStreetMap from '../skills/read-street-map.json';
import useGps from '../skills/use-gps.json';
import readTransitSchedules from '../skills/read-transit-schedules.json';
import planMultiStopTrip from '../skills/plan-multi-stop-trip.json';
import navigateWithoutGps from '../skills/navigate-without-gps.json';
import readSigns from '../skills/read-signs.json';

// ─── Money & Finance ───
import trackSpending from '../skills/track-spending.json';
import needsVsWants from '../skills/needs-vs-wants.json';
import comparePrices from '../skills/compare-prices.json';
import makeBudget from '../skills/make-budget.json';
import compareBankAccounts from '../skills/compare-bank-accounts.json';
import saveForGoal from '../skills/save-for-goal.json';

// ─── Food & Cooking ───
import foodSafety from '../skills/food-safety.json';
import makeScrambledEggs from '../skills/make-scrambled-eggs.json';
import boilPasta from '../skills/boil-pasta.json';
import cookRice from '../skills/cook-rice.json';
import simpleStirFry from '../skills/simple-stir-fry.json';
import useKnife from '../skills/use-knife.json';
import shopForOneMeal from '../skills/shop-for-one-meal.json';
import followRecipe from '../skills/follow-recipe.json';
import storeFood from '../skills/store-food.json';

// ─── Home Care ───
import doLaundry from '../skills/do-laundry.json';
import resetMessyRoom from '../skills/reset-messy-room.json';
import tightenScrew from '../skills/tighten-screw.json';
import hammerNail from '../skills/hammer-nail.json';
import fixLooseHandle from '../skills/fix-loose-handle.json';
import unclogDrain from '../skills/unclog-drain.json';
import changeLightbulb from '../skills/change-lightbulb.json';
import trashRecycling from '../skills/trash-recycling.json';

// ─── Communication ───
import writeProfessionalEmail from '../skills/write-professional-email.json';
import makePhoneCall from '../skills/make-phone-call.json';
import introduceYourself from '../skills/introduce-yourself.json';
import repairSmallDisagreement from '../skills/repair-small-disagreement.json';
import askForHelp from '../skills/ask-for-help.json';
import giveInstructions from '../skills/give-instructions.json';

// ─── Health & Safety ───
import treatSmallCut from '../skills/treat-small-cut.json';
import treatMinorBurn from '../skills/treat-minor-burn.json';
import stopNosebleed from '../skills/stop-nosebleed.json';
import emergencyNumbers from '../skills/emergency-numbers.json';
import washHands from '../skills/wash-hands.json';
import brushFloss from '../skills/brush-floss.json';
import findDoctor from '../skills/find-doctor.json';
import careForMildIllness from '../skills/care-for-mild-illness.json';

// ─── Organization ───
import useCalendar from '../skills/use-calendar.json';
import makeTodoList from '../skills/make-todo-list.json';
import prioritizeTasks from '../skills/prioritize-tasks.json';
import packForTrip from '../skills/pack-for-trip.json';
import sortImportantPapers from '../skills/sort-important-papers.json';
import arriveOnTime from '../skills/arrive-on-time.json';

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
const CX = 1000, CY = 800;
const R1 = 350, R2 = 620, R3 = 740;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function assignPositions(skills: Skill[]): PositionedSkill[] {
  return skills.map((s) => {
    const layout = SKILL_LAYOUTS.tree[s.id];
    if (layout) return { ...s, ...layout };
    const catIdx = CATEGORY_KEYS.indexOf(s.domain);
    const baseAngle = (catIdx * 360) / 8 - 90;
    if (s.level === 1) return { ...s, ...polar(CX, CY, R1, baseAngle) };
    if (s.level === 2) return { ...s, ...polar(CX, CY, R2, baseAngle) };
    return { ...s, ...polar(CX, CY, R3, baseAngle) };
  });
}

export const ALL_SKILLS: PositionedSkill[] = assignPositions(rawSkills);
export const SKILL_MAP: Record<string, PositionedSkill> = Object.fromEntries(ALL_SKILLS.map((s) => [s.id, s]));
export function getChildren(skillId: string): Skill[] { return ALL_SKILLS.filter((s) => s.prerequisites.includes(skillId)); }
export function getSkillState(_skill: Skill, completedIds: string[]): 'completed' | 'active' {
  return completedIds.includes(_skill.id) ? 'completed' : 'active';
}
