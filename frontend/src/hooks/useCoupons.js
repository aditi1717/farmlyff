import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const useCoupons = () => {
    return useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/coupons`, { credentials: 'include' });
            if(!res.ok) throw new Error('Failed');
            return res.json();
        }
    });
};

export const useActiveCoupons = () => {
    return useQuery({
        queryKey: ['coupons', 'active'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/coupons`, { credentials: 'include' });
            if(!res.ok) throw new Error('Failed to fetch coupons');
            return res.json();
        },
        select: (coupons) => {
            const now = new Date();
            return coupons.filter(c => 
                c.active && 
                new Date(c.validUntil) > now && 
                (!c.usageLimit || c.usageCount < c.usageLimit)
            );
        }
    });
};
