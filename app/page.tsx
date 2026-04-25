'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INDUSTRIES = ['Tech', 'Gaming', 'Sports', 'Luxury', 'AI', 'Finance', 'Consulting', 'Healthcare', 'Other'];

interface FormData {
  anonymity: 'named' | 'anonymous' | '';
  fullName: string;
  jobTitle: string;
  seniorityLevel: string;
  cityCountry: string;
  hideLocation: boolean;
  openToRemote: string;
  relocation: string;
  relocationDestination: string;
  workAuthorization: string;
  workAuthorizationCountry: string;
  availability: string;
  availabilityMonth: string;
  contactEmail: string;
  industries: string[];
  keyAchievement: string;
  technicalTools: string;
  colleagueQuote: string;
  quoteAttribution: string;
  whatMakesRare: string;
  whyLooking: string;
  anythingElse: string;
  consent: boolean;
}

const initial: FormData = {
  anonymity: '',
  fullName: '',
  jobTitle: '',
  seniorityLevel: 'Senior',
  cityCountry: '',
  hideLocation: false,
  openToRemote: 'Yes',
  relocation: 'N/A',
  relocationDestination: '',
  workAuthorization: 'N/A',
  workAuthorizationCountry: '',
  availability: 'Immediate',
  availabilityMonth: '',
  contactEmail: '',
  industries: [],
  keyAchievement: '',
  technicalTools: '',
  colleagueQuote: '',
  quoteAttribution: '',
  whatMakesRare: '',
  whyLooking: '',
  anythingElse: '',
  consent: false,
};

const inputCls =
  'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition';
const inputErrCls =
  'w-full border border-red-400 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition';
const selectCls = `${inputCls} bg-white cursor-pointer`;
const textareaCls = `${inputCls} resize-none`;

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function FieldNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1">{children}</p>;
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
        value ? 'bg-gray-900' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.jobTitle.trim()) e.jobTitle = 'Required';
      if (!data.cityCountry.trim()) e.cityCountry = 'Required';
      if (!data.contactEmail.trim()) e.contactEmail = 'Required';
      else if (!/\S+@\S+\.\S+/.test(data.contactEmail)) e.contactEmail = 'Please enter a valid email';
    }
    if (s === 3 && !data.consent) e.consent = 'Your consent is required to submit';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep(s => s + 1);
  }

  function back() {
    setErrors({});
    setStep(s => s - 1);
  }

  async function submit() {
    if (!validate(3)) return;
    setSubmitting(true);
    setSubmitErr('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/confirmation?type=${data.anonymity}`);
      } else {
        setSubmitErr(json.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitErr('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepLabels = ['The basics', 'The substance', 'Context for Sophie'];

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Talent Spotlight</h1>
          <p className="mt-1.5 text-sm text-gray-400">by Sophie Mona Pagès</p>
        </header>

        {/* Progress bar — steps 1–3 only */}
        {step >= 1 && step <= 3 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-medium text-gray-500">Step {step} of 3</span>
              <span className="text-xs text-gray-400">{stepLabels[step - 1]}</span>
            </div>
            <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 0: Anonymity choice ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1.5">How would you like to appear?</h2>
            <p className="text-sm text-gray-500 mb-8">Your choice shapes the entire post.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  value: 'named' as const,
                  icon: '🔓',
                  title: 'Named',
                  desc: 'Use my name and contact details. People can reach me directly.',
                },
                {
                  value: 'anonymous' as const,
                  icon: '🔒',
                  title: 'Anonymous',
                  desc: "Don't use my name or anything that identifies me. Sophie handles introductions.",
                },
              ].map(card => (
                <button
                  key={card.value}
                  onClick={() => {
                    set('anonymity', card.value);
                    setStep(1);
                  }}
                  className="text-left border-2 border-gray-200 rounded-xl p-6 hover:border-gray-900 hover:bg-gray-50 transition-all focus:outline-none focus:border-gray-900"
                >
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1.5">{card.title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{card.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: The basics ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">The basics</h2>
              <p className="text-sm text-gray-400 mt-1">Where you are and what you do.</p>
            </div>

            {data.anonymity === 'named' && (
              <div>
                <Label>Full name</Label>
                <input
                  type="text"
                  className={inputCls}
                  value={data.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="e.g. Alex Martin"
                />
                <FieldNote>Used in your post. Never shared without your consent.</FieldNote>
              </div>
            )}

            <div>
              <Label>Job title / function *</Label>
              <input
                type="text"
                className={errors.jobTitle ? inputErrCls : inputCls}
                value={data.jobTitle}
                onChange={e => set('jobTitle', e.target.value)}
                placeholder="e.g. Growth Marketing Manager"
              />
              <ErrorMsg msg={errors.jobTitle} />
            </div>

            <div>
              <Label>Seniority level</Label>
              <select
                className={selectCls}
                value={data.seniorityLevel}
                onChange={e => set('seniorityLevel', e.target.value)}
              >
                {['Junior', 'Mid', 'Senior', 'Lead', 'Executive'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>City, Country *</Label>
              <input
                type="text"
                className={errors.cityCountry ? inputErrCls : inputCls}
                value={data.cityCountry}
                onChange={e => set('cityCountry', e.target.value)}
                placeholder="e.g. Paris, France"
              />
              <ErrorMsg msg={errors.cityCountry} />
            </div>

            {data.anonymity === 'anonymous' && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3.5">
                <div>
                  <div className="text-sm font-medium text-gray-700">Hide exact location?</div>
                  <div className="text-xs text-gray-400 mt-0.5">Use region only in the post</div>
                </div>
                <Toggle value={data.hideLocation} onChange={v => set('hideLocation', v)} />
              </div>
            )}

            <div>
              <Label>Open to remote?</Label>
              <select
                className={selectCls}
                value={data.openToRemote}
                onChange={e => set('openToRemote', e.target.value)}
              >
                {['Yes', 'Hybrid', 'No'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Relocation</Label>
              <select
                className={selectCls}
                value={data.relocation}
                onChange={e => set('relocation', e.target.value)}
              >
                {['N/A', 'Open', 'Not open', 'Already relocated'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {data.relocation === 'Already relocated' && (
                <input
                  type="text"
                  className={`${inputCls} mt-2`}
                  value={data.relocationDestination}
                  onChange={e => set('relocationDestination', e.target.value)}
                  placeholder="Where to? e.g. Amsterdam, Netherlands"
                />
              )}
            </div>

            <div>
              <Label>Work authorization</Label>
              <select
                className={selectCls}
                value={data.workAuthorization}
                onChange={e => set('workAuthorization', e.target.value)}
              >
                {['N/A', 'EU citizen', 'Visa required', 'Visa approved'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {(data.workAuthorization === 'Visa required' || data.workAuthorization === 'Visa approved') && (
                <input
                  type="text"
                  className={`${inputCls} mt-2`}
                  value={data.workAuthorizationCountry}
                  onChange={e => set('workAuthorizationCountry', e.target.value)}
                  placeholder="Target country e.g. Germany"
                />
              )}
            </div>

            <div>
              <Label>Availability</Label>
              <select
                className={selectCls}
                value={data.availability}
                onChange={e => set('availability', e.target.value)}
              >
                {['Immediate', 'Specific month', 'Freelance', 'Open to discussion'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {data.availability === 'Specific month' && (
                <input
                  type="month"
                  className={`${inputCls} mt-2`}
                  value={data.availabilityMonth}
                  onChange={e => set('availabilityMonth', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Contact email *</Label>
              <input
                type="email"
                className={errors.contactEmail ? inputErrCls : inputCls}
                value={data.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
                placeholder="you@example.com"
              />
              <FieldNote>
                {data.anonymity === 'named'
                  ? 'Will appear in the post so people can reach you directly.'
                  : 'Stored privately. Sophie will only share it with your explicit consent.'}
              </FieldNote>
              <ErrorMsg msg={errors.contactEmail} />
            </div>
          </div>
        )}

        {/* ── STEP 2: The substance ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">The substance</h2>
              <p className="text-sm text-gray-400 mt-1">What makes you worth spotlighting?</p>
            </div>

            <div>
              <Label>Industries you want to reach</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {INDUSTRIES.map(ind => {
                  const checked = data.industries.includes(ind);
                  return (
                    <label
                      key={ind}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer text-sm transition-all select-none ${
                        checked
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...data.industries, ind]
                            : data.industries.filter(i => i !== ind);
                          set('industries', next);
                        }}
                      />
                      {ind}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Key achievement with a number</Label>
              <textarea
                className={textareaCls}
                rows={3}
                maxLength={150}
                value={data.keyAchievement}
                onChange={e => set('keyAchievement', e.target.value)}
                placeholder="e.g. Cut CAC by 40% at a Series B SaaS in 18 months"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{data.keyAchievement.length}/150</p>
            </div>

            <div>
              <Label>Technical tools / stack</Label>
              <input
                type="text"
                className={inputCls}
                value={data.technicalTools}
                onChange={e => set('technicalTools', e.target.value)}
                placeholder="e.g. Google Ads, Meta Ads, GA4, Salesforce"
              />
            </div>

            <div>
              <Label>
                Quote from a colleague or manager{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </Label>
              <textarea
                className={textareaCls}
                rows={3}
                value={data.colleagueQuote}
                onChange={e => set('colleagueQuote', e.target.value)}
                placeholder="In their own words..."
              />
            </div>

            {data.colleagueQuote.trim() && (
              <div>
                <Label>Quote attribution</Label>
                <input
                  type="text"
                  className={inputCls}
                  value={data.quoteAttribution}
                  onChange={e => set('quoteAttribution', e.target.value)}
                  placeholder="e.g. a former manager / Head of Growth at X"
                />
              </div>
            )}

            <div>
              <Label>What makes you rare</Label>
              <textarea
                className={textareaCls}
                rows={3}
                maxLength={200}
                value={data.whatMakesRare}
                onChange={e => set('whatMakesRare', e.target.value)}
                placeholder="Not adjectives. One true thing."
              />
              <p className="text-xs text-gray-400 text-right mt-1">{data.whatMakesRare.length}/200</p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Context for Sophie ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Context for Sophie</h2>
              <p className="text-sm text-gray-400 mt-1">Background that stays off the record.</p>
            </div>

            <div>
              <Label>
                Why are you looking?{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </Label>
              <p className="text-xs text-gray-400 mb-2">Sophie may use this for context, never in the post.</p>
              <textarea
                className={textareaCls}
                rows={3}
                maxLength={150}
                value={data.whyLooking}
                onChange={e => set('whyLooking', e.target.value)}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{data.whyLooking.length}/150</p>
            </div>

            <div>
              <Label>
                Anything else Sophie should know?{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </Label>
              <textarea
                className={textareaCls}
                rows={4}
                value={data.anythingElse}
                onChange={e => set('anythingElse', e.target.value)}
              />
            </div>

            <div>
              <label
                className={`flex items-start gap-3 cursor-pointer ${errors.consent ? 'text-red-500' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={data.consent}
                  onChange={e => set('consent', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {data.anonymity === 'named'
                    ? 'I agree that Sophie may publish a LinkedIn post about me using the information above.'
                    : 'I agree that Sophie may publish an anonymous LinkedIn post and share my contact details only with my explicit consent, on a case-by-case basis.'}
                </span>
              </label>
              <ErrorMsg msg={errors.consent} />
            </div>

            {submitErr && (
              <p className="text-sm text-red-500 rounded-lg bg-red-50 px-4 py-3">{submitErr}</p>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        {step >= 1 && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={back}
              disabled={submitting}
              className="flex-1 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={next}
                className="flex-[2] bg-gray-900 text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 transition"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-[2] bg-gray-900 text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send my Spotlight request'}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
