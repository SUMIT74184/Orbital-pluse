import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings · DSA Pulse" };

export default async function SettingsPage() {
  const user = await requireUser();
  const zones = Intl.supportedValuesOf("timeZone");
  const timezones = zones.includes(user.timezone) ? zones : [user.timezone, ...zones];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Changes apply from today if you haven&apos;t started today&apos;s plan yet, otherwise from tomorrow. New revision days only
          apply to questions you solve after saving.
        </p>
      </div>
      <SettingsForm
        timezones={timezones}
        initial={{
          dailyTarget: user.dailyTarget,
          revisionDays: user.revisionDays.join(", "),
          timezone: user.timezone,
          schedule: user.schedule,
          tracks: user.tracks,
        }}
      />
    </div>
  );
}
