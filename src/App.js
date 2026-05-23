import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./App.css";
import { format, subDays } from "date-fns";
import { he } from "date-fns/locale";

function App() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(todayStr);
  const [entries, setEntries] = useState({});
  const [tab, setTab] = useState("main");
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [strength, setStrength] = useState("");
  const [remember, setRemember] = useState(["", "", ""]);
  const [misc, setMisc] = useState("");
  const [mood, setMood] = useState(5);

  // Load entries
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("journalEntries") || "{}");
    setEntries(saved);
    if (saved[date]) loadEntry(saved[date]);
    else clearEntry();
  }, [date]);

  // Save entries
  const saveEntry = () => {
    const updated = { ...entries, [date]: { gratitude, strength, remember, misc, mood } };
    setEntries(updated);
    localStorage.setItem("journalEntries", JSON.stringify(updated));
  };

  const loadEntry = (entry) => {
    setGratitude(entry.gratitude);
    setStrength(entry.strength);
    setRemember(entry.remember);
    setMisc(entry.misc);
    setMood(entry.mood);
  };

  const clearEntry = () => {
    setGratitude(["", "", ""]);
    setStrength("");
    setRemember(["", "", ""]);
    setMisc("");
    setMood(5);
  };

  // Auto-grow textarea
  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Weekly mood
  const weeklyMood = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(date), 6 - i), "yyyy-MM-dd");
    const entry = entries[d] || {};
    return { date: format(new Date(d), "dd/MM", { locale: he }), mood: entry.mood || null };
  });

  // Daily notification setup
  useEffect(() => {
    if ("Notification" in window && navigator.serviceWorker) {
      Notification.requestPermission();
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.showNotification("יומן אישי 🌿", {
          body: "זמן לכתוב את היומן היומי שלך!",
          tag: "daily-journal",
        });
      });
    }
  }, []);

  return (
    <div className="App">
      <header>
        <h1>יומן אישי 🌿</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-picker"
        />
        <div className="tabs">
          <button className={tab === "main" ? "active" : ""} onClick={() => setTab("main")}>יומן</button>
          <button className={tab === "ai" ? "active" : ""} onClick={() => setTab("ai")}>סיכום מצב רוח</button>
        </div>
      </header>

      {tab === "main" && (
        <section className="journal-entry">
          <h2>3 דברים שאני מודה עליהם</h2>
          {gratitude.map((item, idx) => (
            <textarea
              key={idx}
              value={item}
              placeholder={`תודה מספר ${idx + 1}`}
              onChange={(e) => {
                const newGrat = [...gratitude];
                newGrat[idx] = e.target.value;
                setGratitude(newGrat);
                autoGrow(e);
              }}
            />
          ))}

          <h2>כוח שהפגנתי היום</h2>
          <textarea
            value={strength}
            placeholder="איך זה הופיע?"
            onChange={(e) => {
              setStrength(e.target.value);
              autoGrow(e);
            }}
          />

          <h2>3 דברים עיקריים לזכור</h2>
          {remember.map((item, idx) => (
            <textarea
              key={idx}
              value={item}
              placeholder={`זכור ${idx + 1}`}
              onChange={(e) => {
                const newRem = [...remember];
                newRem[idx] = e.target.value;
                setRemember(newRem);
                autoGrow(e);
              }}
            />
          ))}

          <h2>מחשבות נוספות</h2>
          <textarea
            value={misc}
            placeholder="רשום כאן כל דבר נוסף"
            onChange={(e) => {
              setMisc(e.target.value);
              autoGrow(e);
            }}
          />

          <h2>מצב רוח</h2>
          <input type="range" min="1" max="9" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
          <div>רמת מצב רוח: {mood}</div>

          <button onClick={saveEntry}>שמור</button>
        </section>
      )}

      {tab === "ai" && (
        <section className="chart-section">
          <h2>סיכום מצב רוח שבועי</h2>
          <LineChart width={350} height={200} data={weeklyMood} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" reversed />
            <YAxis domain={[1, 9]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#a3c9a8" strokeWidth={2} />
          </LineChart>

          <h2>AI Review (placeholder)</h2>
          <div className="ai-review">
            <p>היום הפגנת חוסן בכוחך להתמודד עם אתגרים. מצב הרוח שלך בשבוע האחרון היה יציב עם עליות וירידות קלות.</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
