import { useState } from 'react';

export type DraftPhase =
  | 'blue-ban-1'
  | 'red-ban-1'
  | 'blue-ban-2'
  | 'red-ban-2'
  | 'blue-ban-3'
  | 'red-ban-3'
  | 'blue-pick-1'
  | 'red-pick-1'
  | 'red-pick-2'
  | 'blue-pick-2'
  | 'blue-pick-3'
  | 'red-pick-3'
  | 'complete';

export interface DraftState {
  blueBans: string[];
  redBans: string[];
  bluePicks: string[];
  redPicks: string[];
  currentPhaseIndex: number;
}

export interface PhaseInfo {
  phase: DraftPhase;
  team: 'blue' | 'red';
  action: 'ban' | 'pick';
  label: string;
}

export const DRAFT_PHASES: PhaseInfo[] = [
  { phase: 'blue-ban-1', team: 'blue', action: 'ban', label: 'Blue Ban 1' },
  { phase: 'red-ban-1', team: 'red', action: 'ban', label: 'Red Ban 1' },
  { phase: 'blue-ban-2', team: 'blue', action: 'ban', label: 'Blue Ban 2' },
  { phase: 'red-ban-2', team: 'red', action: 'ban', label: 'Red Ban 2' },
  { phase: 'blue-ban-3', team: 'blue', action: 'ban', label: 'Blue Ban 3' },
  { phase: 'red-ban-3', team: 'red', action: 'ban', label: 'Red Ban 3' },
  { phase: 'blue-pick-1', team: 'blue', action: 'pick', label: 'Blue Pick 1' },
  { phase: 'red-pick-1', team: 'red', action: 'pick', label: 'Red Pick 1' },
  { phase: 'red-pick-2', team: 'red', action: 'pick', label: 'Red Pick 2' },
  { phase: 'blue-pick-2', team: 'blue', action: 'pick', label: 'Blue Pick 2' },
  { phase: 'blue-pick-3', team: 'blue', action: 'pick', label: 'Blue Pick 3' },
  { phase: 'red-pick-3', team: 'red', action: 'pick', label: 'Red Pick 3' },
];

export const useDraftEngine = () => {
  const [state, setState] = useState<DraftState>({
    blueBans: [],
    redBans: [],
    bluePicks: [],
    redPicks: [],
    currentPhaseIndex: 0,
  });

  const currentStep = state.currentPhaseIndex < DRAFT_PHASES.length
    ? DRAFT_PHASES[state.currentPhaseIndex]
    : null;

  const currentPhase: DraftPhase = currentStep ? currentStep.phase : 'complete';
  const currentActor: 'blue' | 'red' | null = currentStep ? currentStep.team : null;
  const currentAction: 'ban' | 'pick' | null = currentStep ? currentStep.action : null;

  /**
   * Guard condition: Checks if a brawler is already locked in any team's pick or ban arrays.
   */
  const isBrawlerUnavailable = (brawlerId: string): boolean => {
    return (
      state.blueBans.includes(brawlerId) ||
      state.redBans.includes(brawlerId) ||
      state.bluePicks.includes(brawlerId) ||
      state.redPicks.includes(brawlerId)
    );
  };

  /**
   * Attempts to lock a brawler for the current drafting phase.
   * Enforces availability checking guards.
   */
  const selectBrawler = (brawlerId: string): boolean => {
    if (!currentStep) return false;

    // Guard: Prevent picking a brawler that is already taken
    if (isBrawlerUnavailable(brawlerId)) {
      console.warn(`[DraftEngine] Selection rejected. Brawler "${brawlerId}" is already selected or banned.`);
      return false;
    }

    setState((prev) => {
      const updated = { ...prev };

      if (currentStep.action === 'ban') {
        if (currentStep.team === 'blue') {
          updated.blueBans = [...prev.blueBans, brawlerId];
        } else {
          updated.redBans = [...prev.redBans, brawlerId];
        }
      } else {
        if (currentStep.team === 'blue') {
          updated.bluePicks = [...prev.bluePicks, brawlerId];
        } else {
          updated.redPicks = [...prev.redPicks, brawlerId];
        }
      }

      updated.currentPhaseIndex = prev.currentPhaseIndex + 1;
      return updated;
    });

    return true;
  };

  const resetDraft = () => {
    setState({
      blueBans: [],
      redBans: [],
      bluePicks: [],
      redPicks: [],
      currentPhaseIndex: 0,
    });
  };

  return {
    blueBans: state.blueBans,
    redBans: state.redBans,
    bluePicks: state.bluePicks,
    redPicks: state.redPicks,
    currentPhaseIndex: state.currentPhaseIndex,
    currentPhase,
    currentActor,
    currentAction,
    currentStep,
    isBrawlerUnavailable,
    selectBrawler,
    resetDraft,
    phasesTotal: DRAFT_PHASES.length,
  };
};
