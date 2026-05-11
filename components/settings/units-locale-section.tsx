"use client";

import { SettingsSection, SettingRow } from "./settings-section";
import { SegmentedControl } from "./segmented-control";
import { usePrefs } from "@/hooks/use-prefs";

export function UnitsLocaleSection() {
  const [prefs, setPrefs] = usePrefs();

  return (
    <SettingsSection
      title="Units & Locale"
      description="How temperatures, wind and rainfall are displayed."
    >
      <SettingRow
        label="Temperature"
        description="Celsius or Fahrenheit."
        control={
          <SegmentedControl
            value={prefs.units.temperature}
            onChange={(temperature) => setPrefs({ units: { ...prefs.units, temperature } })}
            options={[
              { value: "celsius", label: "°C" },
              { value: "fahrenheit", label: "°F" },
            ]}
          />
        }
      />
      <SettingRow
        label="Wind speed"
        description="Used across all forecasts."
        control={
          <SegmentedControl
            value={prefs.units.wind}
            onChange={(wind) => setPrefs({ units: { ...prefs.units, wind } })}
            options={[
              { value: "kmh", label: "km/h" },
              { value: "mph", label: "mph" },
              { value: "ms", label: "m/s" },
            ]}
          />
        }
      />
      <SettingRow
        label="Time format"
        description="Affects hourly and sunrise/sunset."
        control={
          <SegmentedControl
            value={prefs.timeFormat}
            onChange={(timeFormat) => setPrefs({ timeFormat })}
            options={[
              { value: "12h", label: "12h" },
              { value: "24h", label: "24h" },
            ]}
          />
        }
      />
      <SettingRow
        label="First day of week"
        description="Used on the Daily view."
        control={
          <SegmentedControl
            value={prefs.firstDayOfWeek}
            onChange={(firstDayOfWeek) => setPrefs({ firstDayOfWeek })}
            options={[
              { value: "sun", label: "Sun" },
              { value: "mon", label: "Mon" },
            ]}
          />
        }
      />
    </SettingsSection>
  );
}
