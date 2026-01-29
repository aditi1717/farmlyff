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
            const res = await fetch(`${API_URL}/banners`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch banners');
            return res.json();
        }
    });
};

export const useAddBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(`${API_URL}/banners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to add banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner added successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useUpdateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner updated successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useDeleteBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete banner');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success('Banner deleted successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

// Helper hook to filter locally
export const useBannersBySection = (section) => {
    const { data: banners = [] } = useBanners();
    return banners.filter(b => (b.section || 'hero') === section && b.isActive !== false);
};
