import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users/profile`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData) => {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile']);
            toast.success('Profile updated successfully!');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};
