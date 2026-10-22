import React, { useState, useEffect } from 'react';
import { Settings, Info, Save, RotateCcw, Check, Sparkles, CheckCircle2, Undo2 } from 'lucide-react';
import { SchedulePreferences } from '../types';

interface SettingsPanelProps {
  preferences: SchedulePreferences;
  onUpdatePreferences: (updated: SchedulePreferences) => void;
  onResetToDefaults: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullName: 'Sunday' },
  { value: 1, label: 'Mon', fullName: 'Monday' },
  { value: 2, label: 'Tue', fullName: 'Tuesday' },
  { value: 3, label: 'Wed', fullName: 'Wednesday' },
  { value: 4, label: 'Thu', fullName: 'Thursday' },
  { value: 5, label: 'Fri', fullName: 'Friday' },
  { value: 6, label: 'Sat', fullName: 'Saturday' }
];

export default function SettingsPanel({
  preferences,
  onUpdatePreferences,
  onResetToDefaults
}: SettingsPanelProps) {
  const [draft, setDraft] = useState<SchedulePreferences>(preferences);
  const [justSaved, setJustSaved] = useState(false);

  // Sync draft when preferences prop updates from parent
  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  // Check if draft has unsaved changes compared to actual active preferences
  const hasChanges = 
    draft.intensity !== preferences.intensity ||
    draft.dailyHourLimit !== preferences.dailyHourLimit ||
    draft.workDays.length !== preferences.workDays.length ||
    draft.workDays.some(d => !preferences.workDays.includes(d));

  const handleSave = () => {
    onUpdatePreferences(draft);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 3000);
  };

  const handleRevert = () => {
    setDraft(preferences);
  };

  const handleIntensitySelect = (intensity: 'casual' | 'balanced' | 'intense', immediateSave: boolean = false) => {
    const updated = {
      ...draft,
      intensity
    };
    setDraft(updated);
    if (immediateSave) {
      onUpdatePreferences(updated);
      setJustSaved(true);
      setTimeout(() => {
        setJustSaved(false);
      }, 3000);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    let newWorkDays = [...draft.workDays];
    if (newWorkDays.includes(dayValue)) {
      if (newWorkDays.length === 1) return; // Keep at least one day
      newWorkDays = newWorkDays.filter(d => d !== dayValue);
    } else {
      newWorkDays.push(dayValue);
      newWorkDays.sort();
    }
    setDraft({
      ...draft,
      workDays: newWorkDays
    });
  };

  const handleHourLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dailyHourLimit = Number(e.target.value) || 2;
    setDraft({
      ...draft,
      dailyHourLimit
    });
  };

  const selectPreset = (preset: 'weekdays' | 'weekends' | 'everyday') => {
    let workDays: number[] = [];
    if (preset === 'weekdays') {
      workDays = [1, 2, 3, 4, 5];
    } else if (preset === 'weekends') {
      workDays = [0, 6];
    } else if (preset === 'everyday') {
      workDays = [0, 1, 2, 3, 4, 5, 6];
    }
    setDraft({
      ...draft,
      workDays
    });
  };

  return (
    <div id="settings-panel-container" className="bg-white border-4 border-rose-100 rounded-[2.5rem] p-6 shadow-xl space-y-6 text-slate-800">
      
      {/* Top Header with title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 border-2 border-rose-200 flex items-center justify-center shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Study Configuration</h3>
            <p className="text-[11px] font-bold text-slate-400">Customize study style, working days & pace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              type="button"
              id="revert-settings-btn"
              onClick={handleRevert}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              title="Discard unsaved changes"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Discard
            </button>
          )}

          <button
            type="button"
            id="reset-settings-btn"
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors text-xs font-bold uppercase cursor-pointer px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Defaults
          </button>

          {/* Primary Save Button in Header */}
          <button
            type="button"
            id="save-settings-btn-header"
            onClick={handleSave}
            disabled={!hasChanges && !justSaved}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-sm ${
              justSaved 
                ? 'bg-emerald-600 text-white' 
                : hasChanges 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse ring-4 ring-indigo-100' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                Save Changes {hasChanges ? '(1)' : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {justSaved && (
        <div id="settings-saved-banner" className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs font-black animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span>Study configuration saved! Your milestone roadmap has been updated.</span>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasChanges && !justSaved && (
        <div id="settings-unsaved-banner" className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-amber-900 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved study configuration changes. Click <strong>Save Configuration</strong> to apply.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-xs"
          >
            Save Now
          </button>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Study Intensity Mode */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-black text-rose-500 uppercase tracking-widest">
                Preparation Intensity Style
              </label>
              <p className="text-slate-500 font-bold text-xs mt-0.5">
                Switch between study approaches. Select a mode and click <strong>Save</strong> to apply to your roadmap.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
              Active: {preferences.intensity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            
            {/* Casual */}
            <div
              id="intensity-card-casual"
              onClick={() => handleIntensitySelect('casual')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                draft.intensity === 'casual'
                  ? 'border-emerald-500 bg-emerald-50/70 text-slate-900 shadow-md ring-2 ring-emerald-200'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-wider ${draft.intensity === 'casual' ? 'text-emerald-800' : 'text-slate-700'}`}>
                    Casual Study
                  </span>
                  {preferences.intensity === 'casual' && (
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 block font-semibold leading-relaxed">
                  Spreads tasks well in advance (1.5x earlier timeline). Maximum breathing room with zero cramming.
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700">Early & Relaxed</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntensitySelect('casual', true);
                  }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase cursor-pointer transition-all ${
                    preferences.intensity === 'casual'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300'
                  }`}
                >
                  {preferences.intensity === 'casual' ? 'Active' : 'Save & Switch'}
                </button>
              </div>
            </div>

            {/* Balanced */}
            <div
              id="intensity-card-balanced"
              onClick={() => handleIntensitySelect('balanced')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                draft.intensity === 'balanced'
                  ? 'border-indigo-500 bg-indigo-50/70 text-slate-900 shadow-md ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-wider ${draft.intensity === 'balanced' ? 'text-indigo-800' : 'text-slate-700'}`}>
                    Balanced Pace
                  </span>
                  {preferences.intensity === 'balanced' && (
                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 block font-semibold leading-relaxed">
                  Standard recommended syllabus pace. Distributes workloads evenly leading directly to deadlines.
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-700">Steady Rhythm</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntensitySelect('balanced', true);
                  }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase cursor-pointer transition-all ${
                    preferences.intensity === 'balanced'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-300'
                  }`}
                >
                  {preferences.intensity === 'balanced' ? 'Active' : 'Save & Switch'}
                </button>
              </div>
            </div>

            {/* Cram Mode */}
            <div
              id="intensity-card-intense"
              onClick={() => handleIntensitySelect('intense')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                draft.intensity === 'intense'
                  ? 'border-amber-500 bg-amber-50/70 text-slate-900 shadow-md ring-2 ring-amber-200'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-wider ${draft.intensity === 'intense' ? 'text-amber-800' : 'text-slate-700'}`}>
                    High Intensity (Cram)
                  </span>
                  {preferences.intensity === 'intense' && (
                    <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 block font-semibold leading-relaxed">
                  Packs study sessions in the final days (0.5x timeline). High productivity sprint format.
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-700">Sprint Focus</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntensitySelect('intense', true);
                  }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase cursor-pointer transition-all ${
                    preferences.intensity === 'intense'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-300'
                  }`}
                >
                  {preferences.intensity === 'intense' ? 'Active' : 'Save & Switch'}
                </button>
              </div>
            </div>

          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Study Work Days */}
        <div className="space-y-2.5">
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-xs font-black text-rose-500 uppercase tracking-widest">
                Working Days
              </label>
              <p className="text-slate-500 font-bold text-xs mt-0.5">
                Select which days of the week you are willing to spend studying.
              </p>
            </div>
            
            {/* Presets */}
            <div className="flex gap-1.5 text-[10px] font-black uppercase mt-1">
              <button
                type="button"
                id="preset-weekdays-btn"
                onClick={() => selectPreset('weekdays')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border-2 border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
              >
                Weekdays
              </button>
              <button
                type="button"
                id="preset-weekends-btn"
                onClick={() => selectPreset('weekends')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border-2 border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
              >
                Weekends
              </button>
              <button
                type="button"
                id="preset-everyday-btn"
                onClick={() => selectPreset('everyday')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border-2 border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
              >
                Everyday
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {DAYS_OF_WEEK.map(day => {
              const isActive = draft.workDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  id={`day-select-btn-${day.value}`}
                  onClick={() => handleDayToggle(day.value)}
                  className={`w-11 h-11 rounded-xl border-2 text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                  title={day.fullName}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Daily Study Hour Limit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-black text-rose-500 uppercase tracking-widest">
                Daily Study Hour Limit
              </label>
              <p className="text-slate-500 font-bold text-xs mt-0.5">
                The maximum hours of preparation we will schedule on any single day.
              </p>
            </div>
            <span className="text-sm font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 px-3 py-1.5 rounded-xl font-mono">
              {draft.dailyHourLimit} hrs / day
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <input
              type="range"
              id="hour-limit-slider"
              min="1"
              max="8"
              step="1"
              value={draft.dailyHourLimit}
              onChange={handleHourLimitChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none border-2 border-slate-200"
            />
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 text-[11px] text-slate-600 font-medium flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              If your curriculum becomes very concentrated, our smart scheduling algorithm will automatically distribute tasks as evenly as possible. If it exceeds your limit, you will see a workload peak warning badge on your dashboard.
            </span>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-bold">
            {hasChanges ? (
              <span className="text-amber-600 font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping"></span>
                Unsaved changes pending. Click Save Configuration to apply.
              </span>
            ) : (
              <span className="text-slate-400">
                All study configurations are saved and in sync.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasChanges && (
              <button
                type="button"
                onClick={handleRevert}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-slate-600 hover:text-slate-900 border-2 border-slate-200 rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Revert
              </button>
            )}

            <button
              type="button"
              id="save-settings-btn-bottom"
              onClick={handleSave}
              disabled={!hasChanges && !justSaved}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-md ${
                justSaved
                  ? 'bg-emerald-600 text-white'
                  : hasChanges
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
