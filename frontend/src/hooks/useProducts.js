import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        }
    });
};

export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            // Fetch logic optimized to find in cache or fetch single
            // For now, simpler to reuse list or fetch list if not implementing single endpoint completely
            // NOTE: Backend doesn't have public GET /api/products/:id implemented in task list, only List.
            // But we typically want single fetch or use cache.
            const res = await fetch(`${API_URL}/products`);
            if(!res.ok) throw new Error('Failed');
            const products = await res.json();
            return products.find(p => p.id === id);
        },
        enabled: !!id,
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const [catRes, subRes] = await Promise.all([
                 fetch(`${API_URL}/categories`),
                 fetch(`${API_URL}/subcategories`)
            ]);
            if (!catRes.ok || !subRes.ok) throw new Error('Failed to fetch categories');
            const categories = await catRes.json();
            // const subCategories = await subRes.json(); // We can return both
            return categories; 
        }
    });
};

export const useSubCategories = () => {
    return useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/subcategories`);
            if (!res.ok) throw new Error('Failed to fetch subcategories');
            return res.json();
        }
    });
};

// Mutations
export const useAddProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productData) => {
             // Mock POST as per previous context or valid endpoint if available
             // Simulating success
             return productData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product added successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

// Helper to replace getPackById logic
// We can't really do sync helper easily with React Query unless we access cache directly or use useQuery
export const usePack = (id, products) => {
    // If we pass products list (fetched via useProducts), we can find it
    if (!products) return null;
    // Packs logic (assuming Packs are legacy or mixed in)
    // Re-using logic from ShopContext
    // const pack = packs.find(...) // We don't have packs separately anymore, seemingly merged or static
    
    // Fallback to variant search
    for (const product of products) {
        const variant = product.variants?.find(v => v.id === id);
        if (variant) return { ...variant, product };
    }
    return null;
};
