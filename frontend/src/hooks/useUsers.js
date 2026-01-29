import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:5000/api';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        }
    });
};
