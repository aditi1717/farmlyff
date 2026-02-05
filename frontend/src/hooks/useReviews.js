import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

// Admin Reviews (Control List)
export const useAdminReviews = () => {
    return useQuery({
        queryKey: ['admin-reviews'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/reviews/admin`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch admin reviews');
            return res.json();
        }
    });
};

// User Reviews (Pure user-submitted reviews)
export const useUserReviews = () => {
    return useQuery({
        queryKey: ['user-reviews'],
        queryFn: async () => {
            // Assuming endpoint for all reviews filtered by role or similar if needed
            // For now, using same as admin but filtered or a specific "user" endpoint if available
            const res = await fetch(`${API_URL}/reviews`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch user reviews');
            return res.json();
        }
    });
};

export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await fetch(`${API_URL}/reviews/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Status updated');
        }
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete review');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Review deleted');
        }
    });
};
export const useAddAdminReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(`${API_URL}/reviews/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to add admin review');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Admin review added successfully');
        }
    });
};
