import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Mock Banners Data for now if API not ready, or use local storage logic if that was the plan.
// Previous implementation used localStorage 'farmlyf_banners'.
// We can use a query that reads from localStorage for now to mimic "Server/Persisted" state,
// or better, use a Zustand store if it's purely client-side admin demo.
// However, the prompt asked for "Products -> React Query", implies data fetching.
// I will assume Banners are data.

const API_URL = 'http://localhost:5000/api';

const defaultBanners = [
    {
        id: 1,
        title: "Kashmiri Walnuts",
        subtitle: "Direct from the orchards of Pahalgam, 100% natural and generic.",
        image: "https://images.unsplash.com/photo-1574545488652-2a97d6aaa1c2?auto=format&fit=crop&q=80&w=1600",
        badgeText: "PREMIUM HARVEST",
        section: "hero"
    },
    {
        id: 2,
        title: "Winter Superfoods",
        subtitle: "Boost your immunity with our curated mix of nuts, seeds, and berries.",
        image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=1600",
        badgeText: "SEASONAL SPECIAL",
        section: "hero"
    },
     {
        id: 3,
        title: "Gift of Health",
        subtitle: "Premium dry fruit gift boxes for your loved ones.",
        image: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=800&q=80",
        badgeText: "GIFTING",
        section: "promo"
    }
];

export const useBanners = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
             // Mimic fetch
             // const res = await fetch(`${API_URL}/banners`);
             // return res.json();
             
             // Returning local storage or default for now to keep app working
             const stored = localStorage.getItem('farmlyf_banners');
             return stored ? JSON.parse(stored) : defaultBanners;
        },
        initialData: defaultBanners
    });
};

// Helper hook to filter locally
export const useBannersBySection = (section) => {
    const { data: banners } = useBanners();
    return banners.filter(b => b.section === section);
};
