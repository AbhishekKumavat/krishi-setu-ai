
export type Lang = "english" | "hindi" | "marathi";

/** Pick the right language string */
export const lbl = (lang: Lang, en: string, hi: string, mr: string): string =>
    lang === "hindi" ? hi : lang === "marathi" ? mr : en;

/** Common labels */
export const T = {
    price: (l: Lang) => lbl(l, "Price", "कीमत", "किंमत"),
    stock: (l: Lang) => lbl(l, "Stock", "स्टॉक", "साठा"),
    rating: (l: Lang) => lbl(l, "Rating", "रेटिंग", "रेटिंग"),
    location: (l: Lang) => lbl(l, "Location", "स्थान", "स्थान"),
    contact: (l: Lang) => lbl(l, "Contact", "संपर्क", "संपर्क"),
    reviews: (l: Lang) => lbl(l, "reviews", "समीक्षाएं", "पुनरावलोकने"),
    crops: (l: Lang) => lbl(l, "crops", "फसलें", "पिके"),
    verified: (l: Lang) => lbl(l, "✅ Verified Seller", "✅ सत्यापित विक्रेता", "✅ प्रमाणित विक्रेता"),
    listed: (l: Lang) => lbl(l, "📋 Listed Seller", "📋 सूचीबद्ध विक्रेता", "📋 नोंदणीकृत विक्रेता"),
    lowest: (l: Lang) => lbl(l, "Lowest", "सबसे कम", "सर्वात कमी"),
    highest: (l: Lang) => lbl(l, "Highest", "सबसे ज्यादा", "सर्वात जास्त"),
    average: (l: Lang) => lbl(l, "Average", "औसत", "सरासरी"),
    mktAvg: (l: Lang) => lbl(l, "Market Average", "बाजार औसत", "बाजार सरासरी"),
    youSave: (l: Lang) => lbl(l, "💰 You save", "💰 आप बचाते हैं", "💰 तुम्ही वाचवता"),
    totalCost: (l: Lang) => lbl(l, "💰 **Total Cost**", "💰 **कुल लागत**", "💰 **एकूण खर्च**"),
    bestPick: (l: Lang) => lbl(l, "🏆 **Best pick**", "🏆 **सर्वोत्तम चुनाव**", "🏆 **सर्वोत्तम निवड**"),
    footer: (l: Lang) => lbl(l, "_Based on current marketplace data._", "_वर्तमान बाजार डेटा के आधार पर।_", "_सध्याच्या बाजार डेटानुसार।_"),
    cheapest: (l: Lang) => lbl(l, "Cheapest", "सबसे सस्ता", "सर्वात स्वस्त"),
    expensive: (l: Lang) => lbl(l, "Most Expensive", "सबसे महंगा", "सर्वात महाग"),
    common: (l: Lang) => lbl(l, "🌾 Common crops", "🌾 सामान्य फसलें", "🌾 सामान्य पिके"),
    sellers: (l: Lang) => lbl(l, "sellers", "विक्रेता", "विक्रेते"),
    verdict: (l: Lang) => lbl(l, "✅ **Verdict**", "✅ **निर्णय**", "✅ **निर्णय**"),
    lowerPrice: (l: Lang) => lbl(l, "Lower price", "कम कीमत", "कमी किंमत"),
    betterRated: (l: Lang) => lbl(l, "Better rating", "बेहतर रेटिंग", "चांगली रेटिंग"),
    saves: (l: Lang) => lbl(l, "saves", "बचाता है", "वाचवतो"),
    availableAt: (l: Lang) => lbl(l, "Available at", "उपलब्ध", "उपलब्ध"),
    mapsLink: (l: Lang) => lbl(l, "📍 View on Maps", "📍 नक्शे पर देखें", "📍 नकाशावर पहा"),
    score: (l: Lang) => lbl(l, "Score", "स्कोर", "स्कोर"),
    scoreNote: (l: Lang) => lbl(l, "_Score = Rating×15 + Verified bonus + Reviews + Stock variety_", "_स्कोर = रेटिंग×15 + सत्यापन बोनस + समीक्षाएं + फसल विविधता_", "_स्कोर = रेटिंग×15 + प्रमाणन बोनस + पुनरावलोकने + पिके विविधता_"),
    overall: (l: Lang) => lbl(l, "🥇 **Overall Best Retailers (Composite Score):**", "🥇 **सर्वश्रेष्ठ विक्रेता (समग्र स्कोर):**", "🥇 **सर्वोत्तम विक्रेते (एकत्रित स्कोर):**"),
    overallNote: (l: Lang) => lbl(l, "_Based on rating, trust, popularity & stock variety._", "_रेटिंग, विश्वास, लोकप्रियता और फसल विविधता के आधार पर।_", "_रेटिंग, विश्वास, लोकप्रियता आणि पिके विविधतेनुसार।_"),
    perKg: (l: Lang) => lbl(l, "/kg", "/किग्रा", "/किलो"),
    quintal: (l: Lang) => lbl(l, "quintal", "क्विंटल", "क्विंटल"),
    kg: (l: Lang) => lbl(l, "kg", "किग्रा", "किलो"),
    buy: (l: Lang) => lbl(l, "buy", "खरीद सकते हैं", "खरेदी करू शकता"),
};

/** Full response builders for each intent */

export function resp_help(l: Lang): string {
    return lbl(l,
        `🌾 **Krishi Market Assistant — Full Capabilities:**\n\n**🔍 Price Queries**\n• "Best wheat price"\n• "Cheapest tomatoes"\n• "All wheat prices"\n• "Average onion price"\n\n**🏆 Rankings**\n• "Best overall retailer"\n• "Highest rated retailer"\n• "Most reviewed shop"\n• "Verified retailers only"\n\n**📍 Location**\n• "Retailers near Bhusawal"\n• "Shops in Jalgaon"\n\n**⚖️ Compare**\n• "Compare Anand and Ekdunt"\n\n**🧮 Calculator**\n• "If I buy 200 kg wheat?"\n• "What can I get for ₹5000?"\n\n**📦 Stock**\n• "Who has wheat in stock?"\n• "What does Ekdunt sell?"\n• "List all crops"\n\n**📞 Contact**\n• "Contact of Anand Vegetable"\n\n**💰 Savings**\n• "How much can I save on wheat?"\n• "Market overview"\n\n_Ask me anything!_`,

        `🌾 **कृषि बाजार सहायक — पूरी क्षमताएं:**\n\n**🔍 कीमत प्रश्न**\n• "गेहूं का सबसे अच्छा दाम"\n• "सबसे सस्ता टमाटर"\n• "सभी गेहूं के दाम"\n• "प्याज का औसत दाम"\n\n**🏆 रैंकिंग**\n• "सर्वश्रेष्ठ विक्रेता"\n• "सबसे ज्यादा रेटिंग वाला विक्रेता"\n• "सबसे ज्यादा समीक्षा"\n• "सत्यापित विक्रेता"\n\n**📍 स्थान**\n• "भुसावल के पास दुकान"\n• "जलगांव में विक्रेता"\n\n**⚖️ तुलना**\n• "आनंद और एकदंत की तुलना"\n\n**🧮 कैलकुलेटर**\n• "200 किग्रा गेहूं कितने का?"\n• "₹5000 में क्या मिलेगा?"\n\n**📦 स्टॉक**\n• "किसके पास गेहूं है?"\n• "एकदंत क्या बेचता है?"\n\n**📞 संपर्क**\n• "आनंद वेजिटेबल का नंबर"\n\n**💰 बचत**\n• "गेहूं पर कितनी बचत होगी?"\n\n_कोई भी सवाल पूछें!_`,

        `🌾 **कृषी बाजार सहाय्यक — संपूर्ण क्षमता:**\n\n**🔍 किंमत प्रश्न**\n• "गहूचा सर्वात चांगला भाव"\n• "सर्वात स्वस्त टोमॅटो"\n• "सर्व गहू भाव"\n• "कांद्याचा सरासरी भाव"\n\n**🏆 क्रमवारी**\n• "सर्वोत्तम विक्रेता"\n• "सर्वाधिक रेटिंग विक्रेता"\n• "सर्वाधिक पुनरावलोकने"\n• "प्रमाणित विक्रेते"\n\n**📍 स्थान**\n• "भुसावळ जवळ दुकान"\n• "जळगाव मधील विक्रेते"\n\n**⚖️ तुलना**\n• "आनंद आणि एकदंत यांची तुलना"\n\n**🧮 कॅल्क्युलेटर**\n• "200 किलो गहू किती रुपये?"\n• "₹5000 मध्ये काय मिळेल?"\n\n**📦 साठा**\n• "कोणाकडे गहू आहे?"\n• "एकदंत काय विकतो?"\n\n**📞 संपर्क**\n• "आनंद भाजीपाल्याचा नंबर"\n\n**💰 बचत**\n• "गहूवर किती बचत होईल?"\n\n_काहीही विचारा!_`
    );
}

export function resp_greeting(l: Lang): string {
    return lbl(l,
        `🙏 **Namaste! Welcome to Krishi Market Assistant!**\n\nI'm your smart agricultural marketplace guide.\n\n🏆 Find the **best retailer** overall\n💸 Compare **crop prices** across retailers\n📍 Locate **shops near you**\n🧮 **Calculate costs** for any quantity\n💰 Find **cheapest deals** and savings\n📞 Get **contact details** instantly\n\nTry: _"Best overall retailer"_ or _"What can I buy for ₹5000?"_`,

        `🙏 **नमस्ते! कृषि बाजार सहायक में आपका स्वागत है!**\n\nमैं आपका स्मार्ट कृषि बाजार मार्गदर्शक हूं।\n\n🏆 **सर्वश्रेष्ठ विक्रेता** खोजें\n💸 सभी विक्रेताओं के **फसल दाम** देखें\n📍 **आपके पास की दुकान** खोजें\n🧮 किसी भी मात्रा की **लागत** जानें\n💰 **सस्ते सौदे** और बचत खोजें\n📞 **संपर्क विवरण** तुरंत पाएं\n\nकोशिश करें: _"सर्वश्रेष्ठ विक्रेता"_ या _"₹5000 में क्या मिलेगा?"_`,

        `🙏 **नमस्कार! कृषी बाजार सहाय्यकमध्ये आपले स्वागत आहे!**\n\nमी तुमचा हुशार कृषी बाजार मार्गदर्शक आहे।\n\n🏆 **सर्वोत्तम विक्रेता** शोधा\n💸 सर्व विक्रेत्यांचे **पिके भाव** पाहा\n📍 **तुमच्या जवळची दुकाने** शोधा\n🧮 कोणत्याही प्रमाणाची **किंमत** जाणा\n💰 **स्वस्त सौदे** आणि बचत शोधा\n📞 **संपर्क तपशील** लगेच मिळवा\n\nप्रयत्न करा: _"सर्वोत्तम विक्रेता"_ किंवा _"₹5000 मध्ये काय मिळेल?"_`
    );
}

export function resp_fallback(l: Lang): string {
    return lbl(l,
        `🤔 I didn't quite catch that. Try:\n\n• "**Best overall retailer**"\n• "**Best wheat price**"\n• "**What can I buy for ₹5000?**"\n• "**Retailers near Bhusawal**"\n• "**Contact of Suresh Dada**"\n• "**Market overview**"\n\nOr type **"help"** to see all features! 🌾`,

        `🤔 मुझे समझ नहीं आया। कोशिश करें:\n\n• "**सर्वश्रेष्ठ विक्रेता**"\n• "**गेहूं का सबसे अच्छा दाम**"\n• "**₹5000 में क्या मिलेगा?**"\n• "**भुसावल के पास दुकान**"\n• "**सुरेश दादा का नंबर**"\n• "**बाजार सारांश**"\n\nया **"मदद"** टाइप करें! 🌾`,

        `🤔 मला समजले नाही. प्रयत्न करा:\n\n• "**सर्वोत्तम विक्रेता**"\n• "**गहूचा सर्वात चांगला भाव**"\n• "**₹5000 मध्ये काय मिळेल?**"\n• "**भुसावळ जवळ दुकान**"\n• "**सुरेश दादाचा नंबर**"\n• "**बाजाराची माहिती**"\n\nकिंवा **"मदत"** टाइप करा! 🌾`
    );
}

export function resp_register(l: Lang): string {
    return lbl(l,
        `📝 **How to Register on KrishiSetu:**\n\n1. Go to the **Sign Up** page\n2. Fill in your name, email & password\n3. Select **"Retailer"** as your role\n4. Submit — instant access!\n\n💡 After login, go to your **Dashboard** to:\n• Add your crops & prices\n• Manage stock inventory\n\n_Need help? Ask me anytime!_`,

        `📝 **KrishiSetu पर पंजीकरण कैसे करें:**\n\n1. **साइन अप** पेज पर जाएं\n2. अपना नाम, ईमेल और पासवर्ड भरें\n3. **"विक्रेता"** चुनें\n4. सबमिट करें — तुरंत एक्सेस!\n\n💡 लॉगिन के बाद **डैशबोर्ड** पर:\n• अपनी फसल और दाम जोड़ें\n• स्टॉक प्रबंधित करें\n\n_कोई सवाल? पूछें!_`,

        `📝 **KrishiSetu वर नोंदणी कशी करावी:**\n\n1. **साइन अप** पेजवर जा\n2. तुमचे नाव, ईमेल आणि पासवर्ड भरा\n3. **"विक्रेता"** निवडा\n4. सबमिट करा — लगेच प्रवेश!\n\n💡 लॉगिन नंतर **डॅशबोर्डवर**:\n• तुमची पिके आणि भाव जोडा\n• साठा व्यवस्थापित करा\n\n_काही प्रश्न? विचारा!_`
    );
}

export function resp_tips(l: Lang): string {
    return lbl(l,
        `🌱 **Agricultural Market Tips:**\n\n**🌾 Wheat (Rabi)**\n• Best buying: March–April (post-harvest)\n• Prices lowest right after harvest\n\n**🧅 Onions**\n• Season: Nov–Jan (Kharif), May–Jul (Rabi)\n• Buy in bulk after monsoon\n\n**🍅 Tomatoes**\n• Prices drop in winter (Nov–Feb)\n• Peak prices in summer\n\n**💡 General Tips:**\n• Buy from verified sellers\n• Bulk buying saves ₹2–5/kg\n• Always compare prices first!`,

        `🌱 **कृषि बाजार टिप्स:**\n\n**🌾 गेहूं (रबी)**\n• खरीदने का सबसे अच्छा समय: मार्च–अप्रैल\n• कटाई के बाद दाम सबसे कम होते हैं\n\n**🧅 प्याज**\n• मौसम: नवंबर–जनवरी (खरीफ), मई–जुलाई (रबी)\n• मानसून के बाद थोक में खरीदें\n\n**🍅 टमाटर**\n• सर्दियों में दाम गिरते हैं (नवंबर–फरवरी)\n• गर्मियों में दाम ज्यादा होते हैं\n\n**💡 सामान्य टिप्स:**\n• सत्यापित विक्रेताओं से खरीदें\n• थोक खरीद से ₹2–5/किग्रा बचत\n• हमेशा दाम की तुलना करें!`,

        `🌱 **कृषी बाजार टिप्स:**\n\n**🌾 गहू (रबी)**\n• खरेदीचा सर्वोत्तम वेळ: मार्च–एप्रिल\n• कापणीनंतर भाव सर्वात कमी असतात\n\n**🧅 कांदा**\n• हंगाम: नोव्हेंबर–जानेवारी (खरीफ), मे–जुलै (रबी)\n• पावसाळ्यानंतर घाऊक खरेदी करा\n\n**🍅 टोमॅटो**\n• हिवाळ्यात भाव कमी होतात (नोव्हेंबर–फेब्रुवारी)\n• उन्हाळ्यात भाव जास्त असतात\n\n**💡 सामान्य टिप्स:**\n• प्रमाणित विक्रेत्यांकडून खरेदी करा\n• घाऊक खरेदीने ₹2–5/किलो बचत\n• नेहमी भाव तुलना करा!`
    );
}
