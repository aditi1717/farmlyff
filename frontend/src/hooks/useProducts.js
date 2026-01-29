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
            const res = await fetch(`${API_URL}/products/${id}`);
            if (!res.ok) throw new Error('Failed to fetch product');
            return res.json();
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
             const res = await fetch(`${API_URL}/products`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify(productData),
             });
             if (!res.ok) {
                 const error = await res.json();
                 throw new Error(error.message || 'Failed to create product');
             }
             return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product added successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update product');
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
            toast.success('Product updated successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete product');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully!');
        },
        onError: (err) => toast.error(err.message)
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Upload failed');
            }
            return res.json();
        },
        onError: (err) => toast.error(`Upload error: ${err.message}`)
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
