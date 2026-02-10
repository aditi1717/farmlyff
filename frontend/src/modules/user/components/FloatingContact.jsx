import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const FloatingContact = () => {
    const phoneNumber = "919000000000"; // Replace with actual number
    const message = "Hi FarmLyf, I have a query about your products!";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        heightCm: '',
        weightKg: '',
        activity: 'moderate',
        goal: 'maintain',
        diet: 'balanced',
        allergies: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        if (!API_URL) return;
        let active = true;
        fetch(`${API_URL}/products`)
            .then((res) => res.json())
            .then((data) => {
                if (!active) return;
                if (Array.isArray(data)) {
                    setProducts(data.slice(0, 60));
                } else if (Array.isArray(data?.products)) {
                    setProducts(data.products.slice(0, 60));
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, [isOpen, API_URL]);

    const bmi = useMemo(() => {
        const h = Number(form.heightCm);
        const w = Number(form.weightKg);
        if (!h || !w) return null;
        const m = h / 100;
        return Number((w / (m * m)).toFixed(1));
    }, [form.heightCm, form.weightKg]);

    const bmiCategory = useMemo(() => {
        if (bmi === null) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Healthy';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }, [bmi]);

    const pushMessage = (role, text) => {
        setMessages((prev) => [...prev, { role, text }]);
    };

    const resetChat = () => {
        setStep(0);
        setMessages([]);
        setChatInput('');
        setRecommendations([]);
        setForm((prev) => ({
            ...prev,
            age: '',
            heightCm: '',
            weightKg: '',
            activity: 'moderate',
            goal: 'maintain',
            diet: 'balanced',
            allergies: ''
        }));
    };

    const buildPrompt = () => {
        const summary = {
            name: form.name,
            age: form.age,
            gender: form.gender,
            heightCm: form.heightCm,
            weightKg: form.weightKg,
            bmi,
            bmiCategory,
            activity: form.activity,
            goal: form.goal,
            diet: form.diet,
            allergies: form.allergies
        };

        const productList = products.map((p) => ({
            id: p._id || p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory,
            tag: p.tag,
            price: p.price || p?.variants?.[0]?.price,
            slug: p.slug,
            image: p.image || p?.images?.[0] || p?.seoImage
        }));

        return `You are a nutrition assistant for Farmlyf (dry fruits and healthy foods).
User profile: ${JSON.stringify(summary)}
Available products: ${JSON.stringify(productList)}

Task:
1) Explain BMI status in 1-2 sentences.
2) Recommend 3-5 products from the list, with short reasons (max 1 line each).
3) If allergies are listed, avoid those ingredients.
4) Return JSON with keys: bmiSummary, recommendations (array of {name, reason, slug, image}).`;
    };

    const runGemini = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            pushMessage('assistant', 'Set `VITE_GEMINI_API_KEY` in frontend `.env` to enable AI suggestions.');
            return '';
        }
        const prompt = buildPrompt();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 600
                }
            })
        });
        if (!res.ok) throw new Error('Gemini API failed');
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
    };

    const fallbackRecommendations = () => {
        const list = products.slice(0, 6).map((p) => ({
            name: p.name,
            reason: 'Nutrient-dense and wholesome.',
            slug: p.slug,
            image: p.image || p?.images?.[0] || p?.seoImage
        }));
        return {
            bmiSummary: bmi ? `Your BMI is ${bmi} (${bmiCategory}).` : 'Your BMI is not available.',
            recommendations: list
        };
    };

    const enrichRecommendations = (list) => {
        return (list || []).map((r) => {
            const match = r.slug ? products.find((p) => p.slug === r.slug) : products.find((p) => p.name === r.name);
            const image = r.image || match?.image || match?.images?.[0] || match?.seoImage || '';
            return { ...r, image };
        });
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const raw = await runGemini();
            let parsed = null;
            if (raw) {
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    const jsonMatch = raw.match(/\{[\s\S]*\}/);
                    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
                }
            }
            const final = parsed || fallbackRecommendations();
            const enriched = enrichRecommendations(final.recommendations);
            const reply = [
                final.bmiSummary || `Your BMI is ${bmi} (${bmiCategory}).`,
                'Recommended products:',
                ...(enriched || []).map((r) => `- ${r.name} - ${r.reason}`)
            ].join('\n');
            pushMessage('assistant', reply);
            setRecommendations(enriched || []);
            setStep(10);
        } catch (err) {
            const final = fallbackRecommendations();
            const enriched = enrichRecommendations(final.recommendations);
            const reply = [
                final.bmiSummary || `Your BMI is ${bmi} (${bmiCategory}).`,
                'Recommended products:',
                ...(enriched || []).map((r) => `- ${r.name} - ${r.reason}`)
            ].join('\n');
            pushMessage('assistant', reply);
            setRecommendations(enriched || []);
            setStep(10);
        } finally {
            setLoading(false);
        }
    };

    const normalizeGender = (input) => {
        const g = (input || '').toLowerCase();
        if (g.includes('f')) return 'female';
        if (g.includes('o')) return 'other';
        return 'male';
    };

    const askForStep = (nextStep) => {
        setStep(nextStep);
        switch (nextStep) {
            case 1:
                pushMessage('assistant', 'What is your name?');
                break;
            case 2:
                pushMessage('assistant', `Hii ${form.name || 'there'}, welcome to Farmlyf! What is your gender? (male/female/other)`);
                break;
            case 3:
                pushMessage('assistant', 'How old are you?');
                break;
            case 4:
                pushMessage('assistant', 'Your height in cm?');
                break;
            case 5:
                pushMessage('assistant', 'Your weight in kg?');
                break;
            case 6:
                pushMessage('assistant', 'Activity level? (low/moderate/high)');
                break;
            case 7:
                pushMessage('assistant', 'Goal? (lose/maintain/gain)');
                break;
            case 8:
                pushMessage('assistant', 'Any allergies? (e.g. peanuts, none)');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        if (messages.length > 0) return;
        if (!user) {
            pushMessage('assistant', 'Please sign in to use Farmlyf Assistant.');
            setStep(99);
            return;
        }
        const name = user?.name || '';
        const gender = user?.gender || '';
        setForm((prev) => ({
            ...prev,
            name,
            gender
        }));

        if (!name) {
            askForStep(1);
            return;
        }
        pushMessage('assistant', `Hii ${name}, welcome to Farmlyf!`);
        if (!gender) {
            askForStep(2);
            return;
        }
        askForStep(3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user]);

    useEffect(() => {
        if (!isOpen) return;
        if (!chatScrollRef.current) return;
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, [messages, isOpen, recommendations]);

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || loading) return;
        const input = chatInput.trim();
        setChatInput('');
        pushMessage('user', input);

        switch (step) {
            case 1:
                setForm((prev) => ({ ...prev, name: input }));
                askForStep(2);
                break;
            case 2:
                setForm((prev) => ({ ...prev, gender: normalizeGender(input) }));
                askForStep(3);
                break;
            case 3:
                setForm((prev) => ({ ...prev, age: input }));
                askForStep(4);
                break;
            case 4:
                setForm((prev) => ({ ...prev, heightCm: input }));
                askForStep(5);
                break;
            case 5:
                setForm((prev) => ({ ...prev, weightKg: input }));
                askForStep(6);
                break;
            case 6: {
                const val = input.toLowerCase();
                const activity = val.includes('low') ? 'low' : val.includes('high') ? 'high' : 'moderate';
                setForm((prev) => ({ ...prev, activity }));
                askForStep(7);
                break;
            }
            case 7: {
                const val = input.toLowerCase();
                const goal = val.includes('lose') ? 'lose' : val.includes('gain') ? 'gain' : 'maintain';
                setForm((prev) => ({ ...prev, goal }));
                askForStep(8);
                break;
            }
            case 8:
                setForm((prev) => ({ ...prev, allergies: input }));
                setStep(9);
                pushMessage('assistant', bmi ? `Thanks! Your BMI is ${bmi} (${bmiCategory}). I am finding products for you...` : 'Thanks! Calculating BMI and finding products...');
                handleGenerate();
                break;
            default:
                break;
        }
    };

    return (
        <div className="fixed bottom-[85px] md:bottom-6 right-4 md:right-6 flex flex-col gap-2 md:gap-3 z-[9999]">
            {/* Chat Icon - Nutraj Style */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="w-10 h-10 md:w-12 md:h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group"
                title="Chat with us"
            >
                <div className="bg-white/20 p-1.5 md:p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" fill="white" />
                </div>
            </button>

            {/* WhatsApp Icon */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 md:w-12 md:h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                title="WhatsApp us"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="w-[22px] h-[22px] md:w-7 md:h-7"
                    stroke="currentColor"
                    strokeWidth="0"
                    fill="currentColor"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.510-.173-.008-.371-.010-.57-.010-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.200 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.870 9.870 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.860 9.860 0 01-1.510-5.260c.001-5.450 4.436-9.884 9.888-9.884 2.640 0 5.122 1.030 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.450-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.050 0C5.495 0 .160 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.480-8.413Z" />
                </svg>
            </a>

            {/* BMI Assistant Chatbox */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-footerBg text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Farmlyf Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-white/10"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div ref={chatScrollRef} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                                        m.role === 'user'
                                            ? 'bg-footerBg text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                                    }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {recommendations.length > 0 && (
                            <div className="space-y-2">
                                {recommendations.map((rec) => (
                                    <a
                                        key={rec.slug || rec.name}
                                        href={rec.slug ? `/product/${rec.slug}` : '#'}
                                        className="block bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-footerBg hover:border-footerBg transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                {rec.image ? (
                                                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-black truncate">{rec.name}</div>
                                                <div className="text-[10px] text-gray-400 truncate">{rec.reason}</div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleUserSubmit} className="border-t border-gray-100 p-3 flex gap-2 items-center">
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={loading ? 'Analyzing...' : 'Type your reply...'}
                            disabled={loading || step >= 9 || !user}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                        <button
                            type="submit"
                            disabled={loading || !chatInput.trim() || step >= 9 || !user}
                            className="w-9 h-9 bg-footerBg text-white rounded-xl flex items-center justify-center disabled:opacity-60"
                            aria-label="Send"
                        >
                            <Send size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={resetChat}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-footerBg"
                        >
                            Reset
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingContact;
