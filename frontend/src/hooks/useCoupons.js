import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:5000/api';

export const useCoupons = () => {
    return useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/coupons`);
            if(!res.ok) throw new Error('Failed');
            return res.json();
        }
    });
};

export const useActiveCoupons = () => {
    const { data: coupons } = useCoupons();
    if (!coupons) return [];
    
    const now = new Date();
    return coupons.filter(c => 
        c.active && 
        new Date(c.validUntil) > now && 
        (!c.usageLimit || c.usageCount < c.usageLimit)
    );
};
