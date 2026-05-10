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
import backUpFiles from '../skills/back-up-files.json';
import checkPrivacySettings from '../skills/check-privacy-settings.json';
import connectBluetooth from '../skills/connect-bluetooth.json';
import connectWifi from '../skills/connect-wifi.json';
import createPasswords from '../skills/create-passwords.json';
import manageDeviceSettings from '../skills/manage-device-settings.json';
import manageStorageSpace from '../skills/manage-storage-space.json';
import organizePhonePhotos from '../skills/organize-phone-photos.json';
import reportSuspiciousMessage from '../skills/report-suspicious-message.json';
import restartUpdateApp from '../skills/restart-update-app.json';
import scanQrCode from '../skills/scan-qr-code.json';
import setScreenTimeLimits from '../skills/set-screen-time-limits.json';
import shareFileLink from '../skills/share-file-link.json';
import spotPhishing from '../skills/spot-phishing.json';
import takeScreenshot from '../skills/take-screenshot.json';
import updateDeviceSoftware from '../skills/update-device-software.json';
import useCloudStorage from '../skills/use-cloud-storage.json';
import useTwoFactorAuthentication from '../skills/use-two-factor-authentication.json';

// ─── Navigation ───
import askForDirections from '../skills/ask-for-directions.json';
import buyTransitTicket from '../skills/buy-transit-ticket.json';
import checkTrafficBeforeLeaving from '../skills/check-traffic-before-leaving.json';
import findNearestRestroom from '../skills/find-nearest-restroom.json';
import identifySafePickupSpot from '../skills/identify-safe-pickup-spot.json';
import navigateLargeBuilding from '../skills/navigate-large-building.json';
import navigateWithoutGps from '../skills/navigate-without-gps.json';
import packCarryOnBag from '../skills/pack-carry-on-bag.json';
import planMultiStopTrip from '../skills/plan-multi-stop-trip.json';
import planTransitTransfer from '../skills/plan-transit-transfer.json';
import readBusRouteMap from '../skills/read-bus-route-map.json';
import readParkingSigns from '../skills/read-parking-signs.json';
import readSigns from '../skills/read-signs.json';
import readStreetMap from '../skills/read-street-map.json';
import readTransitSchedules from '../skills/read-transit-schedules.json';
import useAirportBoardingPass from '../skills/use-airport-boarding-pass.json';
import useGps from '../skills/use-gps.json';
import useRidesharePickup from '../skills/use-rideshare-pickup.json';

// ─── Money Finance ───
import avoidOverdraftFees from '../skills/avoid-overdraft-fees.json';
import calculateTip from '../skills/calculate-tip.json';
import cancelSubscription from '../skills/cancel-subscription.json';
import compareBankAccounts from '../skills/compare-bank-accounts.json';
import comparePrices from '../skills/compare-prices.json';
import compareSubscriptionCosts from '../skills/compare-subscription-costs.json';
import depositCheck from '../skills/deposit-check.json';
import makeBudget from '../skills/make-budget.json';
import makeSimpleSavingsPlan from '../skills/make-simple-savings-plan.json';
import needsVsWants from '../skills/needs-vs-wants.json';
import readBasicBill from '../skills/read-basic-bill.json';
import readPayStub from '../skills/read-pay-stub.json';
import readReceipt from '../skills/read-receipt.json';
import recognizeMoneyScam from '../skills/recognize-money-scam.json';
import saveForGoal from '../skills/save-for-goal.json';
import setPaymentReminder from '../skills/set-payment-reminder.json';
import splitBill from '../skills/split-bill.json';
import trackSpending from '../skills/track-spending.json';
import understandSalesTax from '../skills/understand-sales-tax.json';
import useDebitCardSafely from '../skills/use-debit-card-safely.json';

// ─── Food Cooking ───
import boilPasta from '../skills/boil-pasta.json';
import checkFoodExpiration from '../skills/check-food-expiration.json';
import cleanKitchenCounter from '../skills/clean-kitchen-counter.json';
import compareGroceryUnitPrices from '../skills/compare-grocery-unit-prices.json';
import cookRice from '../skills/cook-rice.json';
import followRecipe from '../skills/follow-recipe.json';
import foodSafety from '../skills/food-safety.json';
import heatLeftovers from '../skills/heat-leftovers.json';
import makeGroceryList from '../skills/make-grocery-list.json';
import makeSalad from '../skills/make-salad.json';
import makeSandwich from '../skills/make-sandwich.json';
import makeScrambledEggs from '../skills/make-scrambled-eggs.json';
import measureIngredients from '../skills/measure-ingredients.json';
import packLunch from '../skills/pack-lunch.json';
import readNutritionLabel from '../skills/read-nutrition-label.json';
import shopForOneMeal from '../skills/shop-for-one-meal.json';
import simpleStirFry from '../skills/simple-stir-fry.json';
import storeFood from '../skills/store-food.json';
import useKnife from '../skills/use-knife.json';
import useMicrowaveSafely from '../skills/use-microwave-safely.json';
import useOvenSafely from '../skills/use-oven-safely.json';
import useStoveSafely from '../skills/use-stove-safely.json';
import washDishes from '../skills/wash-dishes.json';
import washProduce from '../skills/wash-produce.json';

// ─── Home Care ───
import changeLightbulb from '../skills/change-lightbulb.json';
import changeTrashBag from '../skills/change-trash-bag.json';
import cleanBathroomSink from '../skills/clean-bathroom-sink.json';
import cleanToilet from '../skills/clean-toilet.json';
import doLaundry from '../skills/do-laundry.json';
import fixLooseHandle from '../skills/fix-loose-handle.json';
import hammerNail from '../skills/hammer-nail.json';
import hangPictureFrame from '../skills/hang-picture-frame.json';
import makeBed from '../skills/make-bed.json';
import mopSmallSpill from '../skills/mop-small-spill.json';
import patchSmallWallHole from '../skills/patch-small-wall-hole.json';
import plungeToilet from '../skills/plunge-toilet.json';
import replaceAirFilter from '../skills/replace-air-filter.json';
import replaceBatteries from '../skills/replace-batteries.json';
import replaceToiletPaperRoll from '../skills/replace-toilet-paper-roll.json';
import resetMessyRoom from '../skills/reset-messy-room.json';
import shutOffWaterValve from '../skills/shut-off-water-valve.json';
import sweepFloor from '../skills/sweep-floor.json';
import testSmokeAlarm from '../skills/test-smoke-alarm.json';
import tightenScrew from '../skills/tighten-screw.json';
import trashRecycling from '../skills/trash-recycling.json';
import unclogDrain from '../skills/unclog-drain.json';
import useTapeMeasure from '../skills/use-tape-measure.json';
import vacuumRoom from '../skills/vacuum-room.json';

// ─── Communication ───
import apologizeClearly from '../skills/apologize-clearly.json';
import askClarifyingQuestion from '../skills/ask-clarifying-question.json';
import askForHelp from '../skills/ask-for-help.json';
import disagreeRespectfully from '../skills/disagree-respectfully.json';
import endConversationPolitely from '../skills/end-conversation-politely.json';
import giveInstructions from '../skills/give-instructions.json';
import giveUsefulFeedback from '../skills/give-useful-feedback.json';
import introduceYourself from '../skills/introduce-yourself.json';
import leaveVoicemail from '../skills/leave-voicemail.json';
import makePhoneCall from '../skills/make-phone-call.json';
import makeSmallTalk from '../skills/make-small-talk.json';
import receiveFeedbackCalmly from '../skills/receive-feedback-calmly.json';
import repairSmallDisagreement from '../skills/repair-small-disagreement.json';
import replyToInvitation from '../skills/reply-to-invitation.json';
import reschedulePolitely from '../skills/reschedule-politely.json';
import sendClearTextMessage from '../skills/send-clear-text-message.json';
import setBoundaryRespectfully from '../skills/set-boundary-respectfully.json';
import writeProfessionalEmail from '../skills/write-professional-email.json';

// ─── Health Safety ───
import brushFloss from '../skills/brush-floss.json';
import careForMildIllness from '../skills/care-for-mild-illness.json';
import checkTemperature from '../skills/check-temperature.json';
import describeSymptomsClearly from '../skills/describe-symptoms-clearly.json';
import emergencyNumbers from '../skills/emergency-numbers.json';
import findDoctor from '../skills/find-doctor.json';
import handleBugBite from '../skills/handle-bug-bite.json';
import makeBasicFirstAidKit from '../skills/make-basic-first-aid-kit.json';
import makeEmergencyContactCard from '../skills/make-emergency-contact-card.json';
import packMedicationForTrip from '../skills/pack-medication-for-trip.json';
import readMedicineLabel from '../skills/read-medicine-label.json';
import recognizeEmergencySituation from '../skills/recognize-emergency-situation.json';
import scheduleDoctorAppointment from '../skills/schedule-doctor-appointment.json';
import stayHydrated from '../skills/stay-hydrated.json';
import stopNosebleed from '../skills/stop-nosebleed.json';
import treatMinorBurn from '../skills/treat-minor-burn.json';
import treatSmallCut from '../skills/treat-small-cut.json';
import useSunscreen from '../skills/use-sunscreen.json';
import washHands from '../skills/wash-hands.json';

// ─── Organization ───
import arriveOnTime from '../skills/arrive-on-time.json';
import breakTaskIntoSteps from '../skills/break-task-into-steps.json';
import cleanDesk from '../skills/clean-desk.json';
import createSimpleRoutine from '../skills/create-simple-routine.json';
import findLostItemSystematically from '../skills/find-lost-item-systematically.json';
import makePackingChecklist from '../skills/make-packing-checklist.json';
import makeTodoList from '../skills/make-todo-list.json';
import nameFilesClearly from '../skills/name-files-clearly.json';
import organizeBackpack from '../skills/organize-backpack.json';
import organizeDigitalFiles from '../skills/organize-digital-files.json';
import packForTrip from '../skills/pack-for-trip.json';
import planHomeworkSession from '../skills/plan-homework-session.json';
import prepareNightBefore from '../skills/prepare-night-before.json';
import prioritizeTasks from '../skills/prioritize-tasks.json';
import setReminder from '../skills/set-reminder.json';
import sortImportantPapers from '../skills/sort-important-papers.json';
import useCalendar from '../skills/use-calendar.json';
import useTimer from '../skills/use-timer.json';

// ─── Career Work ───
import answerInterviewQuestion from '../skills/answer-interview-question.json';
import arriveForInterview from '../skills/arrive-for-interview.json';
import askForReference from '../skills/ask-for-reference.json';
import callOutSickPolitely from '../skills/call-out-sick-politely.json';
import chooseInterviewClothes from '../skills/choose-interview-clothes.json';
import fillOutJobApplication from '../skills/fill-out-job-application.json';
import makeSimpleResume from '../skills/make-simple-resume.json';
import prepareForInterview from '../skills/prepare-for-interview.json';
import readWorkSchedule from '../skills/read-work-schedule.json';
import requestShiftChange from '../skills/request-shift-change.json';
import trackWorkHours from '../skills/track-work-hours.json';
import writeThankYouMessage from '../skills/write-thank-you-message.json';

// ─── School Learning ───
import askTeacherForHelp from '../skills/ask-teacher-for-help.json';
import avoidPlagiarism from '../skills/avoid-plagiarism.json';
import checkAssignmentRequirements from '../skills/check-assignment-requirements.json';
import citeASource from '../skills/cite-a-source.json';
import emailTeacherQuestion from '../skills/email-teacher-question.json';
import planLongAssignment from '../skills/plan-long-assignment.json';
import practicePresentation from '../skills/practice-presentation.json';
import preparePresentation from '../skills/prepare-presentation.json';
import studyForQuiz from '../skills/study-for-quiz.json';
import summarizeAReading from '../skills/summarize-a-reading.json';
import takeClassNotes from '../skills/take-class-notes.json';
import useLibraryCatalog from '../skills/use-library-catalog.json';

// ─── Civic Community ───
import addressEnvelope from '../skills/address-envelope.json';
import contactLocalOffice from '../skills/contact-local-office.json';
import copyImportantDocument from '../skills/copy-important-document.json';
import fillOutSimpleForm from '../skills/fill-out-simple-form.json';
import findLocalLibrary from '../skills/find-local-library.json';
import getLibraryCard from '../skills/get-library-card.json';
import keepIdSafe from '../skills/keep-id-safe.json';
import mailPackage from '../skills/mail-package.json';
import readPublicNotice from '../skills/read-public-notice.json';
import sortMail from '../skills/sort-mail.json';

// ─── Emotional Skills ───
import askForSpacePolitely from '../skills/ask-for-space-politely.json';
import chooseNextSmallStep from '../skills/choose-next-small-step.json';
import makeProsConsDecision from '../skills/make-pros-cons-decision.json';
import nameAFeeling from '../skills/name-a-feeling.json';
import noticeSmallWin from '../skills/notice-small-win.json';
import noticeStressSignal from '../skills/notice-stress-signal.json';
import pauseBeforeResponding from '../skills/pause-before-responding.json';
import repairAfterMistake from '../skills/repair-after-mistake.json';
import resetAfterBadDay from '../skills/reset-after-bad-day.json';
import takeCalmDownBreak from '../skills/take-calm-down-break.json';

// ─── Outdoor Everyday ───
import avoidGettingLostCrowd from '../skills/avoid-getting-lost-crowd.json';
import checkWeatherBeforeLeaving from '../skills/check-weather-before-leaving.json';
import crossStreetSafely from '../skills/cross-street-safely.json';
import dressForWeather from '../skills/dress-for-weather.json';
import identifySaferWalkingRoute from '../skills/identify-safer-walking-route.json';
import makeMeetingPointPlan from '../skills/make-meeting-point-plan.json';
import packWaterBottle from '../skills/pack-water-bottle.json';
import readBasicTrailSign from '../skills/read-basic-trail-sign.json';
import tieSecureKnot from '../skills/tie-secure-knot.json';
import useFlashlight from '../skills/use-flashlight.json';

// ─── Housing Living ───
import checkDoorIsLocked from '../skills/check-door-is-locked.json';
import documentRoomCondition from '../skills/document-room-condition.json';
import labelHouseKey from '../skills/label-house-key.json';
import makeSimpleHomeInventory from '../skills/make-simple-home-inventory.json';
import packMovingBox from '../skills/pack-moving-box.json';
import prepareForPowerOutage from '../skills/prepare-for-power-outage.json';
import readUtilityBill from '../skills/read-utility-bill.json';
import reportMaintenanceIssue from '../skills/report-maintenance-issue.json';
import saveElectricityAtHome from '../skills/save-electricity-at-home.json';
import understandSharedChorePlan from '../skills/understand-shared-chore-plan.json';

// ─── Shopping Consumer ───
import checkReturnPolicy from '../skills/check-return-policy.json';
import chooseCorrectSize from '../skills/choose-correct-size.json';
import compareOnlineShippingCosts from '../skills/compare-online-shipping-costs.json';
import compareProductReviews from '../skills/compare-product-reviews.json';
import contactCustomerSupport from '../skills/contact-customer-support.json';
import keepReceipt from '../skills/keep-receipt.json';
import pauseBeforeImpulseBuy from '../skills/pause-before-impulse-buy.json';
import returnItemToStore from '../skills/return-item-to-store.json';
import spotFakeReview from '../skills/spot-fake-review.json';
import useCouponCode from '../skills/use-coupon-code.json';

// ─── All skills ───
const rawSkills: Skill[] = [
  asSkill(backUpFiles), asSkill(checkPrivacySettings), asSkill(connectBluetooth), 
  asSkill(connectWifi), asSkill(createPasswords), asSkill(manageDeviceSettings), 
  asSkill(manageStorageSpace), asSkill(organizePhonePhotos), asSkill(reportSuspiciousMessage), 
  asSkill(restartUpdateApp), asSkill(scanQrCode), asSkill(setScreenTimeLimits), 
  asSkill(shareFileLink), asSkill(spotPhishing), asSkill(takeScreenshot), 
  asSkill(updateDeviceSoftware), asSkill(useCloudStorage), asSkill(useTwoFactorAuthentication), 
  asSkill(askForDirections), asSkill(buyTransitTicket), asSkill(checkTrafficBeforeLeaving), 
  asSkill(findNearestRestroom), asSkill(identifySafePickupSpot), asSkill(navigateLargeBuilding), 
  asSkill(navigateWithoutGps), asSkill(packCarryOnBag), asSkill(planMultiStopTrip), 
  asSkill(planTransitTransfer), asSkill(readBusRouteMap), asSkill(readParkingSigns), 
  asSkill(readSigns), asSkill(readStreetMap), asSkill(readTransitSchedules), 
  asSkill(useAirportBoardingPass), asSkill(useGps), asSkill(useRidesharePickup), 
  asSkill(avoidOverdraftFees), asSkill(calculateTip), asSkill(cancelSubscription), 
  asSkill(compareBankAccounts), asSkill(comparePrices), asSkill(compareSubscriptionCosts), 
  asSkill(depositCheck), asSkill(makeBudget), asSkill(makeSimpleSavingsPlan), 
  asSkill(needsVsWants), asSkill(readBasicBill), asSkill(readPayStub), asSkill(readReceipt), 
  asSkill(recognizeMoneyScam), asSkill(saveForGoal), asSkill(setPaymentReminder), 
  asSkill(splitBill), asSkill(trackSpending), asSkill(understandSalesTax), 
  asSkill(useDebitCardSafely), asSkill(boilPasta), asSkill(checkFoodExpiration), 
  asSkill(cleanKitchenCounter), asSkill(compareGroceryUnitPrices), asSkill(cookRice), 
  asSkill(followRecipe), asSkill(foodSafety), asSkill(heatLeftovers), asSkill(makeGroceryList), 
  asSkill(makeSalad), asSkill(makeSandwich), asSkill(makeScrambledEggs), 
  asSkill(measureIngredients), asSkill(packLunch), asSkill(readNutritionLabel), 
  asSkill(shopForOneMeal), asSkill(simpleStirFry), asSkill(storeFood), asSkill(useKnife), 
  asSkill(useMicrowaveSafely), asSkill(useOvenSafely), asSkill(useStoveSafely), 
  asSkill(washDishes), asSkill(washProduce), asSkill(changeLightbulb), asSkill(changeTrashBag), 
  asSkill(cleanBathroomSink), asSkill(cleanToilet), asSkill(doLaundry), asSkill(fixLooseHandle), 
  asSkill(hammerNail), asSkill(hangPictureFrame), asSkill(makeBed), asSkill(mopSmallSpill), 
  asSkill(patchSmallWallHole), asSkill(plungeToilet), asSkill(replaceAirFilter), 
  asSkill(replaceBatteries), asSkill(replaceToiletPaperRoll), asSkill(resetMessyRoom), 
  asSkill(shutOffWaterValve), asSkill(sweepFloor), asSkill(testSmokeAlarm), asSkill(tightenScrew), 
  asSkill(trashRecycling), asSkill(unclogDrain), asSkill(useTapeMeasure), asSkill(vacuumRoom), 
  asSkill(apologizeClearly), asSkill(askClarifyingQuestion), asSkill(askForHelp), 
  asSkill(disagreeRespectfully), asSkill(endConversationPolitely), asSkill(giveInstructions), 
  asSkill(giveUsefulFeedback), asSkill(introduceYourself), asSkill(leaveVoicemail), 
  asSkill(makePhoneCall), asSkill(makeSmallTalk), asSkill(receiveFeedbackCalmly), 
  asSkill(repairSmallDisagreement), asSkill(replyToInvitation), asSkill(reschedulePolitely), 
  asSkill(sendClearTextMessage), asSkill(setBoundaryRespectfully), asSkill(writeProfessionalEmail), 
  asSkill(brushFloss), asSkill(careForMildIllness), asSkill(checkTemperature), 
  asSkill(describeSymptomsClearly), asSkill(emergencyNumbers), asSkill(findDoctor), 
  asSkill(handleBugBite), asSkill(makeBasicFirstAidKit), asSkill(makeEmergencyContactCard), 
  asSkill(packMedicationForTrip), asSkill(readMedicineLabel), asSkill(recognizeEmergencySituation), 
  asSkill(scheduleDoctorAppointment), asSkill(stayHydrated), asSkill(stopNosebleed), 
  asSkill(treatMinorBurn), asSkill(treatSmallCut), asSkill(useSunscreen), asSkill(washHands), 
  asSkill(arriveOnTime), asSkill(breakTaskIntoSteps), asSkill(cleanDesk), 
  asSkill(createSimpleRoutine), asSkill(findLostItemSystematically), asSkill(makePackingChecklist), 
  asSkill(makeTodoList), asSkill(nameFilesClearly), asSkill(organizeBackpack), 
  asSkill(organizeDigitalFiles), asSkill(packForTrip), asSkill(planHomeworkSession), 
  asSkill(prepareNightBefore), asSkill(prioritizeTasks), asSkill(setReminder), 
  asSkill(sortImportantPapers), asSkill(useCalendar), asSkill(useTimer), 
  asSkill(answerInterviewQuestion), asSkill(arriveForInterview), asSkill(askForReference), 
  asSkill(callOutSickPolitely), asSkill(chooseInterviewClothes), asSkill(fillOutJobApplication), 
  asSkill(makeSimpleResume), asSkill(prepareForInterview), asSkill(readWorkSchedule), 
  asSkill(requestShiftChange), asSkill(trackWorkHours), asSkill(writeThankYouMessage), 
  asSkill(askTeacherForHelp), asSkill(avoidPlagiarism), asSkill(checkAssignmentRequirements), 
  asSkill(citeASource), asSkill(emailTeacherQuestion), asSkill(planLongAssignment), 
  asSkill(practicePresentation), asSkill(preparePresentation), asSkill(studyForQuiz), 
  asSkill(summarizeAReading), asSkill(takeClassNotes), asSkill(useLibraryCatalog), 
  asSkill(addressEnvelope), asSkill(contactLocalOffice), asSkill(copyImportantDocument), 
  asSkill(fillOutSimpleForm), asSkill(findLocalLibrary), asSkill(getLibraryCard), 
  asSkill(keepIdSafe), asSkill(mailPackage), asSkill(readPublicNotice), asSkill(sortMail), 
  asSkill(askForSpacePolitely), asSkill(chooseNextSmallStep), asSkill(makeProsConsDecision), 
  asSkill(nameAFeeling), asSkill(noticeSmallWin), asSkill(noticeStressSignal), 
  asSkill(pauseBeforeResponding), asSkill(repairAfterMistake), asSkill(resetAfterBadDay), 
  asSkill(takeCalmDownBreak), asSkill(avoidGettingLostCrowd), asSkill(checkWeatherBeforeLeaving), 
  asSkill(crossStreetSafely), asSkill(dressForWeather), asSkill(identifySaferWalkingRoute), 
  asSkill(makeMeetingPointPlan), asSkill(packWaterBottle), asSkill(readBasicTrailSign), 
  asSkill(tieSecureKnot), asSkill(useFlashlight), asSkill(checkDoorIsLocked), 
  asSkill(documentRoomCondition), asSkill(labelHouseKey), asSkill(makeSimpleHomeInventory), 
  asSkill(packMovingBox), asSkill(prepareForPowerOutage), asSkill(readUtilityBill), 
  asSkill(reportMaintenanceIssue), asSkill(saveElectricityAtHome), 
  asSkill(understandSharedChorePlan), asSkill(checkReturnPolicy), asSkill(chooseCorrectSize), 
  asSkill(compareOnlineShippingCosts), asSkill(compareProductReviews), 
  asSkill(contactCustomerSupport), asSkill(keepReceipt), asSkill(pauseBeforeImpulseBuy), 
asSkill(returnItemToStore), asSkill(spotFakeReview), asSkill(useCouponCode),
];
export const CATEGORIES: Record<DomainKey, Category> = {
  'digital-basics':    { key: 'digital-basics',    name: 'Digital Basics',     color: '#5A9BA0', icon: '\u{1F4BB}' },
  'navigation':        { key: 'navigation',        name: 'Navigation',         color: '#5A7D9B', icon: '\u{1F5FA}' },
  'money-finance':     { key: 'money-finance',     name: 'Money & Finance',    color: '#B8964A', icon: '\u{1F4B0}' },
  'food-cooking':      { key: 'food-cooking',      name: 'Food & Cooking',     color: '#5B8B6B', icon: '\u{1F372}' },
  'home-care':         { key: 'home-care',         name: 'Home Care',          color: '#9B7E5A', icon: '\u{1F3E0}' },
  'communication':     { key: 'communication',     name: 'Communication',      color: '#8A6B9B', icon: '\u{1F4AC}' },
  'health-safety':     { key: 'health-safety',     name: 'Health & Safety',    color: '#9B5A5A', icon: '\u{2695}'  },
  'organization':      { key: 'organization',      name: 'Organization',       color: '#6B7B8D', icon: '\u{1F4CB}' },
  'career-work':       { key: 'career-work',       name: 'Career & Work',      color: '#7A8B9C', icon: '\u{1F4BC}' },
  'school-learning':   { key: 'school-learning',   name: 'School & Learning',  color: '#8B9B5A', icon: '\u{1F4DA}' },
  'civic-community':   { key: 'civic-community',   name: 'Civic & Community',  color: '#6B8B9B', icon: '\u{1F3DB}' },
  'emotional-skills':  { key: 'emotional-skills',  name: 'Emotional Skills',   color: '#9B7A8B', icon: '\u{1F9E0}' },
  'outdoor-everyday':  { key: 'outdoor-everyday',  name: 'Outdoor & Everyday', color: '#7B9B6A', icon: '\u{1F332}' },
  'housing-living':    { key: 'housing-living',    name: 'Housing & Living',   color: '#9B8B6A', icon: '\u{1F3E1}' },
  'shopping-consumer': { key: 'shopping-consumer', name: 'Shopping & Consumer',color: '#B88B6A', icon: '\u{1F6CD}' },
};

export const CATEGORY_KEYS: DomainKey[] = [
  'digital-basics', 'navigation', 'money-finance', 'food-cooking',
  'home-care', 'communication', 'health-safety', 'organization',
  'career-work', 'school-learning', 'civic-community', 'emotional-skills',
  'outdoor-everyday', 'housing-living', 'shopping-consumer',
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
export function getChildren(skillId: string): Skill[] { return ALL_SKILLS.filter((s) => s.suggestedPrerequisites.includes(skillId)); }
export function getSkillState(_skill: Skill, completedIds: string[]): 'completed' | 'active' {
  return completedIds.includes(_skill.id) ? 'completed' : 'active';
}
