import { useState, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaRegCalendarCheck, FaHeartbeat, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { aiService } from '../services/api';

/* ── Formatted AI Message Parser ── */
function FormattedMessage({ text }) {
  if (!text) return null;

  if (!text.includes('###') && !text.includes('•') && !text.includes('\n- ') && !text.includes('**')) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const lines = text.split('\n');
  const sections = [];
  let currentSection = null;

  const pushCurrentSection = () => {
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith('###')) {
      pushCurrentSection();
      const rawTitle = line.replace(/^###\s*/, '').trim();
      const cleanTitle = rawTitle.replace(/^(\d+\.|\u2022|\-)\s*/, '').trim();
      
      let secType = 'general';
      if (/summary|overview/i.test(cleanTitle)) secType = 'summary';
      else if (/details|procedure/i.test(cleanTitle)) secType = 'details';
      else if (/recommend/i.test(cleanTitle)) secType = 'recommendation';
      else if (/warning|disclaimer|notice|important/i.test(cleanTitle)) secType = 'warning';

      currentSection = { type: secType, title: cleanTitle, items: [], text: '' };
    } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      const itemText = line.replace(/^[-•*]\s*/, '').trim();
      if (!currentSection) {
        currentSection = { type: 'general', title: '', items: [], text: '' };
      }
      currentSection.items.push(itemText);
    } else {
      if (!currentSection) {
        currentSection = { type: 'general', title: '', items: [], text: '' };
      }
      if (currentSection.text) {
        currentSection.text += ' ' + line;
      } else {
        currentSection.text = line;
      }
    }
  });
  pushCurrentSection();

  const renderFormattedText = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 my-0.5 text-xs text-slate-700">
      {sections.map((sec, idx) => {
        if (sec.type === 'warning') {
          return (
            <div key={idx} className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 text-amber-900 shadow-xs my-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs mb-1.5">
                <FaExclamationTriangle className="text-amber-600 shrink-0 text-sm" />
                <span>{sec.title || 'Medical Disclaimer'}</span>
              </div>
              {sec.text && <p className="text-[11px] leading-relaxed text-amber-800/90 mb-2">{renderFormattedText(sec.text)}</p>}
              {sec.items.length > 0 && (
                <ul className="space-y-1.5 text-[11px] text-amber-900">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{renderFormattedText(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        if (sec.type === 'recommendation') {
          return (
            <div key={idx} className="bg-emerald-50/70 border border-emerald-100/90 rounded-xl p-3 text-slate-800 my-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{sec.title || 'Recommendations'}</span>
              </div>
              {sec.text && <p className="text-xs leading-relaxed mb-2 text-slate-700">{renderFormattedText(sec.text)}</p>}
              {sec.items.length > 0 && (
                <ul className="space-y-1.5 text-[11.5px]">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed text-slate-700">{renderFormattedText(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        return (
          <div key={idx} className="space-y-1.5">
            {sec.title && (
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1 mt-1">
                {sec.title}
              </h4>
            )}
            {sec.text && (
              <p className="text-slate-700 text-xs leading-relaxed">{renderFormattedText(sec.text)}</p>
            )}
            {sec.items.length > 0 && (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{renderFormattedText(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── AI Assistant Chat ── */
function AIAssistant() {
  const [msgs, setMsgs] = useState([
    { id: 1, from: 'ai', text: 'Hello! I am PlusCare AI. How can I assist with your health query today?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;

    const userMsgObj = { id: Date.now(), from: 'user', text: msg };
    const updatedMsgs = [...msgs, userMsgObj];
    setMsgs(updatedMsgs);
    setInput('');
    setTyping(true);

    try {
      // Map messages for OpenAI backend endpoint
      const formattedHistory = updatedMsgs.map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await aiService.chat(formattedHistory);
      const replyText = res.data?.reply || "I'm here to help with your health questions.";
      
      setMsgs(p => [...p, { id: Date.now() + 1, from: 'ai', text: replyText }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorDetail = error.response?.data?.message || "Please sign in to interact with PlusCare AI Assistant.";
      setMsgs(p => [...p, { id: Date.now() + 1, from: 'ai', text: `[Notice]: ${errorDetail}` }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col h-full min-h-[480px]">
      <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 self-start">
        <FaComments /> Conversational Agent v2.0
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-1">PlusCare AI Assistant</h3>
      <p className="text-slate-500 text-xs mb-4">Ask about test prep, symptoms, or find the right specialist.</p>

      <div className="flex-1 border border-slate-100 bg-slate-50/40 rounded-xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3">
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${m.from === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200/60 rounded-bl-sm shadow-sm'}`}>
                {m.from === 'user' ? m.text : <FormattedMessage text={m.text} />}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200/60 px-3.5 py-2.5 rounded-xl rounded-bl-sm flex gap-1 shadow-sm">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-slate-100 bg-slate-100/40">
          {['Blood test prep', 'Dehydration signs', 'Cardiac screening'].map(q => (
            <button key={q} onClick={() => send(q)} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shrink-0 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">{q}</button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex border-t border-slate-100 bg-white p-2 gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a health question..." className="flex-1 text-xs outline-none px-2 text-slate-700 bg-transparent" />
          <button type="submit" disabled={!input.trim() || typing} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
            <FaPaperPlane className="text-xs" />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Smart Appointment Scheduler ── */
function SmartScheduler({ onAppointmentBooked }) {
  const [step, setStep] = useState(1);
  const [symptom, setSymptom] = useState('');
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', date: '', time: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const analyze = async (e) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setStep(2);
    setTriage(null);
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await aiService.triage(symptom);
      if (res.data?.success && res.data?.triage) {
        const tr = res.data.triage;
        setTriage({
          dept: tr.department,
          doctor: tr.doctor,
          doctorId: tr.doctorId,
          advice: tr.advice,
          priority: tr.priority || 'Medium',
          slots: tr.availableSlots || ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
          color: tr.priority === 'High' || tr.priority === 'Urgent'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-teal-50 border-teal-200 text-teal-800',
        });
      }
    } catch (err) {
      console.error("AI Triage Error:", err);
      const msg = err.response?.data?.message || "Please sign in to perform AI auto-triage.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const bookingPayload = {
        doctorId: triage?.doctorId,
        department: triage?.dept,
        appointmentDate: form.date,
        timeSlot: form.time,
        reason: symptom,
        notes: `Patient: ${form.name} (${form.email})`
      };

      const res = await aiService.bookSmartAppointment(bookingPayload);
      if (res.data?.success) {
        setStep(3);
        if (onAppointmentBooked) {
          onAppointmentBooked(res.data.appointment);
        }
      }
    } catch (err) {
      console.error("Booking Error:", err);
      const message = err.response?.data?.message || "Failed to confirm appointment slot. Please try another time slot.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSymptom('');
    setTriage(null);
    setErrorMsg('');
    setForm({ name: '', email: '', date: '', time: '' });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col h-full min-h-[480px]">
      <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 self-start">
        <FaRegCalendarCheck /> Auto-Triage Scheduling
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-1">Smart Appointment Booking</h3>
      <p className="text-slate-500 text-xs mb-4">Describe your symptoms and AI will route you to the right specialist.</p>

      <div className="flex-1 border border-slate-100 bg-slate-50/40 rounded-xl p-4 flex flex-col justify-center">

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={analyze} className="flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mx-auto shadow-sm">
              <FaHeartbeat className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">Describe Your Concern</h4>
              <p className="text-[10px] text-slate-400">e.g. "chest tightness", "severe headache and sensitivity to light"</p>
            </div>
            <textarea rows={3} required value={symptom} onChange={e => setSymptom(e.target.value)} placeholder="Type symptoms here..." className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white outline-none focus:border-blue-400 text-slate-700 resize-none" />
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
              Analyze & Find Specialist
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-[11px] text-slate-400">AI identifying optimal department from hospital database...</span>
              </div>
            ) : errorMsg && !triage ? (
              <div className="flex flex-col items-center gap-3 text-center p-4">
                <FaExclamationTriangle className="text-amber-500 text-2xl" />
                <p className="text-xs text-slate-700 font-semibold">{errorMsg}</p>
                <button type="button" onClick={reset} className="text-xs text-blue-600 underline cursor-pointer">Try Again</button>
              </div>
            ) : (
              <form onSubmit={confirm} className="flex flex-col gap-3 animate-[fadeIn_0.4s_ease]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Clinical Allocation</span>
                  <button type="button" onClick={reset} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">← Back</button>
                </div>
                {triage && (
                  <div className={`border rounded-xl p-3 flex flex-col gap-1.5 ${triage.color}`}>
                    <span className="text-xs font-bold">Priority: {triage.priority}</span>
                    <p className="text-[10.5px] leading-relaxed">{triage.advice}</p>
                    <div className="border-t border-current/10 pt-1.5 flex justify-between text-[10.5px]">
                      <span>Unit: <strong>{triage.dept}</strong></span>
                      <span>Dr: <strong>{triage.doctor}</strong></span>
                    </div>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[11px]">
                    {errorMsg}
                  </div>
                )}
                {[
                  ['text', 'Your Full Name', 'name'],
                  ['email', 'Email Address', 'email'],
                ].map(([type, ph, key]) => (
                  <input key={key} type={type} placeholder={ph} required value={form[key]} onChange={e => set(key, e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white outline-none focus:border-blue-400 text-slate-700" />
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white outline-none focus:border-blue-400 text-slate-700" />
                  <select required value={form.time} onChange={e => set('time', e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white outline-none focus:border-blue-400 text-slate-700">
                    <option value="">Select Time</option>
                    {(triage?.slots || ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors cursor-pointer">
                  {loading ? 'Confirming...' : 'Confirm Slot'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-3 text-center animate-[fadeIn_0.4s_ease]">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center text-2xl shadow-sm">
              <FaCheckCircle />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Appointment Confirmed!</h4>
              <p className="text-[11px] text-slate-400 px-4">Thank you, <strong>{form.name}</strong>. Your slot with <strong>{triage?.doctor}</strong> is reserved in MongoDB.</p>
            </div>
            <div className="w-full bg-white border border-slate-200/60 rounded-xl p-3 text-left text-[11px] flex flex-col gap-2">
              {[['Department', triage?.dept], ['Doctor', triage?.doctor], ['Date', form.date], ['Time', form.time]].map(([l, v]) => (
                <div key={l} className="flex justify-between"><span className="text-slate-400">{l}:</span><strong className="text-slate-700">{v}</strong></div>
              ))}
            </div>
            <button onClick={reset} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all">Schedule Another</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AISection({ onAppointmentBooked }) {
  return (
    <section id="ai" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">AI Diagnostic Suite</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Intelligent Health Copilots</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">Our AI modules clarify wellness queries and auto-route appointments to the right clinical team using live MongoDB data.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AIAssistant />
          <SmartScheduler onAppointmentBooked={onAppointmentBooked} />
        </div>
      </div>
    </section>
  );
}
