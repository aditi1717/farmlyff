import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export const useReturns = () => {
    return useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/returns`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch returns');
            return res.json();
        }
    });
};

export const useReturn = (id) => {
    return useQuery({
        queryKey: ['return', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/returns/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch return details');
            return res.json();
        },
        enabled: !!id
    });
};

export const useCreateReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (returnData) => {
            const res = await fetch(`${API_URL}/returns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(returnData),
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create return request');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            toast.success('Return request submitted successfully');
        },
        onError: (err) => toast.error(err.message)
    });
};
