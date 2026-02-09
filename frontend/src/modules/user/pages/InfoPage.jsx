import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useWebsiteContent } from '../../../hooks/useContent';

const InfoPage = ({ type }) => {
    const { data: pageData, isLoading } = useWebsiteContent(type);

    // Default Fallback Content Config
    const defaultContentMap = {
        'about-us': {
            title: "About FarmLyf",
            subtitle: "Delivering nature's finest to your doorstep",
            content: (
                <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <p>At FarmLyf, we believe in the power of pure, unadulterated nature. Our journey began with a simple mission: to bridge the gap between conscientious farmers and mindful consumers.</p>
                    <p>We source premium dry fruits, nuts, seeds, and organic staples directly from growers who practice sustainable farming. Every product is handpicked, quality-checked, and packed with care to ensure you get nothing but the best.</p>
                </div>
            )
        },
        'privacy-policy': {
            title: "Privacy Policy",
            subtitle: "Your trust is our priority",
            content: (
                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
                    <h3 className="text-xl font-bold text-footerBg mb-2">1. Information Collection</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter.</p>
                </div>
            )
        },
        'contact-us': {
            title: "Contact Us",
            subtitle: "We're here to help",
            content: (
                <div className="max-w-4xl mx-auto space-y-10">
                    <div className="grid md:grid-cols-2 gap-10 items-start">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-footerBg mb-3">Get in Touch</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Have a question about your order, want to partner with us, or simply want to say hello?
                                    We are always ready to help.
                                </p>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-footerBg text-sm">Visit Us</h4>
                                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                            Office No 501, Princess center, 5th Floor,<br />
                                            New Palasia, Indore, Madhya Pradesh 452001
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-footerBg text-sm">Email Us</h4>
                                        <div className="text-gray-500 text-sm mt-1 space-y-0.5">
                                            <p>hello@farmlyf.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-lg font-bold text-footerBg mb-4">Send a Message</h3>
                            <form className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm" placeholder="Name" />
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm" placeholder="Phone" />
                                </div>
                                <input type="email" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm" placeholder="Email Address" />
                                <textarea rows="3" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none text-sm" placeholder="Your Message"></textarea>
                                <button type="button" className="w-full bg-footerBg hover:bg-primary text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-md hover:shadow-lg">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }
    };

    const config = defaultContentMap[type] || defaultContentMap['about-us'];

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const displayTitle = pageData?.title || config.title;
    const displaySubtitle = pageData?.subtitle || config.subtitle;
    // content can be a string (HTML from Quill) or fallback JSX
    const displayContent = pageData?.content ? (
        <div 
            className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed quill-content"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
    ) : config.content;

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 lg:px-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl lg:text-5xl font-black text-footerBg uppercase tracking-tighter mb-2">{displayTitle}</h1>
                    <p className="text-primary font-black tracking-[0.2em] uppercase text-xs">{displaySubtitle}</p>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    {displayContent}
                </div>
            </motion.div>
        </div>
    );
};
export default InfoPage;
