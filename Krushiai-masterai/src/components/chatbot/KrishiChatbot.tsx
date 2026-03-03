"use client";

import { useState, useRef, useEffect } from "react";
import { RETAILERS } from "@/app/retailer/data";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "english" | "hindi" | "marathi";

// ─── Farm Logo ────────────────────────────────────────────────────────────────
function FarmLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="7" r="3" fill="#FCD34D" />
      <line x1="16" y1="1" x2="16" y2="3" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="11" x2="16" y2="13" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="7" x2="8" y2="7" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="7" x2="24" y2="7" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="25" width="28" height="5" rx="2" fill="#65A30D" />
      <line x1="8" y1="25" x2="8" y2="17" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 20 C6 18 4 19 4 21" stroke="#16A34A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8 18 C10 16 12 17 12 19" stroke="#16A34A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="16" y1="25" x2="16" y2="15" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19 C13 17 11 18 11 21" stroke="#15803D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M16 17 C19 15 21 16 21 19" stroke="#15803D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="24" y1="25" x2="24" y2="17" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 20 C22 18 20 19 20 21" stroke="#16A34A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M24 18 C26 16 28 17 28 19" stroke="#16A34A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Message type ─────────────────────────────────────────────────────────────
interface Message { id: number; role: "bot" | "user"; text: string; }

// ─── Language helpers ─────────────────────────────────────────────────────────
const lbl = (l: Lang, en: string, hi: string, mr: string) =>
  l === "hindi" ? hi : l === "marathi" ? mr : en;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Field label helpers
const Lp = (l: Lang) => lbl(l, "Price", "कीमत", "किंमत");
const Ls = (l: Lang) => lbl(l, "Stock", "स्टॉक", "साठा");
const Lr = (l: Lang) => lbl(l, "Rating", "रेटिंग", "रेटिंग");
const Ll = (l: Lang) => lbl(l, "Location", "स्थान", "स्थान");
const Lc = (l: Lang) => lbl(l, "Contact", "संपर्क", "संपर्क");
const Lv = (l: Lang, b: boolean) => b
  ? lbl(l, "✅ Verified Seller", "✅ सत्यापित विक्रेता", "✅ प्रमाणित विक्रेता")
  : lbl(l, "📋 Listed Seller", "📋 सूचीबद्ध विक्रेता", "📋 नोंदणीकृत विक्रेता");
const Lfoot = (l: Lang) => lbl(l, "_Based on current marketplace data._", "_वर्तमान बाजार डेटा के आधार पर।_", "_सध्याच्या बाजार डेटानुसार।_");
const Lmktavg = (l: Lang) => lbl(l, "Market Average", "बाजार औसत", "बाजार सरासरी");
const Lrev = (l: Lang) => lbl(l, "reviews", "समीक्षाएं", "पुनरावलोकने");
const Lcrops = (l: Lang) => lbl(l, "crops", "फसलें", "पिके");

// ─── Multilingual keyword maps ────────────────────────────────────────────────
const CROP_MAP: Record<string, string> = {
  "गेहूं": "wheat", "गेहूँ": "wheat", "गेहु": "wheat", "प्याज": "onions", "आलू": "potatoes",
  "टमाटर": "tomatoes", "टमाटा": "tomatoes", "गाजर": "carrots", "बैंगन": "eggplant",
  "पालक": "spinach", "धनिया": "coriander", "पुदीना": "mint", "केला": "bananas", "कद्दू": "pumpkins",
  "फूलगोभी": "cauliflower", "शिमला मिर्च": "bell peppers", "चुकंदर": "beetroot",
  "गहू": "wheat", "कांदा": "onions", "कांदे": "onions", "बटाटा": "potatoes", "बटाटे": "potatoes",
  "टोमॅटो": "tomatoes", "टमाटे": "tomatoes", "कोथिंबीर": "coriander", "वांगे": "eggplant",
  "वांगी": "eggplant", "फुलकोबी": "cauliflower", "भोपळा": "pumpkins", "केळी": "bananas",
  "केळे": "bananas", "ढोबळी मिरची": "bell peppers", "ढोबळी": "bell peppers", "पुदिना": "mint",
  "बीट": "beetroot",
};

const INTENT_MAP: [string, string][] = [
  ["नमस्ते", "hello"], ["नमस्कार", "hello"], ["हैलो", "hello"], ["हॅलो", "hello"], ["राम राम", "hello"],
  ["मदद", "help"], ["सहायता", "help"], ["मदत", "help"], ["सहाय्य", "help"],
  ["क्या कर सकते", "what can you"], ["काय करता", "what can you"],
  ["सर्वोत्तम दुकान", "best overall retailer"], ["सबसे अच्छी दुकान", "best overall retailer"],
  ["सर्वात चांगला विक्रेता", "best overall retailer"], ["नंबर एक", "best overall retailer"],
  ["सबसे अच्छा", "best"], ["सर्वश्रेष्ठ", "best"], ["सर्वोत्तम", "best"], ["सर्वात चांगला", "best"],
  ["कहाँ से खरीदें", "where to buy"], ["कुठून खरेदी", "where to buy"],
  ["सुझाव दो", "suggest"], ["सुझाव द्या", "suggest"], ["सिफारिश", "recommend"], ["शिफारस", "recommend"],
  ["कीमत", "price"], ["दाम", "price"], ["भाव", "price"], ["मूल्य", "price"], ["किंमत", "price"], ["दर", "rate"], ["रेट", "rate"],
  ["सबसे सस्ता", "cheapest"], ["सबसे कम कीमत", "cheapest"], ["सस्ता", "cheapest"],
  ["सर्वात स्वस्त", "cheapest"], ["स्वस्त", "cheapest"], ["कमी किंमत", "cheapest"], ["कमी भाव", "cheapest"],
  ["सभी कीमतें", "all prices"], ["सारे भाव", "all prices"], ["सर्व भाव", "all prices"],
  ["औसत कीमत", "average price"], ["सरासरी भाव", "average price"],
  ["नजदीक", "near "], ["पास में", "near "], ["जवळ", "near "], ["जवळचे", "near "],
  ["कहाँ है", "near "], ["किधर", "near "], ["आसपास", "around "],
  ["तुलना", "compare"], ["तुलना करा", "compare"], ["बनाम", "vs"], ["विरुद्ध", "vs"],
  ["संपर्क", "contact"], ["फोन नंबर", "phone number"], ["फोन", "phone"], ["नंबर दो", "phone"], ["नंबर द्या", "phone"],
  ["किसके पास है", "who has"], ["कोणाकडे आहे", "who has"],
  ["स्टॉक", "stock"], ["साठा", "stock"], ["उपलब्ध", "available"],
  ["कौन बेचता है", "who sells"], ["कोण विकतो", "who sells"],
  ["खरीदना", "buy"], ["खरीदें", "buy"], ["खरेदी", "buy"], ["विकत घ्यायचे", "buy"], ["घ्यायचे", "buy"],
  ["कितना खर्च", "cost"], ["किती खर्च", "cost"],
  ["बजट", "budget"], ["बजेट", "budget"], ["कितना मिलेगा", "what can i buy"],
  ["किती मिळेल", "what can i buy"], ["काय मिळेल", "what can i buy"],
  ["बचत", "save"], ["बचत कितनी", "how much can i save"], ["किती वाचेल", "how much can i save"], ["फरक", "difference"],
  ["सभी दुकानें", "all retailers"], ["सर्व दुकाने", "all retailers"], ["दिखाओ सभी", "show all"], ["सगळे दाखवा", "show all"],
  ["सभी फसलें", "all crops"], ["सर्व पिके", "all crops"], ["सभी सब्जियां", "all crops"],
  ["क्या बेचता है", "what does"], ["काय विकतो", "what does"],
  ["बाजार सारांश", "market overview"], ["बाजाराची माहिती", "market overview"], ["जानकारी दो", "market overview"],
  ["माहिती द्या", "market overview"], ["सारांश", "summary"],
  ["सत्यापित", "verified"], ["प्रमाणित", "verified"], ["खात्रीलायक", "verified"],
  ["सबसे ज्यादा रेटिंग", "top rated"], ["सर्वाधिक रेटिंग", "top rated"],
  ["पंजीकरण", "register"], ["नोंदणी", "register"], ["दुकान जोड़ें", "add my shop"], ["दुकान जोडा", "add my shop"],
  ["सुझाव", "tips"], ["सलाह", "tips"], ["सल्ला", "tips"],
  ["रबी", "rabi"], ["kharif", "kharif"],
  ["जळगाव", "jalgaon"], ["भुसावळ", "bhusawal"], ["चोपडा", "chopda"], ["पाचोरा", "pachora"],
  ["अमळनेर", "amalner"], ["यावल", "yawal"], ["रावेर", "raver"], ["एरंडोल", "erandol"], ["जामनेर", "jamner"],

  // ── Retailer name transliterations (Hindi/Marathi → English) ──
  ["आनंद वेजिटेबल अँड कंपनी", "Anand Vegetable And Company"],
  ["आनंद भाजीपाला", "Anand Vegetable And Company"],
  ["अथावडे बाजार", "Athawade Bazaar"],
  ["एकदंत व्हेजिटेबल्स", "Ekdunt Vegetables"],
  ["एकदंत", "Ekdunt"],
  ["हिरमन बंसी माली अँड सन्स", "Hirman Bansi Mali And Sons"],
  ["हिरमन बंसी", "Hirman Bansi"],
  ["के.पी. ट्रेडर्स", "K.P. Traders"],
  ["के पी ट्रेडर्स", "K.P. Traders"],
  ["केपी ट्रेडर्स", "K.P. Traders"],
  ["मो. युनूस एस. बिस्मिल्ला अँड को.", "Mo. Younis S. Bismilla And Co."],
  ["मो. युनूस", "Mo. Younis"],
  ["बिस्मिल्ला", "Bismilla"],
  ["युनूस", "Younis"],
  ["नंदिनी ट्रेडिंग कं.", "Nandini Trading Co."],
  ["नंदिनी", "Nandini"],
  ["पी. शाखीमल अँड सन्स", "P. Shakhimal And Sons"],
  ["शाखीमल", "Shakhimal"],
  ["रत्ना ट्रेडिंग कंपनी", "RATNA TRADING COMPANY"],
  ["रत्ना", "RATNA"],
  ["सुरेश दादा जैन", "Suresh Dada Jain"],
  ["सुरेश दादा", "Suresh Dada"],

  ["५०००", "5000"], ["१०००", "1000"], ["२०००", "2000"], ["१००", "100"], ["२००", "200"], ["५००", "500"],
  ["३०००", "3000"], ["४०००", "4000"], ["७०००", "7000"], ["१०,०००", "10000"], ["१५,०००", "15000"],

  // ── Colloquial price queries ──
  ["का भाव", "price"], ["का दाम", "price"], ["की कीमत", "price"], ["कितने का", "price"],
  ["कितने में", "price"], ["कितने रुपये", "price"], ["क्या रेट है", "rate"],
  ["चा भाव", "price"], ["ची किंमत", "price"], ["किती रुपये", "price"],
  ["किती आहे", "price"], ["काय भाव आहे", "price"], ["आजचा भाव", "price"],
  ["आज का भाव", "price"], ["आज का रेट", "rate"], ["ताजा भाव", "price"],

  // ── Where to get / availability ──
  ["कहाँ मिलेगा", "where to buy"], ["कहाँ से लूं", "where to buy"],
  ["कहाँ से खरीदूं", "where to buy"], ["कहाँ मिलता है", "who has"],
  ["कुठे मिळेल", "where to buy"], ["कुठे मिळतो", "who has"],
  ["कुठे खरेदी", "where to buy"], ["कोणाकडे मिळेल", "who has"],

  // ── Cheapest / best deal ──
  ["सबसे कम", "cheapest"], ["सबसे सस्ते में", "cheapest"],
  ["कम से कम कीमत", "cheapest"], ["बेस्ट डील", "cheapest"],
  ["सर्वात कमी", "cheapest"], ["कमीत कमी", "cheapest"],
  ["बेस्ट डिल", "cheapest"], ["स्वस्तात स्वस्त", "cheapest"],

  // ── I need / want to buy ──
  ["मुझे चाहिए", "best"], ["मुझे लेना है", "best"], ["मैं खरीदना चाहता", "best"],
  ["मला हवे", "best"], ["मला घ्यायचे", "buy"], ["मला खरेदी करायची", "buy"],
  ["मला विकत घ्यायचे", "buy"], ["मुझे खरीदना है", "buy"],

  // ── Quality / trust ──
  ["अच्छी गुणवत्ता", "verified"], ["अच्छा माल", "top rated"],
  ["भरोसेमंद", "verified"], ["विश्वस्त", "verified"],
  ["चांगल्या दर्जाचे", "verified"], ["दर्जेदार", "top rated"],
  ["खात्रीशीर", "verified"], ["विश्वासू", "verified"],

  // ── How much stock ──
  ["कितना माल", "stock"], ["कितना स्टॉक", "stock"],
  ["किती माल", "stock"], ["किती साठा आहे", "stock"],
  ["उपलब्धता", "available"], ["उपलब्धता", "available"],

  // ── Which is better ──
  ["कौन बेहतर", "compare"], ["कौन ज्यादा अच्छा", "compare"],
  ["कोण चांगले", "compare"], ["कोण बरे", "compare"],
  ["कोणता चांगला", "compare"], ["कोणता बेस्ट", "best"],

  // ── Near / location ──
  ["मेरे पास", "near "], ["मेरे नजदीक", "near "], ["यहाँ पास में", "near "],
  ["माझ्या जवळ", "near "], ["माझ्या परिसरात", "near "],
  ["इथे जवळ", "near "], ["आसपास कुठे", "near "],

  // ── Agriculture-specific ──
  ["मंडी", "market"], ["मंडी भाव", "price"], ["बाजार भाव", "price"],
  ["थोक भाव", "all prices"], ["थोक में", "buy"], ["घाऊक भाव", "all prices"],
  ["घाऊक खरेदी", "buy"], ["जास्तीत जास्त", "highest"],
  ["किलो दर", "price"], ["किग्रा दर", "price"],
  ["क्विंटल", "quintal"], ["क्विंटल का भाव", "price"],

  // ── Contact variations ──
  ["नंबर क्या है", "phone"], ["नंबर काय आहे", "phone"],
  ["फोन करना है", "contact"], ["फोन करायचे", "contact"],
  ["कैसे संपर्क करें", "contact"], ["कसे संपर्क करावे", "contact"],

  // ── Market information ──
  ["बाजार की जानकारी", "market overview"], ["बाजार का हाल", "market overview"],
  ["बाजारपेठेची माहिती", "market overview"], ["बाजाराची स्थिती", "market overview"],
  ["मार्केट अपडेट", "market overview"], ["आजचा बाजार", "market overview"],

  // ── Common greetings and fillers ──
  ["भाई", "hello"], ["यार", "hello"], ["दोस्त", "hello"], ["साहब", "hello"],
  ["दादा", "hello"], ["भाऊ", "hello"], ["ताई", "hello"], ["काका", "hello"],
  ["कृपया बताएं", "help"], ["कृपया सांगा", "help"],
  ["जरा बताओ", "help"], ["जरा सांगा", "help"], ["बताइए", "help"],

  // ── Savings-specific ──
  ["पैसे बचाएं", "save"], ["पैसे बचाओ", "save"], ["पैसे वाचवा", "save"],
  ["कम खर्च", "cheapest"], ["कमी खर्च", "cheapest"],
  ["फायदेमंद", "save"], ["फायदा", "save"],

  // ── 7-Day trend / price history ──
  ["ट्रेंड", "trend"], ["7 दिन का ट्रेंड", "7 day trend"], ["साप्ताहिक", "weekly"],
  ["इस हफ़्ते", "this week"], ["कीमत का इतिहास", "price history"],
  ["कीमत ऊपर जा रही है", "going up"], ["कीमत नीचे जा रही है", "going down"],
  ["कब बेचूं", "when to sell"], ["बेचूं या नहीं", "should i sell"],
  ["दाम बढ़ रहे हैं", "going up"], ["दाम गिर रहे हैं", "going down"],
  ["7 दिवसांचा ट्रेंड", "7 day trend"], ["आठवड्याचा ट्रेंड", "weekly trend"],
  ["किंमत वाढत", "going up"], ["किंमत घसरत", "going down"],
  ["केव्हा विकू", "when to sell"], ["विकू का नको", "should i sell"],
  ["या आठवड्यात", "this week"], ["किंमतीचा इतिहास", "price history"],
  ["भाव ट्रेंड", "price trend"], ["ट्रेण्ड", "trend"],

  // ── Comparison triggers ──
  ["दोनों", "compare"], ["दोन", "compare"], ["दोनों में", "compare"],
  ["दोन्हींमध्ये", "compare"], ["किसमें बेहतर", "compare"],
  ["कोणत्यात चांगले", "compare"],

  // ── Farmer / kisaan / shetkari terms → retailer actions ──
  ["किसान", "retailer"], ["किसान की दुकान", "retailer"],
  ["किसान का नंबर", "phone"], ["किसान से खरीदें", "buy"],
  ["किसान की कीमत", "price"], ["किसान का माल", "stock"],
  ["किसान कहाँ", "near "], ["किसान की रेटिंग", "top rated"],
  ["किसान तुलना", "compare farmers"], ["दो किसान", "compare farmers"],
  ["किसानों की तुलना", "compare farmers"], ["कौन सा किसान", "compare farmers"],
  ["किसान vs", "compare farmers"], ["किसान बनाम", "compare farmers"],
  ["शेतकरी", "retailer"], ["शेतकऱ्याचा नंबर", "phone"],
  ["शेतकऱ्याकडून", "buy"], ["शेतकरी किंमत", "price"],
  ["शेतकरी तुलना", "compare farmers"], ["दोन शेतकरी", "compare farmers"],
  ["शेतकऱ्यांची तुलना", "compare farmers"], ["कोणता शेतकरी", "compare farmers"],
  ["शेतकरी vs", "compare farmers"], ["शेतकरी विरुद्ध", "compare farmers"],
  ["सर्वोत्तम शेतकरी", "best overall retailer"], ["सबसे अच्छा किसान", "best overall retailer"],
  ["सबसे भरोसेमंद किसान", "verified"], ["विश्वसनीय किसान", "verified"],
  ["farmer compare", "compare farmers"], ["compare farmers", "compare farmers"],
  ["best farmer", "best overall retailer"], ["which farmer", "compare farmers"],
  ["farmer vs", "compare farmers"], ["farmers comparison", "compare farmers"],
];



function detectLanguage(text: string): Lang {
  if (!/[\u0900-\u097F]/.test(text)) return "english";
  const mr = [
    "काय", "आहे", "सांगा", "कुठे", "आणि", "मला", "हवे", "नको", "आजचा", "यांची", "करा",
    "गहू", "कांदा", "बटाटा", "कोथिंबीर", "वांगे", "टोमॅटो", "भोपळा", "केळी", "ढोबळी", "फुलकोबी",
    "जळगाव", "भुसावळ", "चोपडा", "पाचोरा", "एरंडोल", "जामनेर",
    "किंमत", "भाव", "स्वस्त", "विक्रेता", "विक्रेते", "खरेदी", "मिळेल", "साठा",
    "सांगा", "दाखवा", "तुलना", "विचारा", "सांगण्यास", "कृपया", "धन्यवाद",
  ];
  return mr.some(w => text.includes(w)) ? "marathi" : "hindi";
}

function normalizeForIntent(text: string): string {
  let s = text;
  const sortedCrops = Object.keys(CROP_MAP).sort((a, b) => b.length - a.length);
  for (const k of sortedCrops) s = s.replace(new RegExp(k, "g"), CROP_MAP[k]);
  const sortedIntents = [...INTENT_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sortedIntents) s = s.replace(new RegExp(k, "gi"), v);
  return s.toLowerCase().trim();
}

// ─── Data helpers ─────────────────────────────────────────────────────────────
const ALL_CROPS_LIST = ["wheat", "onions", "potatoes", "tomatoes", "carrots", "beetroot", "cauliflower", "eggplant", "spinach", "coriander", "mint", "bananas", "pumpkins", "bell peppers", "exotic veggies"];

function detectCrop(t: string) { return ALL_CROPS_LIST.find(c => t.includes(c)) || "wheat"; }
function detectQty(t: string): number | null {
  const m = t.match(/(\d+)\s*(kg|quintal|q\b)/i);
  if (!m) return null;
  const v = parseInt(m[1]);
  return m[2].toLowerCase().startsWith("q") ? v * 100 : v;
}
function detectBudget(t: string): number | null {
  const m = t.match(/(?:rs\.?|₹|rupees?)\s*(\d[\d,]*)/i) || t.match(/(\d[\d,]*)\s*(?:rs\.?|₹)/i) || t.match(/budget\s+(?:of\s+)?(\d[\d,]*)/i);
  return m ? parseInt(m[1].replace(/,/g, "")) : null;
}
function getWithCrop(crop: string) { const cl = crop.toLowerCase(); return RETAILERS.filter(r => r.stock.some(s => s.name.toLowerCase().includes(cl))); }
function getLow(crop: string) { const cl = crop.toLowerCase(); const m = getWithCrop(crop).map(r => ({ r, s: r.stock.find(s => s.name.toLowerCase().includes(cl))! })); return m.length ? m.reduce((a, b) => a.s.pricePerKg <= b.s.pricePerKg ? a : b) : null; }
function getHigh(crop: string) { const cl = crop.toLowerCase(); const m = getWithCrop(crop).map(r => ({ r, s: r.stock.find(s => s.name.toLowerCase().includes(cl))! })); return m.length ? m.reduce((a, b) => a.s.pricePerKg >= b.s.pricePerKg ? a : b) : null; }
function getAvg(crop: string): number | null { const ps = RETAILERS.flatMap(r => r.stock.filter(s => s.name.toLowerCase().includes(crop.toLowerCase())).map(s => s.pricePerKg)); return ps.length ? Math.round(ps.reduce((a, b) => a + b, 0) / ps.length) : null; }
function getAllCrops(): string[] { return [...new Set(RETAILERS.flatMap(r => r.stock.map(s => s.name)))].sort(); }
function getBest(crop: string) {
  const cl = crop.toLowerCase(), m = getWithCrop(crop);
  if (!m.length) return null;
  return m.reduce((best, r) => {
    const bs = r.stock.find(s => s.name.toLowerCase().includes(cl))!;
    const ps = best.stock.find(s => s.name.toLowerCase().includes(cl))!;
    return (r.rating * 12 - bs.pricePerKg * 0.5 + (r.verified ? 5 : 0)) > (best.rating * 12 - ps.pricePerKg * 0.5 + (best.verified ? 5 : 0)) ? r : best;
  });
}
function getOverallBest() {
  return [...RETAILERS].map(r => ({ r, score: r.rating * 15 + (r.verified ? 8 : 0) + r.reviewsCount / 100 + r.stock.length * 2 })).sort((a, b) => b.score - a.score);
}
function filterByLoc(q: string) { return RETAILERS.filter(r => r.location.toLowerCase().includes(q.toLowerCase())); }
function getRetailer(raw: string) {
  // Try direct match first
  const nl = raw.toLowerCase();
  const direct = RETAILERS.find(r =>
    r.name.toLowerCase().includes(nl) ||
    r.name.toLowerCase().split(" ").some(w => w.length > 3 && nl.includes(w.toLowerCase()))
  );
  if (direct) return direct;
  // Try normalizing Devanagari → English first, then match
  const norm = normalizeForIntent(raw).toLowerCase();
  return RETAILERS.find(r =>
    r.name.toLowerCase().includes(norm) ||
    norm.includes(r.name.toLowerCase()) ||
    r.name.toLowerCase().split(" ").some(w => w.length > 3 && norm.includes(w.toLowerCase()))
  );
}

function getBudgetOpts(budget: number) {
  return getAllCrops().map(c => { const low = getLow(c); return low ? { c, r: low.r, p: low.s.pricePerKg, kg: Math.floor(budget / low.s.pricePerKg) } : null }).filter(Boolean).sort((a, b) => b!.kg - a!.kg) as { c: string, r: typeof RETAILERS[0], p: number, kg: number }[];
}

// ── 7-Day Price Trend Generator ───────────────────────────────────────────────
// Uses seeded pseudo-random from crop name for consistent but realistic trends
function get7DayTrend(crop: string): {
  days: { day: string; price: number }[];
  current: number; start: number;
  change: number; pct: number;
  trend: "rising" | "falling" | "stable";
} {
  const avg = getAvg(crop) || 30;
  // Simple seed from crop name
  const seed = crop.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const pseudo = (n: number) => ((seed * 9301 + n * 49297 + 233) % 2399) / 2399;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  const prices = days.map((d, i) => {
    const variation = (pseudo(i * 7) - 0.5) * avg * 0.18; // ±9% variation
    const trend = (pseudo(i * 3 + 1) - 0.45) * avg * 0.03 * i; // slight drift
    return { day: d, price: Math.round(Math.max(avg * 0.75, avg + variation + trend)) };
  });

  const start = prices[0].price;
  const current = prices[6].price;
  const change = current - start;
  const pct = Math.round((change / start) * 100);
  const trend = Math.abs(pct) < 3 ? "stable" : pct > 0 ? "rising" : "falling";

  return { days: prices, current, start, change, pct, trend };
}


// ─── Intent core (trilingual) ─────────────────────────────────────────────────
function processIntent(raw: string): string {
  const l = detectLanguage(raw);
  const t = normalizeForIntent(raw);
  const crop = detectCrop(t);
  const qty = detectQty(t);
  const budget = detectBudget(t);

  // 1. HELP
  if (t.includes("help") || t.includes("what can you") || t.includes("capabilities") || t.includes("features")) {
    return lbl(l,
      `🌾 **Krishi Market Assistant — Capabilities:**\n\n**🔍 Prices** — "Best wheat price", "Cheapest tomatoes"\n**🏆 Rankings** — "Best overall retailer", "Highest rated"\n**👨‍🌾 Compare Farmers** — "Compare all farmers", "किसानों की तुलना", "शेतकरी तुलना"\n**⚖️ Compare 2** — "Compare Anand and Ekdunt"\n**📍 Location** — "Retailers near Bhusawal"\n**🧮 Calculator** — "200 kg wheat cost", "What for ₹5000?"\n**📦 Stock** — "Who has wheat?", "What does Ekdunt sell?"\n**📞 Contact** — "Contact of Suresh Dada"\n**💰 Savings** — "How much save on wheat?", "Market overview"\n\n_Ask in English, हिंदी or मराठी! 🌾_`,
      `🌾 **कृषि बाजार सहायक — क्षमताएं:**\n\n**🔍 कीमत** — "गेहूं का सबसे अच्छा दाम", "सबसे सस्ता टमाटर"\n**🏆 रैंकिंग** — "सर्वश्रेष्ठ किसान", "सबसे ज्यादा रेटिंग"\n**👨‍🌾 किसान तुलना** — "सभी किसानों की तुलना करो", "दो किसान", "कौन सा किसान बेस्ट"\n**⚖️ दो की तुलना** — "आनंद और एकदंत की तुलना"\n**📍 स्थान** — "भुसावल के पास दुकान"\n**🧮 कैलकुलेटर** — "200 किग्रा गेहूं का खर्च", "₹5000 में क्या मिलेगा?"\n**📦 स्टॉक** — "किसके पास गेहूं है?"\n**📞 संपर्क** — "सुरेश दादा का नंबर"\n**💰 बचत** — "गेहूं पर बचत", "बाजार सारांश"\n\n_हिंदी में पूछें! 🌾_`,
      `🌾 **कृषी बाजार सहाय्यक — क्षमता:**\n\n**🔍 किंमत** — "गहूचा सर्वात चांगला भाव", "सर्वात स्वस्त टोमॅटो"\n**🏆 क्रमवारी** — "सर्वोत्तम शेतकरी", "सर्वाधिक रेटिंग"\n**👨‍🌾 शेतकरी तुलना** — "सर्व शेतकऱ्यांची तुलना", "दोन शेतकरी", "कोणता शेतकरी सर्वोत्तम"\n**⚖️ दोघांची तुलना** — "आनंद आणि एकदंत यांची तुलना"\n**📍 स्थान** — "भुसावळ जवळ दुकान"\n**🧮 कॅल्क्युलेटर** — "200 किलो गहू किती?", "₹5000 मध्ये काय मिळेल?"\n**📦 साठा** — "कोणाकडे गहू आहे?"\n**📞 संपर्क** — "सुरेश दादाचा नंबर"\n**💰 बचत** — "गहूवर बचत", "बाजाराची माहिती"\n\n_मराठीत विचारा! 🌾_`
    );
  }

  // 2. GREETING
  if (t.length < 25 && (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("namaste") || t === "hii" || t === "helo")) {
    return lbl(l,
      `🙏 **Namaste! Welcome to Krishi Market Assistant!**\n\n🏆 Find the **best retailer**\n💸 Compare **crop prices**\n📍 Locate **shops near you**\n🧮 **Calculate costs**\n💰 Find **best deals**\n📞 Get **contact details**\n\nTry: _"Best overall retailer"_ or _"₹5000 budget"_`,
      `🙏 **नमस्ते! कृषि बाजार सहायक में आपका स्वागत है!**\n\n🏆 **सर्वश्रेष्ठ विक्रेता** खोजें\n💸 **फसल के दाम** देखें\n📍 **पास की दुकान** खोजें\n🧮 **लागत** जानें\n💰 **सस्ते सौदे** ढूंढें\n📞 **संपर्क** पाएं\n\nकोशिश करें: _"सर्वश्रेष्ठ विक्रेता"_ या _"₹5000 में क्या मिलेगा?"_`,
      `🙏 **नमस्कार! कृषी बाजार सहाय्यकमध्ये स्वागत आहे!**\n\n🏆 **सर्वोत्तम विक्रेता** शोधा\n💸 **पिकांचे भाव** पाहा\n📍 **जवळची दुकाने** शोधा\n🧮 **किंमत** जाणा\n💰 **स्वस्त सौदे** शोधा\n📞 **संपर्क** मिळवा\n\nप्रयत्न करा: _"सर्वोत्तम विक्रेता"_ किंवा _"₹5000 मध्ये काय मिळेल?"_`
    );
  }

  // 3. OVERALL BEST
  if ((t.includes("best") && t.includes("overall")) || t.includes("overall best") || t.includes("top retailer") || t.includes("number one") || (t.includes("best") && t.includes("retailer") && !ALL_CROPS_LIST.some(c => t.includes(c)) && !t.includes("price"))) {
    const ranked = getOverallBest();
    const top3 = ranked.slice(0, 3);
    const medals = ["🥇", "🥈", "🥉"];
    const title = lbl(l, "🥇 **Overall Best Retailers (Composite Score):**", "🥇 **सर्वश्रेष्ठ विक्रेता (समग्र स्कोर):**", "🥇 **सर्वोत्तम विक्रेते (एकत्रित स्कोर):**");
    const scoreNote = lbl(l, "_Score = Rating×15 + Verified + Reviews + Stock_", "_स्कोर = रेटिंग×15 + सत्यापन + समीक्षाएं + फसल_", "_स्कोर = रेटिंग×15 + प्रमाणन + पुनरावलोकने + पिके_");
    const note = lbl(l, "_Based on rating, trust & stock variety._", "_रेटिंग, विश्वास और फसल विविधता के आधार पर।_", "_रेटिंग, विश्वास आणि पिके विविधतेनुसार।_");
    return `${title}\n\n${scoreNote}\n\n` +
      top3.map((x, i) => `${medals[i]} **${x.r.name}** — ${lbl(l, "Score", "स्कोर", "स्कोर")}: ${x.score.toFixed(1)}\n   ⭐ ${x.r.rating} | ${x.r.reviewsCount} ${Lrev(l)} | ${x.r.stock.length} ${Lcrops(l)} | ${Lv(l, x.r.verified)}\n   📍 ${x.r.location}\n   📞 ${x.r.contact}`).join("\n\n") +
      `\n\n${note}`;
  }

  // 4. TOP RATED
  if (t.includes("top rated") || t.includes("highest rating") || t.includes("highest rated") || t.includes("most trusted") || t.includes("best rated")) {
    const top = [...RETAILERS].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const title = lbl(l, "🏆 **Top 5 Retailers by Rating:**", "🏆 **रेटिंग के अनुसार शीर्ष 5 विक्रेता:**", "🏆 **रेटिंगनुसार शीर्ष 5 विक्रेते:**");
    return `${title}\n\n` + top.map((r, i) => `${i + 1}. **${r.name}** — ⭐ ${r.rating}\n   📍 ${r.location} | ${r.reviewsCount} ${Lrev(l)} | ${Lv(l, r.verified)}`).join("\n\n") + `\n\n${Lfoot(l)}`;
  }

  // 5. MOST REVIEWED
  if (t.includes("most reviewed") || t.includes("most popular") || t.includes("most reviews")) {
    const top = [...RETAILERS].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 3);
    const title = lbl(l, "📊 **Most Reviewed Retailers:**", "📊 **सबसे ज्यादा समीक्षा वाले विक्रेता:**", "📊 **सर्वाधिक पुनरावलोकने असलेले विक्रेते:**");
    return `${title}\n\n` + top.map((r, i) => `${i + 1}. **${r.name}** — ${r.reviewsCount} ${Lrev(l)}\n   ⭐ ${r.rating} | 📍 ${r.location}`).join("\n\n") + `\n\n${Lfoot(l)}`;
  }

  // 6. VERIFIED ONLY
  if (t.includes("verified") && !t.includes("seller")) {
    const v = RETAILERS.filter(r => r.verified);
    const title = lbl(l, `✅ **Verified Retailers (${v.length}):**`, `✅ **सत्यापित विक्रेता (${v.length}):**`, `✅ **प्रमाणित विक्रेते (${v.length}):**`);
    const note = lbl(l, "_All have passed our verification process._", "_सभी ने हमारी सत्यापन प्रक्रिया पास की है।_", "_सर्वांनी आमची प्रमाणन प्रक्रिया पार केली आहे।_");
    return `${title}\n\n` + v.map((r, i) => `${i + 1}. **${r.name}**\n   ⭐ ${r.rating} | 📍 ${r.location}\n   📞 ${r.contact}`).join("\n\n") + `\n\n${note}`;
  }

  // 7. CHEAPEST
  if (t.includes("cheapest") || t.includes("lowest price") || t.includes("best price") || t.includes("minimum price") || t.includes("cheap")) {
    const low = getLow(crop);
    if (!low) return lbl(l, `❌ No data for ${crop}.`, `❌ ${crop} की जानकारी नहीं मिली।`, `❌ ${crop} बद्दल माहिती मिळाली नाही।`);
    const avg = getAvg(crop);
    const savings = avg ? avg - low.s.pricePerKg : 0;
    const title = lbl(l, `💸 **Lowest ${cap(crop)} Price:**`, `💸 **सबसे सस्ता ${cap(crop)}:**`, `💸 **सर्वात स्वस्त ${cap(crop)}:**`);
    const youSave = lbl(l, "💰 You save vs avg", "💰 औसत से बचत", "💰 सरासरीपेक्षा बचत");
    return `${title}\n\n**${low.r.name}**\n• ${Lp(l)}: ₹${low.s.pricePerKg}/kg\n• ${Lmktavg(l)}: ₹${avg}/kg\n• ${youSave}: ₹${savings}/kg\n• ${Ls(l)}: ${low.s.quantity}\n• ${Lr(l)}: ⭐ ${low.r.rating}\n• ${Ll(l)}: ${low.r.location}\n• ${Lc(l)}: ${low.r.contact}\n\n${Lfoot(l)}`;
  }

  // 8. ALL PRICES
  if (t.includes("all price") || t.includes("price list") || t.includes("prices of") || (t.includes("price") && t.includes("all"))) {
    const sellers = getWithCrop(crop);
    if (!sellers.length) return lbl(l, `❌ No retailers for ${crop}.`, `❌ ${crop} के लिए कोई विक्रेता नहीं।`, `❌ ${crop} साठी विक्रेते सापडले नाहीत।`);
    const avg = getAvg(crop);
    const sorted = sellers.map(r => ({ r, s: r.stock.find(s => s.name.toLowerCase().includes(crop))! })).sort((a, b) => a.s.pricePerKg - b.s.pricePerKg);
    const title = lbl(l, `📊 **${cap(crop)} Prices Across All Retailers:**`, `📊 **सभी विक्रेताओं में ${cap(crop)} के दाम:**`, `📊 **सर्व विक्रेत्यांकडे ${cap(crop)} भाव:**`);
    const avgLabel = lbl(l, "📈 Market Average", "📈 बाजार औसत", "📈 बाजार सरासरी");
    return `${title}\n\n` + sorted.map((x, i) => `${i + 1}. **${x.r.name}** — ₹${x.s.pricePerKg}/kg | ⭐ ${x.r.rating}`).join("\n") + `\n\n${avgLabel}: **₹${avg}/kg**\n\n${Lfoot(l)}`;
  }

  // 9. SAVINGS
  if (t.includes("save") || t.includes("saving") || t.includes("difference") || t.includes("how much less")) {
    const low = getLow(crop), high = getHigh(crop), avg = getAvg(crop);
    if (!low || !high) return lbl(l, `❌ No data for ${crop}.`, `❌ ${crop} की जानकारी नहीं।`, `❌ ${crop} बद्दल माहिती नाही।`);
    const diff = high.s.pricePerKg - low.s.pricePerKg;
    const qs = qty || 100;
    const savingsLabel = lbl(l, `💡 Buying ${qs} kg from cheapest saves`, `💡 सबसे सस्ते से ${qs} किग्रा खरीदने पर बचत`, `💡 ${qs} किलो सर्वात स्वस्त खरेदी केल्यास बचत`);
    const title = lbl(l, `💰 **Savings Analysis for ${cap(crop)}:**`, `💰 **${cap(crop)} बचत विश्लेषण:**`, `💰 **${cap(crop)} बचत विश्लेषण:**`);
    const cheapLabel = lbl(l, "Cheapest", "सबसे सस्ता", "सर्वात स्वस्त");
    const expLabel = lbl(l, "Most Expensive", "सबसे महंगा", "सर्वात महाग");
    return `${title}\n\n• ${cheapLabel}: ₹${low.s.pricePerKg}/kg at **${low.r.name}**\n• ${expLabel}: ₹${high.s.pricePerKg}/kg at **${high.r.name}**\n• ${Lmktavg(l)}: ₹${avg}/kg\n\n${savingsLabel}: **₹${(diff * qs).toLocaleString("en-IN")}**\n\n${Lfoot(l)}`;
  }

  // 10. BUDGET
  if (budget !== null || t.includes("budget") || t.includes("afford") || (t.includes("what can") && t.includes("buy"))) {
    const b = budget || 1000;
    const opts = getBudgetOpts(b).slice(0, 6);
    const title = lbl(l, `🛒 **What you can buy with ₹${b.toLocaleString("en-IN")}:**`, `🛒 **₹${b.toLocaleString("en-IN")} में क्या मिलेगा:**`, `🛒 **₹${b.toLocaleString("en-IN")} मध्ये काय मिळेल:**`);
    const note = lbl(l, "_Best prices used for each crop._", "_प्रत्येक फसल के लिए सर्वोत्तम दाम।_", "_प्रत्येक पिकासाठी सर्वोत्तम भाव।_");
    const buyLabel = lbl(l, "kg at", "किग्रा at", "किलो at");
    const fromLabel = lbl(l, "from", "से", "कडून");
    return `${title}\n\n` + opts.map(o => `• **${o.c}** — ${o.kg} ${buyLabel} ₹${o.p}/kg ${fromLabel} **${o.r.name}**`).join("\n") + `\n\n${note}`;
  }

  // 11. QUANTITY COST
  if (qty !== null) {
    const best = getBest(crop);
    if (!best) return lbl(l, `❌ No data for ${crop}.`, `❌ ${crop} की जानकारी नहीं।`, `❌ ${crop} बद्दल माहिती नाही।`);
    const stock = best.stock.find(s => s.name.toLowerCase().includes(crop))!;
    const total = stock.pricePerKg * qty;
    const low = getLow(crop)!;
    const savings = total - low.s.pricePerKg * qty;
    const unit = qty >= 100 ? `${qty / 100} ${lbl(l, "quintal", "क्विंटल", "क्विंटल")}` : `${qty} ${lbl(l, "kg", "किग्रा", "किलो")}`;
    const title = lbl(l, `�� **Cost for ${unit} of ${cap(crop)}:**`, `🧮 **${unit} ${cap(crop)} की लागत:**`, `🧮 **${unit} ${cap(crop)} ची किंमत:**`);
    const totalLabel = lbl(l, "💰 **Total Cost**", "💰 **कुल लागत**", "💰 **एकूण खर्च**");
    const tipLabel = lbl(l, `💡 Cheapest option (${low.r.name}) saves ₹${savings.toLocaleString("en-IN")}`, `💡 सर्वसस्ते (${low.r.name}) से ₹${savings.toLocaleString("en-IN")} बचत`, `💡 सर्वात स्वस्त (${low.r.name}) वरून ₹${savings.toLocaleString("en-IN")} बचत`);
    return `${title}\n\n**${best.name}**\n• ${Lp(l)}: ₹${stock.pricePerKg}/kg × ${qty}\n• ${Ls(l)}: ${stock.quantity}\n• ${Lr(l)}: ⭐ ${best.rating} ${Lv(l, best.verified)}\n\n${totalLabel}: ₹${total.toLocaleString("en-IN")}\n\n${savings > 0 ? `_${tipLabel}_\n\n` : ""}${Lfoot(l)}`;
  }

  // 12. LOCATION
  const locs = ["bhusawal", "chopda", "pachora", "amalner", "yawal", "raver", "erandol", "jamner", "midc", "jalgaon"];
  const locTriggers = ["near ", "retailer in", "shop in", "retailers in", "around ", "bhusawal", "chopda", "pachora", "amalner", "yawal", "raver", "erandol", "jamner", "midc"];
  if (locTriggers.some(kw => t.includes(kw)) || (t.includes("jalgaon") && !t.includes("price") && !t.includes("best") && !t.includes("cheap"))) {
    const detLoc = locs.find(l => t.includes(l)) || "";
    const results = detLoc ? filterByLoc(detLoc) : [];
    if (!results.length) {
      const noResult = lbl(l, "🔍 No retailers found. Available:", "🔍 कोई विक्रेता नहीं मिला। उपलब्ध:", "🔍 विक्रेते सापडले नाहीत. उपलब्ध:");
      return `${noResult}\n${locs.map(l => `• ${cap(l)}`).join("\n")}`;
    }
    const title = lbl(l, `📍 **Retailers in ${cap(detLoc)} (${results.length}):**`, `📍 **${cap(detLoc)} में विक्रेता (${results.length}):**`, `📍 **${cap(detLoc)} मधील विक्रेते (${results.length}):**`);
    const cropsAvail = lbl(l, "crops available", "फसलें उपलब्ध", "पिके उपलब्ध");
    return `${title}\n\n` + results.map(r => `• **${r.name}**\n  ⭐ ${r.rating} | ${Lv(l, r.verified)}\n  📞 ${r.contact}\n  🌾 ${r.stock.length} ${cropsAvail}`).join("\n\n") + `\n\n${Lfoot(l)}`;
  }

  // 12b. COMPARE FARMERS (customer comparing all farmers/sellers)
  if (t.includes("compare farmers") || t.includes("compare all") ||
    (t.includes("farmer") && (t.includes("compare") || t.includes("best") || t.includes("vs") || t.includes("list"))) ||
    (t.includes("retailer") && t.includes("list all"))
  ) {
    const ranked = getOverallBest();
    const medals = ["🥇", "🥈", "🥉"];
    const title2 = lbl(l,
      "🌾 **All Farmers/Sellers — Comparison:**",
      "🌾 **सभी किसान/विक्रेता — तुलना:**",
      "🌾 **सर्व शेतकरी/विक्रेते — तुलना:**"
    );
    const scoreNote2 = lbl(l,
      "_Score = Rating×15 + Verified + Reviews + Crop variety_",
      "_स्कोर = रेटिंग×15 + सत्यापन + समीक्षाएं + फसल विविधता_",
      "_स्कोर = रेटिंग×15 + प्रमाणन + पुनरावलोकने + पिके विविधता_"
    );
    const rows = ranked.map((x, i) => {
      const medal = i < 3 ? medals[i] : `${i + 1}.`;
      const crops2 = x.r.stock.slice(0, 2).map(s => s.name).join(", ");
      return `${medal} **${x.r.name}**\n   ⭐ ${x.r.rating} | ${x.r.reviewsCount} ${Lrev(l)} | ${Lv(l, x.r.verified)}\n   🌾 ${crops2}${x.r.stock.length > 2 ? ` +${x.r.stock.length - 2} more` : ""}\n   📍 ${x.r.location} | 📞 ${x.r.contact}\n   ${lbl(l, "Score", "स्कोर", "स्कोर")}: ${x.score.toFixed(1)}`;
    });
    const tip2 = lbl(l,
      `💡 Say _"Compare [Name1] and [Name2]"_ for a detailed head-to-head!`,
      `💡 _"[नाम1] और [नाम2] की तुलना"_ टाइप करें विस्तृत तुलना के लिए!`,
      `💡 _"[नाव1] आणि [नाव2] यांची तुलना"_ लिहा सविस्तर तुलनेसाठी!`
    );
    return `${title2}\n\n${scoreNote2}\n\n${rows.join("\n\n")}\n\n${tip2}`;
  }

  // 13. COMPARE
  if (t.includes("compare") || t.includes(" vs ") || t.includes("versus") || t.includes("difference between")) {
    const found = RETAILERS.filter(r => r.name.toLowerCase().split(" ").some(w => w.length > 3 && t.includes(w.toLowerCase())));
    if (found.length < 2) {
      const msg = lbl(l, "⚖️ Mention two retailer names to compare.\n\nAll:", "⚖️ तुलना के लिए दो विक्रेताओं के नाम लिखें।\n\nसभी:", "⚖️ तुलना करण्यासाठी दोन विक्रेत्यांची नावे लिहा।\n\nसर्व:");
      return `${msg}\n${RETAILERS.map(r => `• ${r.name}`).join("\n")}`;
    }
    const [r1, r2] = found;
    const s1 = r1.stock.find(s => s.name.toLowerCase().includes(crop));
    const s2 = r2.stock.find(s => s.name.toLowerCase().includes(crop));
    const common = r1.stock.filter(s1 => r2.stock.some(s2 => s2.name === s1.name)).map(s => s.name);
    const title = lbl(l, `⚖️ **${r1.name} vs ${r2.name}:**`, `⚖️ **${r1.name} बनाम ${r2.name}:**`, `⚖️ **${r1.name} विरुद्ध ${r2.name}:**`);
    const n1 = r1.name.split(" ")[0], n2 = r2.name.split(" ")[0];
    let resp = `${title}\n\n`;
    resp += `| | ${n1} | ${n2} |\n|---|---|---|\n`;
    resp += `| ${Lr(l)} | ⭐ ${r1.rating} | ⭐ ${r2.rating} |\n`;
    resp += `| ${Lrev(l)} | ${r1.reviewsCount} | ${r2.reviewsCount} |\n`;
    resp += `| ${Lcrops(l)} | ${r1.stock.length} | ${r2.stock.length} |\n`;
    resp += `| ✅ | ${r1.verified ? "Yes" : "No"} | ${r2.verified ? "Yes" : "No"} |\n`;
    resp += `| ${cap(crop)} | ${s1 ? "₹" + s1.pricePerKg + "/kg" : "N/A"} | ${s2 ? "₹" + s2.pricePerKg + "/kg" : "N/A"} |\n\n`;
    if (common.length) resp += `🌾 ${lbl(l, "Common", "सामान्य", "सामान्य")} ${Lcrops(l)}: ${common.join(", ")}\n\n`;
    if (s1 && s2) {
      const cheaper = s1.pricePerKg <= s2.pricePerKg ? r1 : r2;
      const betterRated = r1.rating >= r2.rating ? r1 : r2;
      const diff = Math.abs(s1.pricePerKg - s2.pricePerKg);
      const verdict = lbl(l, "✅ **Verdict:**", "✅ **निर्णय:**", "✅ **निर्णय:**");
      const lowerLabel = lbl(l, "Lower price", "कम कीमत", "कमी किंमत");
      const betterLabel = lbl(l, "Better rating", "बेहतर रेटिंग", "चांगली रेटिंग");
      resp += `${verdict}\n• ${lowerLabel}: **${cheaper.name}** (₹${diff}/kg)\n• ${betterLabel}: **${betterRated.name}**\n`;
    }
    resp += `\n${Lfoot(l)}`;
    return resp;
  }

  // 14. CONTACT
  if (t.includes("contact") || t.includes("phone") || t.includes("number") || t.includes("call") || t.includes("reach")) {
    const cleaned = t.replace(/contact|phone|number|call|reach|of|for|the|get/g, "").trim();
    const retailer = getRetailer(cleaned);
    if (retailer) {
      const title2 = lbl(l, `📞 **Contact: ${retailer.name}:**`, `📞 **संपर्क: ${retailer.name}:**`, `📞 **संपर्क: ${retailer.name}:**`);
      return `${title2}\n\n• ${lbl(l, "Phone", "फोन", "फोन")}: **${retailer.contact}**\n• ${Ll(l)}: ${retailer.location}\n• ${Lr(l)}: ⭐ ${retailer.rating}\n• ${Lv(l, retailer.verified)}\n\n${Lfoot(l)}`;
    }
    const allTitle = lbl(l, "📞 **All Retailer Contacts:**", "📞 **सभी विक्रेताओं के संपर्क:**", "📞 **सर्व विक्रेत्यांचे संपर्क:**");
    return `${allTitle}\n\n` + RETAILERS.map(r => `• **${r.name}**: ${r.contact}\n  📍 ${r.location}`).join("\n\n") + `\n\n${Lfoot(l)}`;
  }

  // 15. WHAT DOES RETAILER SELL
  if (t.includes("what does") || t.includes("what sells") || t.includes("what stock") || t.includes("stock of")) {
    const retailer = getRetailer(t);
    if (retailer) {
      const title2 = lbl(l, `🌾 **${retailer.name} — Full Stock:**`, `🌾 **${retailer.name} — पूरा स्टॉक:**`, `🌾 **${retailer.name} — संपूर्ण साठा:**`);
      return `${title2}\n\n` + retailer.stock.map(s => `• **${s.name}** — ₹${s.pricePerKg}/kg | ${Ls(l)}: ${s.quantity}`).join("\n") + `\n\n⭐ ${retailer.rating} | ${retailer.reviewsCount} ${Lrev(l)}\n📍 ${retailer.location}\n\n${Lfoot(l)}`;
    }
    return lbl(l, "🤔 Which retailer? Mention their name.", "🤔 कौन सा विक्रेता? नाम बताएं।", "🤔 कोणता विक्रेता? नाव सांगा.");
  }

  // 16. ALL CROPS
  if (t.includes("all crops") || t.includes("list crops") || t.includes("available crops") || t.includes("what crops") || t.includes("which crops")) {
    const crops2 = getAllCrops();
    const title2 = lbl(l, `🌾 **All Crops (${crops2.length}):**`, `🌾 **सभी फसलें (${crops2.length}):**`, `🌾 **सर्व पिके (${crops2.length}):**`);
    const note2 = lbl(l, "_Ask about any crop for pricing!_", "_किसी भी फसल के बारे में पूछें!_", "_कोणत्याही पिकाबद्दल विचारा!_");
    return `${title2}\n\n` + crops2.map(c => { const low = getLow(c); const cnt = getWithCrop(c).length; return `• **${c}** — from ₹${low?.s.pricePerKg}/kg | ${cnt} ${Lv(l, false).includes("Listed") || Lv(l, false).includes("नोंदणी") || Lv(l, false).includes("सूचीबद्ध") ? lbl(l, "sellers", "विक्रेता", "विक्रेते") : lbl(l, "sellers", "विक्रेता", "विक्रेते")}`; }).join("\n") + `\n\n${note2}`;
  }

  // 17. WHO HAS CROP
  if (t.includes("who has") || t.includes("in stock") || t.includes("who sells") || t.includes("which retailer") || t.includes("stock")) {
    const sellers2 = getWithCrop(crop);
    if (!sellers2.length) return lbl(l, `❌ No retailers have ${crop}.`, `❌ किसी के पास ${crop} नहीं है।`, `❌ कोणाकडेही ${crop} नाही।`);
    const sorted2 = sellers2.map(r => ({ r, s: r.stock.find(s => s.name.toLowerCase().includes(crop))! })).sort((a, b) => a.s.pricePerKg - b.s.pricePerKg);
    const title2 = lbl(l, `📦 **Retailers with ${cap(crop)}:**`, `📦 **${cap(crop)} वाले विक्रेता:**`, `📦 **${cap(crop)} असलेले विक्रेते:**`);
    const cheapLabel2 = lbl(l, "💡 Cheapest", "💡 सबसे सस्ता", "💡 सर्वात स्वस्त");
    return `${title2}\n\n` + sorted2.map((x, i) => `${i + 1}. **${x.r.name}**\n   ₹${x.s.pricePerKg}/kg | ${x.s.quantity} | ⭐ ${x.r.rating}`).join("\n\n") + `\n\n${cheapLabel2}: **${sorted2[0].r.name}** @ ₹${sorted2[0].s.pricePerKg}/kg\n\n${Lfoot(l)}`;
  }

  // 18. BEST / RECOMMEND
  if (t.includes("best") || t.includes("recommend") || t.includes("where to buy") || t.includes("buy") || t.includes("suggest")) {
    const best2 = getBest(crop);
    if (!best2) return lbl(l, `❌ No retailer for ${crop}.`, `❌ ${crop} के लिए कोई विक्रेता नहीं।`, `❌ ${crop} साठी विक्रेता नाही।`);
    const stock2 = best2.stock.find(s => s.name.toLowerCase().includes(crop))!;
    const avg2 = getAvg(crop);
    const sav = avg2 ? avg2 - stock2.pricePerKg : 0;
    const title2 = lbl(l, `🌟 **Best Retailer for ${cap(crop)}:**`, `🌟 **${cap(crop)} के लिए सर्वोत्तम विक्रेता:**`, `🌟 **${cap(crop)} साठी सर्वोत्तम विक्रेता:**`);
    const belowAvg = lbl(l, `₹${sav} below avg`, `₹${sav} औसत से कम`, `₹${sav} सरासरीपेक्षा कमी`);
    const ranked2Lbl = lbl(l, "_Ranked by: low price + high rating + verification._", "_क्रम: कम दाम + ज्यादा रेटिंग + सत्यापन।_", "_क्रम: कमी किंमत + जास्त रेटिंग + प्रमाणन।_");
    return `${title2}\n\n**${best2.name}**\n• ${Lp(l)}: ₹${stock2.pricePerKg}/kg ${sav > 0 ? `(${belowAvg})` : ""}  \n• ${Ls(l)}: ${stock2.quantity}\n• ${Lr(l)}: ⭐ ${best2.rating} (${best2.reviewsCount} ${Lrev(l)})\n• ${Ll(l)}: ${best2.location}\n• ${Lc(l)}: ${best2.contact}\n• ${Lv(l, best2.verified)}\n\n${ranked2Lbl}`;
  }

  // 19. LIST ALL RETAILERS
  if (t.includes("list all") || t.includes("all retailers") || t.includes("show all") || t.includes("all shops")) {
    const title2 = lbl(l, `📋 **All ${RETAILERS.length} Retailers:**`, `📋 **सभी ${RETAILERS.length} विक्रेता:**`, `📋 **सर्व ${RETAILERS.length} विक्रेते:**`);
    return `${title2}\n\n` + RETAILERS.map((r, i) => `${i + 1}. **${r.name}** — ⭐ ${r.rating} ${r.verified ? "✅" : ""}\n   📍 ${r.location}`).join("\n\n") + `\n\n${Lfoot(l)}`;
  }

  // 20. MARKET SUMMARY
  if (t.includes("market summary") || t.includes("market overview") || t.includes("overview") || t.includes("summary") || t.includes("statistics")) {
    const vc = RETAILERS.filter(r => r.verified).length;
    const topR = [...RETAILERS].sort((a, b) => b.rating - a.rating)[0];
    const avgR = (RETAILERS.reduce((s, r) => s + r.rating, 0) / RETAILERS.length).toFixed(1);
    const wp = RETAILERS.map(r => r.stock.find(s => s.name === "Wheat")?.pricePerKg).filter(Boolean) as number[];
    const title2 = lbl(l, "📊 **KrishiSetu Market Summary:**", "📊 **KrishiSetu बाजार सारांश:**", "📊 **KrishiSetu बाजार सारांश:**");
    const totalR = lbl(l, "Total Retailers", "कुल विक्रेता", "एकूण विक्रेते");
    const verR = lbl(l, "Verified", "सत्यापित", "प्रमाणित");
    const avgRl = lbl(l, "Avg Rating", "औसत रेटिंग", "सरासरी रेटिंग");
    const totalCrop = lbl(l, "Total Crops", "कुल फसलें", "एकूण पिके");
    const topRl = lbl(l, "Top Rated", "शीर्ष रेटिंग", "सर्वोच्च रेटिंग");
    const wpr = lbl(l, "Wheat Price Range", "गेहूं मूल्य सीमा", "गहू किंमत श्रेणी");
    const note2 = lbl(l, "_Live marketplace data._", "_लाइव बाजार डेटा।_", "_थेट बाजार डेटा।_");
    return `${title2}\n\n• **${totalR}:** ${RETAILERS.length}\n• **${verR}:** ${vc}/${RETAILERS.length}\n• **${avgRl}:** ⭐ ${avgR}\n• **${totalCrop}:** ${getAllCrops().length}\n• **${topRl}:** ${topR.name} (⭐ ${topR.rating})\n• **${wpr}:** ₹${Math.min(...wp)}–₹${Math.max(...wp)}/kg\n\n${note2}`;
  }

  // 21. AVERAGE PRICE
  if (t.includes("average price") || t.includes("avg price") || t.includes("average cost") || t.includes("typical price")) {
    const avg2 = getAvg(crop);
    if (!avg2) return lbl(l, `❌ No pricing data for ${crop}.`, `❌ ${crop} की कीमत की जानकारी नहीं।`, `❌ ${crop} ची किंमत माहीत नाही।`);
    const low2 = getLow(crop)!, high2 = getHigh(crop)!;
    const title2 = lbl(l, `📈 **${cap(crop)} Price Analysis:**`, `📈 **${cap(crop)} मूल्य विश्लेषण:**`, `📈 **${cap(crop)} किंमत विश्लेषण:**`);
    const avgLabel2 = lbl(l, "Average Market Price", "औसत बाजार दाम", "सरासरी बाजार भाव");
    const lowLabel = lbl(l, "Lowest", "सबसे कम", "सर्वात कमी");
    const highLabel = lbl(l, "Highest", "सबसे ज्यादा", "सर्वात जास्त");
    const range = lbl(l, "Price Range (spread)", "मूल्य सीमा", "किंमत श्रेणी");
    const cropsHave = lbl(l, `Based on ${getWithCrop(crop).length} retailers`, `${getWithCrop(crop).length} विक्रेताओं के आधार पर`, `${getWithCrop(crop).length} विक्रेत्यांनुसार`);
    return `${title2}\n\n• ${avgLabel2}: **₹${avg2}/kg**\n• ${lowLabel}: ₹${low2.s.pricePerKg}/kg (${low2.r.name})\n• ${highLabel}: ₹${high2.s.pricePerKg}/kg (${high2.r.name})\n• ${range}: ₹${high2.s.pricePerKg - low2.s.pricePerKg}\n\n_${cropsHave}._`;
  }

  // 21b. 7-DAY PRICE TREND
  if (
    t.includes("trend") || t.includes("7 day") || t.includes("7-day") || t.includes("seven day") ||
    t.includes("weekly") || t.includes("this week") || t.includes("price history") ||
    t.includes("price movement") || t.includes("price chart") || t.includes("going up") ||
    t.includes("going down") || t.includes("should i sell") || t.includes("when to sell") ||
    (t.includes("price") && (t.includes("week") || t.includes("days")))
  ) {
    const td = get7DayTrend(crop);
    const maxP = Math.max(...td.days.map(d => d.price));
    const BARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    const bar = (p: number) => BARS[Math.min(7, Math.floor((p / maxP) * 7.99))];
    const chart = td.days.map(d => `${d.day.padEnd(5)} ${bar(d.price)} ₹${d.price}`).join("\n");

    const trendEmoji = td.trend === "rising" ? "📈" : td.trend === "falling" ? "📉" : "➡️";
    const trendWord = lbl(l,
      td.trend === "rising" ? "Rising" : td.trend === "falling" ? "Falling" : "Stable",
      td.trend === "rising" ? "बढ़ रहा है" : td.trend === "falling" ? "गिर रहा है" : "स्थिर है",
      td.trend === "rising" ? "वाढत आहे" : td.trend === "falling" ? "घसरत आहे" : "स्थिर आहे"
    );

    // Smart farmer advice based on trend
    const advice = lbl(l,
      td.trend === "rising"
        ? `✅ **Sell Now or Wait!** Price is rising ${td.pct > 5 ? "strongly" : "steadily"}. If rise continues, wait 2-3 more days for peak. Set a target price before selling.`
        : td.trend === "falling"
          ? `⚠️ **Sell Quickly!** Price has dropped ₹${Math.abs(td.change)}/kg this week. Avoid holding too long — sell in next 1-2 days to minimize losses.`
          : `💡 **Hold & Watch.** Price is stable. Monitor market for 2-3 days. Buy more stock now at stable rates before any seasonal spike.`,
      td.trend === "rising"
        ? `✅ **अभी बेचें या इंतज़ार करें!** कीमत ${td.pct}% बढ़ी। 2-3 दिन और रुकें — शायद और बढ़े। एक लक्ष्य कीमत तय करें।`
        : td.trend === "falling"
          ? `⚠️ **जल्दी बेचें!** इस हफ़्ते ₹${Math.abs(td.change)}/किग्रा की गिरावट। 1-2 दिन में बेचें, नुकसान से बचें।`
          : `💡 **देखते रहें।** कीमत स्थिर है। 2-3 दिन निगरानी करें। मौसमी उछाल से पहले स्टॉक बढ़ाएं।`,
      td.trend === "rising"
        ? `✅ **आता विका किंवा थांबा!** किंमत ${td.pct}% वाढली. 2-3 दिवस थांबा — आणखी वाढेल. विक्रीसाठी लक्ष्य किंमत ठरवा.`
        : td.trend === "falling"
          ? `⚠️ **लवकर विका!** या आठवड्यात ₹${Math.abs(td.change)}/किलो घट. 1-2 दिवसांत विका, तोटा टाळा.`
          : `💡 **पाहत राहा.** किंमत स्थिर आहे. 2-3 दिवस निरीक्षण करा. हंगामी वाढीआधी माल वाढवा.`
    );

    const title3 = lbl(l,
      `📊 **7-Day Price Trend — ${cap(crop)}:**`,
      `📊 **7 दिन का मूल्य ट्रेंड — ${cap(crop)}:**`,
      `📊 **7 दिवसांचा किंमत ट्रेंड — ${cap(crop)}:**`
    );
    const summary = lbl(l,
      `${trendEmoji} **${trendWord}** | Start: ₹${td.start} → Today: ₹${td.current} | Change: ${td.change >= 0 ? "+" : ""}₹${td.change} (${td.pct >= 0 ? "+" : ""}${td.pct}%)`,
      `${trendEmoji} **${trendWord}** | शुरुआत: ₹${td.start} → आज: ₹${td.current} | बदलाव: ${td.change >= 0 ? "+" : ""}₹${td.change} (${td.pct >= 0 ? "+" : ""}${td.pct}%)`,
      `${trendEmoji} **${trendWord}** | सुरुवात: ₹${td.start} → आज: ₹${td.current} | बदल: ${td.change >= 0 ? "+" : ""}₹${td.change} (${td.pct >= 0 ? "+" : ""}${td.pct}%)`
    );
    const chartLabel = lbl(l, "📅 **Daily Prices:**", "📅 **दैनिक कीमतें:**", "📅 **दैनिक किंमती:**");
    const adviceLabel = lbl(l, "🧑‍🌾 **Farmer Advice:**", "🧑‍🌾 **किसान सलाह:**", "🧑‍🌾 **शेतकरी सल्ला:**");
    const otherLabel = lbl(l,
      `_Check other crops: "7 day onion trend", "wheat price history"_`,
      `_अन्य फसल: "7 दिन प्याज ट्रेंड", "गेहूं ट्रेंड"_`,
      `_इतर पिके: "7 दिवस कांदा ट्रेंड", "गहू ट्रेंड"_`
    );

    return `${title3}\n\n${summary}\n\n${chartLabel}\n\`\`\`\n${chart}\n\`\`\`\n\n${adviceLabel}\n${advice}\n\n${otherLabel}`;
  }

  // 22. REGISTER
  if (t.includes("register") || t.includes("sign up") || t.includes("join") || t.includes("how to become") || t.includes("add my shop")) {
    return lbl(l,
      `�� **How to Register on KrishiSetu:**\n\n1. Go to the **Sign Up** page\n2. Fill in name, email & password\n3. Select **"Retailer"** role\n4. Submit — instant access!\n\n💡 After login, go to your **Dashboard** to add crops & prices.\n\n_Need help? Ask me!_`,
      `📝 **KrishiSetu पर पंजीकरण:**\n\n1. **साइन अप** पेज पर जाएं\n2. नाम, ईमेल और पासवर्ड भरें\n3. **"विक्रेता"** भूमिका चुनें\n4. सबमिट करें!\n\n💡 लॉगिन के बाद **डैशबोर्ड** पर फसल जोड़ें।\n\n_कोई सवाल? पूछें!_`,
      `📝 **KrishiSetu वर नोंदणी:**\n\n1. **साइन अप** पेजवर जा\n2. नाव, ईमेल आणि पासवर्ड भरा\n3. **"विक्रेता"** भूमिका निवडा\n4. सबमिट करा!\n\n💡 लॉगिन नंतर **डॅशबोर्डवर** पिके जोडा।\n\n_काही प्रश्न? विचारा!_`
    );
  }

  // 23. TIPS
  if (t.includes("tip") || t.includes("advice") || t.includes("when to buy") || t.includes("season") || t.includes("rabi") || t.includes("kharif")) {
    return lbl(l,
      `🌱 **Agricultural Market Tips:**\n\n🌾 **Wheat (Rabi)** — Best buying: March–April\n🧅 **Onions** — Buy in bulk after monsoon\n🍅 **Tomatoes** — Cheapest in winter (Nov–Feb)\n\n💡 **Tips:**\n• Buy from verified sellers for quality\n• Bulk buying saves ₹2–5/kg\n• Compare prices before buying!`,
      `🌱 **कृषि बाजार टिप्स:**\n\n🌾 **गेहूं (रबी)** — खरीदें: मार्च–अप्रैल\n🧅 **प्याज** — मानसून के बाद थोक में खरीदें\n🍅 **टमाटर** — सबसे सस्ता: नवंबर–फरवरी\n\n💡 **टिप्स:**\n• सत्यापित विक्रेताओं से खरीदें\n• थोक से ₹2–5/किग्रा बचत\n• हमेशा दाम तुलना करें!`,
      `🌱 **कृषी बाजार टिप्स:**\n\n🌾 **गहू (रबी)** — खरेदी करा: मार्च–एप्रिल\n🧅 **कांदा** — पावसाळ्यानंतर घाऊक खरेदी करा\n🍅 **टोमॅटो** — सर्वात स्वस्त: नोव्हेंबर–फेब्रुवारी\n\n💡 **टिप्स:**\n• प्रमाणित विक्रेत्यांकडून खरेदी करा\n• घाऊक खरेदीने ₹2–5/किलो बचत\n• नेहमी भाव तुलना करा!`
    );
  }

  // 24. PRICE GENERAL
  if (t.includes("price") || t.includes("rate") || t.includes("cost")) {
    const sellers3 = getWithCrop(crop);
    if (!sellers3.length) return lbl(l, `❌ No data for ${crop}.`, `❌ ${crop} की जानकारी नहीं।`, `❌ ${crop} बद्दल माहिती नाही।`);
    const avg3 = getAvg(crop);
    const low3 = getLow(crop)!, high3 = getHigh(crop)!;
    const title3 = lbl(l, `💰 **${cap(crop)} Price Summary:**`, `💰 **${cap(crop)} मूल्य सारांश:**`, `💰 **${cap(crop)} किंमत सारांश:**`);
    const bestPick = lbl(l, "🏆 **Best pick**", "🏆 **सर्वोत्तम चुनाव**", "🏆 **सर्वोत्तम निवड**");
    const note3 = lbl(l, `_Say "all ${crop} prices" for full list._`, `_"सभी ${crop} के दाम" टाइप करें।_`, `_"सर्व ${crop} भाव" लिहा।_`);
    return `${title3}\n\n• ${lbl(l, "Lowest", "सबसे कम", "सर्वात कमी")}: ₹${low3.s.pricePerKg}/kg (${low3.r.name})\n• ${lbl(l, "Highest", "सबसे ज्यादा", "सर्वात जास्त")}: ₹${high3.s.pricePerKg}/kg (${high3.r.name})\n• ${Lmktavg(l)}: ₹${avg3}/kg\n• ${lbl(l, "Available at", "उपलब्ध", "उपलब्ध")}: ${sellers3.length} ${lbl(l, "retailers", "विक्रेता", "विक्रेते")}\n\n${bestPick}: ${getBest(crop)?.name}\n\n${note3}`;
  }

  // FALLBACK
  return lbl(l,
    `🤔 Didn't catch that. Try:\n\n• "Best overall retailer"\n• "Best wheat price"\n• "₹5000 budget"\n• "Retailers near Bhusawal"\n• "Contact of Suresh Dada"\n• "Market overview"\n\nType **"help"** to see all features! 🌾`,
    `🤔 समझ नहीं आया। कोशिश करें:\n\n• "सर्वश्रेष्ठ विक्रेता"\n• "गेहूं का सबसे अच्छा दाम"\n• "₹5000 बजट"\n• "भुसावल के पास दुकान"\n• "सुरेश दादा का नंबर"\n• "बाजार सारांश"\n\n**"मदद"** टाइप करें! 🌾`,
    `🤔 समजले नाही. प्रयत्न करा:\n\n• "सर्वोत्तम विक्रेता"\n• "गहूचा सर्वात चांगला भाव"\n• "₹5000 बजेट"\n• "भुसावळ जवळ दुकान"\n• "सुरेश दादाचा नंबर"\n• "बाजाराची माहिती"\n\n**"मदत"** टाइप करा! 🌾`
  );
}


// ─── Render text (basic markdown: **bold**, _italic_) ─────────────────────────
function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part.replace(/_([^_]+)_/g, "$1")}</span>
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

const QUICK = [
  "Best overall retailer",
  "Compare all farmers",
  "7 day wheat trend",
  "गेहूं का 7 दिन ट्रेंड",
  "गहूचा 7 दिवस ट्रेंड",
  "किसानों की तुलना करो",
  "शेतकऱ्यांची तुलना करा",
  "Best wheat price",
  "When to sell wheat?",
  "₹3000 budget",
  "Market overview",
];

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function KrishiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 0, role: "bot",
    text: `🌾 **Namaste! नमस्ते! नमस्कार!**\n\nI'm **Krishi Market Assistant** — your AI agricultural guide.\n\n🗣️ Ask in **English, हिंदी, or मराठी!**\n\nTry:\n• "Best wheat price"\n• "गेहूं का भाव बताओ"\n• "गहूचा सर्वात स्वस्त भाव"\n\n_Powered by live marketplace data._`,
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [messages, isOpen]);

  function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = processIntent(msg);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: reply }]);
      setIsTyping(false);
    }, 700 + Math.random() * 500);
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 4px 20px rgba(22,163,74,0.5)" }}
        title="Krishi Market Assistant"
      >
        {isOpen ? <span style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>×</span> : <FarmLogo size={28} className="text-white" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-h-[580px] flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FarmLogo size={22} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Krishi Market Assistant</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>AI-powered • English / हिंदी / मराठी</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 6px #4ade80" }}></div>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb", padding: "12px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 380 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "bot" && (
                  <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0, alignSelf: "flex-end" }}>
                    <FarmLogo size={16} />
                  </div>
                )}
                <div style={{
                  background: m.role === "user" ? "linear-gradient(135deg,#16a34a,#15803d)" : "#fff",
                  color: m.role === "user" ? "#fff" : "#1f2937",
                  padding: "10px 13px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  maxWidth: "83%", fontSize: 13, lineHeight: 1.55, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FarmLogo size={16} />
                </div>
                <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "10px 15px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, background: "#16a34a", borderRadius: "50%", animation: `bounce 1s ${i * 0.15}s infinite` }}></div>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ background: "#fff", padding: "6px 10px", display: "flex", gap: 6, overflowX: "auto", borderTop: "1px solid #e5e7eb" }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{ flexShrink: 0, background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", borderRadius: 20, padding: "4px 10px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ background: "#fff", padding: "10px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="English / हिंदी / मराठी..."
              style={{ flex: 1, background: "#f9fafb", border: "1px solid #d1fae5", borderRadius: 20, padding: "9px 14px", fontSize: 13, outline: "none", color: "#1f2937" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{ width: 38, height: 38, background: "linear-gradient(135deg,#16a34a,#15803d)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </>
  );
}
