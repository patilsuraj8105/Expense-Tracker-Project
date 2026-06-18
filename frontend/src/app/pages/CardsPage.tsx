import { useState } from "react";
import { Eye, EyeOff, Wifi } from "lucide-react";

const cards = [
  {
    id: 1, bank: "HDFC Bank", type: "Visa Infinite", number: "4532 8821 6743 9012",
    expiry: "08/28", cvv: "***", balance: 245000, limit: 500000,
    color: "linear-gradient(135deg,#1a1f4e,#0d1a4a)", accent: "#00d4b4",
  },
  {
    id: 2, bank: "ICICI Bank", type: "MasterCard World", number: "5412 3378 9021 4567",
    expiry: "03/27", cvv: "***", balance: 87500, limit: 200000,
    color: "linear-gradient(135deg,#3b1f4e,#2a0d3a)", accent: "#c084fc",
  },
  {
    id: 3, bank: "SBI Card", type: "RuPay Elite", number: "6070 4521 8837 1234",
    expiry: "11/26", cvv: "***", balance: 32000, limit: 150000,
    color: "linear-gradient(135deg,#1f3b2e,#0d2a1a)", accent: "#4ade80",
  },
];

const recentSpend = [
  { card: "HDFC", merchant: "Amazon", amount: 3200, date: "Jun 14" },
  { card: "ICICI", merchant: "Swiggy", amount: 450, date: "Jun 13" },
  { card: "HDFC", merchant: "IRCTC", amount: 1245, date: "Jun 5" },
  { card: "SBI", merchant: "Big Bazaar", amount: 2100, date: "May 30" },
];

export function CardsPage() {
  const [showNumbers, setShowNumbers] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  const mask = (num: string) => showNumbers ? num : num.replace(/\d(?=.{4})/g, "•");

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex gap-5">
        {/* Card stack */}
        <div className="flex flex-col gap-4" style={{ width: 340, flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>My Cards</span>
            <button onClick={() => setShowNumbers(!showNumbers)} className="flex items-center gap-1.5" style={{ color: "#8b9ab4", fontSize: 11 }}>
              {showNumbers ? <EyeOff size={13} /> : <Eye size={13} />}
              {showNumbers ? "Hide" : "Show"} Numbers
            </button>
          </div>
          {cards.map((card, i) => (
            <div
              key={card.id}
              onClick={() => setActiveCard(i)}
              className="rounded-2xl p-5 cursor-pointer transition-all"
              style={{
                background: card.color,
                border: `2px solid ${activeCard === i ? card.accent : "rgba(255,255,255,0.08)"}`,
                transform: activeCard === i ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>{card.bank}</div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{card.type}</div>
                </div>
                <Wifi size={18} color={card.accent} />
              </div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 16 }}>
                {mask(card.number)}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9 }}>EXPIRES</div>
                  <div style={{ color: "#fff", fontSize: 12 }}>{card.expiry}</div>
                </div>
                <div style={{ color: card.accent, fontSize: 16, fontWeight: 700 }}>
                  ₹{(card.balance / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected card details */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {cards[activeCard].bank} — Limit Usage
            </div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "#8b9ab4", fontSize: 11 }}>Available Balance</span>
              <span style={{ color: "#00d4b4", fontSize: 14, fontWeight: 700 }}>₹{cards[activeCard].balance.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span style={{ color: "#8b9ab4", fontSize: 11 }}>Total Limit</span>
              <span style={{ color: "#e8eaf0", fontSize: 13 }}>₹{cards[activeCard].limit.toLocaleString("en-IN")}</span>
            </div>
            <div className="rounded-full" style={{ height: 8, background: "rgba(255,255,255,0.07)" }}>
              <div className="rounded-full" style={{
                height: 8,
                width: `${Math.round((cards[activeCard].balance / cards[activeCard].limit) * 100)}%`,
                background: `linear-gradient(90deg,${cards[activeCard].accent},#0891b2)`,
              }} />
            </div>
            <div style={{ color: "#8b9ab4", fontSize: 10, marginTop: 6 }}>
              {Math.round((cards[activeCard].balance / cards[activeCard].limit) * 100)}% available
            </div>
          </div>

          {/* Recent spend on all cards */}
          <div className="rounded-2xl p-5 flex-1" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Recent Transactions</div>
            <div className="flex flex-col gap-3">
              {recentSpend.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div style={{ color: "#e8eaf0", fontSize: 12, fontWeight: 500 }}>{t.merchant}</div>
                    <div style={{ color: "#8b9ab4", fontSize: 10 }}>{t.card} Card · {t.date}</div>
                  </div>
                  <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>-₹{t.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
