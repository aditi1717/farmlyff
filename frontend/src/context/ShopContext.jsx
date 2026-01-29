import { createContext, useContext, useState, useEffect } from 'react';
import { PACKS, SKUS, PRODUCTS, COUPONS } from '../mockData/data';
import bannerMix from '../assets/banner_mix.jpg';
import authShowcase from '../assets/auth_showcase.jpg';
import toast from 'react-hot-toast';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [packs, setPacks] = useState(PACKS);
    const [products, setProducts] = useState(PRODUCTS);
    const [skus, setSkus] = useState(SKUS);
    const [cart, setCart] = useState({}); // { userId: [{ packId/variantId, qty }] }
    const [wishlist, setWishlist] = useState({}); // { userId: [packId/productId] }
    const [orders, setOrders] = useState({}); // { userId: [orderObj] }
    const [returns, setReturns] = useState({}); // { userId: [returnObj] }
    const [recentlyViewed, setRecentlyViewed] = useState({}); // { userId: [product_id] }
    const [saveForLater, setSaveForLater] = useState({}); // { userId: [{ packId, qty }] }
    const [categories, setCategories] = useState([]); // Parent Categories
    const [subCategories, setSubCategories] = useState([]); // Child SubCategories
    const [coupons, setCoupons] = useState([]); // Coupons State

    const fetchCategories = async () => {
        try {
            const catRes = await fetch('http://localhost:5000/api/categories');
            const catData = await catRes.json();
            if (Array.isArray(catData)) {
                setCategories(catData);
            } else {
                console.error("Categories fetch returned non-array:", catData);
                setCategories([]);
            }
            
            const subRes = await fetch('http://localhost:5000/api/subcategories');
            const subData = await subRes.json();
            if (Array.isArray(subData)) {
                setSubCategories(subData);
            } else {
                console.error("SubCategories fetch returned non-array:", subData);
                setSubCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        // Load initial data
        const storedCart = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        const storedWishlist = JSON.parse(localStorage.getItem('farmlyf_wishlist')) || {};
        
        // Load from API
        const fetchData = async () => {
            try {
                // Fetch Products
                const productRes = await fetch('http://localhost:5000/api/products');
                const productsData = await productRes.json();
                setProducts(productsData.length > 0 ? productsData : PRODUCTS);

                // Fetch Users
                const userRes = await fetch('http://localhost:5000/api/users');
                const usersData = await userRes.json();
                
                // Fetch Orders
                const orderRes = await fetch('http://localhost:5000/api/orders');
                const ordersData = await orderRes.json();

                // Group Orders by User ID
                const ordersMap = {};
                ordersData.forEach(order => {
                    if (!ordersMap[order.userId]) ordersMap[order.userId] = [];
                    ordersMap[order.userId].push(order);
                });
                setOrders(ordersMap);

                // Fetch Returns
                const returnRes = await fetch('http://localhost:5000/api/returns');
                const returnsData = await returnRes.json();

                // Group Returns by User ID
                const returnsMap = {};
                returnsData.forEach(ret => {
                    if (!returnsMap[ret.userId]) returnsMap[ret.userId] = [];
                    returnsMap[ret.userId].push(ret);
                });
                setReturns(returnsMap);

                // Fetch Categories
                await fetchCategories();
                
                // Fetch Coupons
                const couponRes = await fetch('http://localhost:5000/api/coupons');
                const couponData = await couponRes.json();
                if (Array.isArray(couponData)) setCoupons(couponData);

            } catch (error) {
                console.error("Failed to fetch data from backend", error);
                // Fallback to local storage or mocks if backend fails
                setProducts(PRODUCTS);
                setOrders(JSON.parse(localStorage.getItem('farmlyf_orders')) || {});
            }
        };

        fetchData();

        setCart(storedCart);
        setWishlist(storedWishlist);

        // Always sync product catalog from code to localStorage to ensure latest data
        setPacks(PACKS);
        // setProducts(PRODUCTS); // Now set by fetch
        localStorage.setItem('farmlyf_packs', JSON.stringify(PACKS));
        
        setSkus(SKUS);
        localStorage.setItem('farmlyf_skus', JSON.stringify(SKUS));
    }, []);

    // --- Product/SKU Helpers ---
    const getProductById = (id) => products.find(p => p.id === id);

    const addProduct = (product) => {
        const newProducts = [product, ...products];
        setProducts(newProducts);
        localStorage.setItem('farmlyf_products', JSON.stringify(newProducts));
    };

    const updateProduct = (id, updatedProduct) => {
        const newProducts = products.map(p => p.id === id ? updatedProduct : p);
        setProducts(newProducts);
        localStorage.setItem('farmlyf_products', JSON.stringify(newProducts));
    };

    const deleteProduct = (id) => {
        const newProducts = products.filter(p => p.id !== id);
        setProducts(newProducts);
        localStorage.setItem('farmlyf_products', JSON.stringify(newProducts));
    };

    const getVariantById = (variantId) => {
        for (const product of products) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) return { ...variant, product };
        }
        return null;
    };

    // Backward compatibility for PACKS-based components
    const getPackById = (id) => packs.find(p => p.id === id) || getVariantById(id);

    const deletePack = (id) => {
        const newPacks = packs.filter(p => p.id !== id);
        setPacks(newPacks);
        localStorage.setItem('farmlyf_packs', JSON.stringify(newPacks));
    };

    // --- Delivery Simulation (for Demo) ---
    const simulateDeliveryProgress = (allOrders) => {
        let hasUpdates = false;
        const now = new Date();

        Object.keys(allOrders).forEach(userId => {
            allOrders[userId] = allOrders[userId].map(order => {
                const orderDate = new Date(order.date);
                const secondsSinceOrder = (now - orderDate) / 1000;

                let newStatus = order.deliveryStatus || 'Processing';
                let updatedHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];

                if (updatedHistory.length === 0) {
                    updatedHistory.push({
                        status: 'Processing',
                        timestamp: order.date,
                        info: 'Order placed'
                    });
                }

                const stages = [
                    { status: 'Processing', timeInfo: 'Order placed' },
                    { status: 'Packed', threshold: 10, timeInfo: 'Packed at warehouse' },
                    { status: 'Shipped', threshold: 20, timeInfo: 'Shipped via FarmLyf Express' },
                    { status: 'Out for Delivery', threshold: 30, timeInfo: 'Out for delivery' },
                    { status: 'Delivered', threshold: 40, timeInfo: 'Delivered' }
                ];

                stages.forEach(stage => {
                    if (stage.threshold && secondsSinceOrder >= stage.threshold &&
                        !updatedHistory.some(h => h.status === stage.status)) {

                        newStatus = stage.status;
                        updatedHistory.push({
                            status: stage.status,
                            timestamp: new Date(orderDate.getTime() + stage.threshold * 1000).toISOString(),
                            info: stage.timeInfo
                        });
                        hasUpdates = true;
                    }
                });

                if (newStatus === 'Delivered' && !order.deliveredDate) {
                    const delStage = updatedHistory.find(h => h.status === 'Delivered');
                    if (delStage) order.deliveredDate = delStage.timestamp;
                }

                return { ...order, deliveryStatus: newStatus, statusHistory: updatedHistory, status: newStatus };
            });
        });

        if (hasUpdates) {
            localStorage.setItem('farmlyf_orders', JSON.stringify(allOrders));
            setOrders({ ...allOrders });
        }
    };

    const simulateReturnProgress = (allReturns) => {
        let hasUpdates = false;
        const now = new Date();

        Object.keys(allReturns).forEach(userId => {
            allReturns[userId] = allReturns[userId].map(ret => {
                if (ret.status === 'Rejected') return ret;

                const requestDate = new Date(ret.requestDate);
                const secondsSinceRequest = (now - requestDate) / 1000;

                let newStatus = ret.status;
                let updatedHistory = [...ret.statusHistory];

                const refundStages = [
                    { status: 'Approved', threshold: 5, info: 'Return request approved by quality team' },
                    { status: 'Picked Up', threshold: 10, info: 'Item picked up by courier partner' },
                    { status: 'Refunded', threshold: 15, info: 'Refund processed to original payment method' }
                ];

                const replacementStages = [
                    { status: 'Approved', threshold: 5, info: 'Replacement request approved by quality team' },
                    { status: 'Picked Up', threshold: 10, info: 'Item picked up by courier partner' },
                    { status: 'Quality Check', threshold: 15, info: 'Verifying returned item condition' },
                    { status: 'Dispatched', threshold: 20, info: 'Replacement order dispatched' },
                    { status: 'Delivered', threshold: 25, info: 'Replacement order delivered' }
                ];

                const stages = ret.type === 'replace' ? replacementStages : refundStages;

                stages.forEach(stage => {
                    if (secondsSinceRequest >= stage.threshold && !updatedHistory.some(h => h.status === stage.status)) {
                        newStatus = stage.status;
                        updatedHistory.push({
                            status: stage.status,
                            timestamp: new Date(requestDate.getTime() + stage.threshold * 1000).toISOString(),
                            info: stage.info
                        });
                        hasUpdates = true;
                    }
                });

                return { ...ret, status: newStatus, statusHistory: updatedHistory };
            });
        });

        if (hasUpdates) {
            localStorage.setItem('farmlyf_returns', JSON.stringify(allReturns));
            setReturns({ ...allReturns });
        }
    };

    // --- Order Actions ---
    const placeOrder = (userId, orderData, shouldClearCart = true) => {
        const allOrders = JSON.parse(localStorage.getItem('farmlyf_orders')) || {};
        const userOrders = allOrders[userId] || [];

        const orderDate = new Date();
        const estimatedDeliveryDate = new Date(orderDate);
        estimatedDeliveryDate.setDate(orderDate.getDate() + 3);

        const newOrder = {
            id: 'ORD-' + Date.now() + Math.floor(Math.random() * 1000),
            date: orderDate.toISOString(),
            status: 'Processing',
            trackingId: 'TRK-FML-' + Math.floor(Math.random() * 1000000000),
            deliveryStatus: 'Processing',
            statusHistory: [{
                status: 'Processing',
                timestamp: orderDate.toISOString(),
                info: 'Order placed'
            }],
            estimatedDelivery: estimatedDeliveryDate.toISOString(),
            deliveredDate: null,
            courierPartner: 'FarmLyf Express',
            ...orderData
        };

        userOrders.unshift(newOrder);
        allOrders[userId] = userOrders;

        localStorage.setItem('farmlyf_orders', JSON.stringify(allOrders));
        setOrders({ ...allOrders });
        if (shouldClearCart) clearCart(userId);

        return newOrder.id;
    };

    const getOrders = (userId) => {
        const allOrders = JSON.parse(localStorage.getItem('farmlyf_orders')) || {};
        simulateDeliveryProgress(allOrders);
        return allOrders[userId] || [];
    };

    const getOrderById = (userId, orderId) => {
        const userOrders = getOrders(userId);
        return userOrders.find(o => o.id === orderId);
    };

    const updateOrderStatus = (userId, orderId, newStatus, info = '') => {
        const allOrders = JSON.parse(localStorage.getItem('farmlyf_orders')) || {};
        const userOrders = allOrders[userId] || [];
        const orderIndex = userOrders.findIndex(o => o.id === orderId);

        if (orderIndex > -1) {
            const updatedOrder = { ...userOrders[orderIndex] };
            updatedOrder.status = newStatus;
            updatedOrder.deliveryStatus = newStatus;

            const newStatusEntry = {
                status: newStatus,
                timestamp: new Date().toISOString(),
                info: info || `Status updated to ${newStatus}`
            };

            if (updatedOrder.statusHistory.length === 0 ||
                updatedOrder.statusHistory[updatedOrder.statusHistory.length - 1].status !== newStatus) {
                updatedOrder.statusHistory.push(newStatusEntry);
            }

            if (newStatus === 'Delivered' && !updatedOrder.deliveredDate) {
                updatedOrder.deliveredDate = newStatusEntry.timestamp;
            }

            userOrders[orderIndex] = updatedOrder;
            allOrders[userId] = userOrders;

            localStorage.setItem('farmlyf_orders', JSON.stringify(allOrders));
            setOrders({ ...allOrders });
        }
    };

    // --- Return Actions ---
    const createReturnRequest = (userId, returnData) => {
        const allReturns = JSON.parse(localStorage.getItem('farmlyf_returns')) || {};
        const userReturns = allReturns[userId] || [];

        const newReturn = {
            id: 'RET-' + Date.now() + Math.floor(Math.random() * 1000),
            requestDate: new Date().toISOString(),
            status: 'Pending',
            statusHistory: [{
                status: 'Pending',
                timestamp: new Date().toISOString(),
                info: 'Return request received'
            }],
            ...returnData
        };

        userReturns.unshift(newReturn);
        allReturns[userId] = userReturns;

        localStorage.setItem('farmlyf_returns', JSON.stringify(allReturns));
        setReturns({ ...allReturns });

        return newReturn.id;
    };

    const getReturns = (userId) => {
        const allReturns = JSON.parse(localStorage.getItem('farmlyf_returns')) || {};
        simulateReturnProgress(allReturns);
        return allReturns[userId] || [];
    };

    const getReturnById = (userId, returnId) => {
        const userReturns = getReturns(userId);
        return userReturns.find(r => r.id === returnId);
    };

    // --- Cart Actions ---
    const getCart = (userId) => {
        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        return allCarts[userId] || [];
    };

    const addToCart = (userId, packId, qty = 1) => {
        if (!userId) return toast.error("Please login to add to cart");

        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        const userCart = allCarts[userId] || [];

        const existingItemIndex = userCart.findIndex(item => String(item.packId) === String(packId));

        if (existingItemIndex > -1) {
            userCart[existingItemIndex].qty += qty;
        } else {
            userCart.push({ packId, qty });
        }

        allCarts[userId] = userCart;
        localStorage.setItem('farmlyf_cart', JSON.stringify(allCarts));
        setCart({ ...allCarts });

        // Automatically remove from Vault (Save for Later) if it exists
        const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
        let userSaved = allSaved[userId] || [];
        if (userSaved.some(item => String(item.packId) === String(packId))) {
            userSaved = userSaved.filter(item => String(item.packId) !== String(packId));
            allSaved[userId] = userSaved;
            localStorage.setItem('farmlyf_save_for_later', JSON.stringify(allSaved));
            setSaveForLater({ ...allSaved });
        }

        window.dispatchEvent(new Event('storage'));
    };

    const removeFromCart = (userId, packId) => {
        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        let userCart = allCarts[userId] || [];
        userCart = userCart.filter(item => item.packId !== packId);
        allCarts[userId] = userCart;
        localStorage.setItem('farmlyf_cart', JSON.stringify(allCarts));
        setCart({ ...allCarts });
    };

    const updateCartQty = (userId, packId, qty) => {
        if (qty < 1) return removeFromCart(userId, packId);
        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        const userCart = allCarts[userId] || [];
        const item = userCart.find(i => i.packId === packId);
        if (item) {
            item.qty = qty;
            allCarts[userId] = userCart;
            localStorage.setItem('farmlyf_cart', JSON.stringify(allCarts));
            setCart({ ...allCarts });
        }
    };

    const clearCart = (userId) => {
        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        allCarts[userId] = [];
        localStorage.setItem('farmlyf_cart', JSON.stringify(allCarts));
        setCart({ ...allCarts });
    };

    // --- Wishlist Actions ---
    const getWishlist = (userId) => {
        const allWishlists = JSON.parse(localStorage.getItem('farmlyf_wishlist')) || {};
        return allWishlists[userId] || [];
    };

    const toggleWishlist = (userId, packId) => {
        if (!userId) return toast.error("Please login to manage wishlist");
        const allWishlists = JSON.parse(localStorage.getItem('farmlyf_wishlist')) || {};
        let userWishlist = allWishlists[userId] || [];
        if (userWishlist.includes(packId)) {
            userWishlist = userWishlist.filter(id => id !== packId);
        } else {
            userWishlist.push(packId);
        }
        allWishlists[userId] = userWishlist;
        localStorage.setItem('farmlyf_wishlist', JSON.stringify(allWishlists));
        setWishlist({ ...allWishlists });
    };

    const isInWishlist = (userId, packId) => {
        const userWishlist = wishlist[userId] || [];
        return userWishlist.includes(packId);
    };

    // --- Recently Viewed Actions ---
    const addToRecentlyViewed = (userId, productId) => {
        if (!userId) return;
        const allRecentlyViewed = JSON.parse(localStorage.getItem('farmlyf_recently_viewed')) || {};
        let userRecent = allRecentlyViewed[userId] || [];

        // Remove if already exists to move to top
        userRecent = userRecent.filter(id => id !== productId);
        userRecent.unshift(productId);

        // Limit to last 12 items
        userRecent = userRecent.slice(0, 12);

        allRecentlyViewed[userId] = userRecent;
        localStorage.setItem('farmlyf_recently_viewed', JSON.stringify(allRecentlyViewed));
        setRecentlyViewed({ ...allRecentlyViewed });
    };

    const getRecentlyViewed = (userId) => {
        const allRecentlyViewed = JSON.parse(localStorage.getItem('farmlyf_recently_viewed')) || {};
        const productIds = allRecentlyViewed[userId] || [];
        return productIds.map(id => getProductById(id)).filter(Boolean);
    };

    // --- Save for Later Actions ---
    const getSaveForLater = (userId) => {
        const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
        return allSaved[userId] || [];
    };

    const moveToSaveForLater = (userId, packId) => {
        if (!userId) return;
        const allCarts = JSON.parse(localStorage.getItem('farmlyf_cart')) || {};
        let userCart = allCarts[userId] || [];
        const item = userCart.find(i => i.packId === packId);

        if (item) {
            // Remove from cart
            userCart = userCart.filter(i => i.packId !== packId);
            allCarts[userId] = userCart;
            localStorage.setItem('farmlyf_cart', JSON.stringify(allCarts));
            setCart({ ...allCarts });

            // Add to save for later
            const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
            const userSaved = allSaved[userId] || [];
            if (!userSaved.find(i => i.packId === packId)) {
                userSaved.push(item);
                allSaved[userId] = userSaved;
                localStorage.setItem('farmlyf_save_for_later', JSON.stringify(allSaved));
                setSaveForLater({ ...allSaved });
            }
        }
    };

    const moveToCartFromSaved = (userId, packId) => {
        if (!userId) return;
        const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
        let userSaved = allSaved[userId] || [];
        const item = userSaved.find(i => i.packId === packId);

        if (item) {
            // Remove from saved
            userSaved = userSaved.filter(i => i.packId !== packId);
            allSaved[userId] = userSaved;
            localStorage.setItem('farmlyf_save_for_later', JSON.stringify(allSaved));
            setSaveForLater({ ...allSaved });

            // Add back to cart
            addToCart(userId, packId, item.qty);
        }
    };

    const removeFromSaved = (userId, packId) => {
        const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
        let userSaved = allSaved[userId] || [];
        userSaved = userSaved.filter(item => item.packId !== packId);
        allSaved[userId] = userSaved;
        localStorage.setItem('farmlyf_save_for_later', JSON.stringify(allSaved));
        setSaveForLater({ ...allSaved });
    };

    const addToSaved = (userId, packId, qty = 1) => {
        if (!userId) return toast.error("Please login to save items");
        const allSaved = JSON.parse(localStorage.getItem('farmlyf_save_for_later')) || {};
        const userSaved = allSaved[userId] || [];

        if (!userSaved.find(i => String(i.packId) === String(packId))) {
            userSaved.push({ packId, qty });
            allSaved[userId] = userSaved;
            localStorage.setItem('farmlyf_save_for_later', JSON.stringify(allSaved));
            setSaveForLater({ ...allSaved });
        }
    };

    // --- Recommendation Logic ---
    const getRecommendations = (userId, limit = 4) => {
        const recentProducts = getRecentlyViewed(userId);
        const userWishlist = wishlist[userId] || [];

        // Find categories user is interested in
        const interestedCats = new Set();
        recentProducts.forEach(p => interestedCats.add(p.category));
        userWishlist.forEach(id => {
            const pack = getPackById(id);
            if (pack?.product?.category) interestedCats.add(pack.product.category);
        });

        // If no interest, show random popular ones
        if (interestedCats.size === 0) return products.slice(0, limit);

        // Filter products from those categories that user hasn't seen/wishlisted much
        return products
            .filter(p => interestedCats.has(p.category))
            .filter(p => !recentProducts.find(rp => rp.id === p.id))
            .slice(0, limit);
    };

    // --- Banner Management ---
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        // Initialize Banners
        let storedBanners = JSON.parse(localStorage.getItem('farmlyf_banners'));

        // Replacement map for broken Unsplash URLs
        const replacements = {
            'https://images.unsplash.com/photo-1596525737299-db0ebcf199df?auto=format&fit=crop&w=800&q=80': bannerMix,
            'https://images.unsplash.com/photo-1606822361688-467ce880a133?auto=format&fit=crop&w=800&q=80': authShowcase,
            'https://images.unsplash.com/photo-1594051516003-889a744cb89f?auto=format&fit=crop&w=800&q=80': bannerMix,
            'https://images.unsplash.com/photo-1533230408806-3883e580e605?auto=format&fit=crop&w=800&q=80': authShowcase
        };

        const defaultBanners = [
            // Hero Section Defaults
            {
                id: 'hero-1',
                section: 'hero',
                title: 'Sale is Live!',
                subtitle: 'Experience the crunch of health with our Premium Selection.',
                image: bannerMix,
                badgeText: 'Republic Day Special',
                ctaText: 'Shop Collections',
                link: '/collections'
            },
            {
                id: 'hero-2',
                section: 'hero',
                title: 'Organic & Pure',
                subtitle: 'Sourced directly from the best farms in Kashmir.',
                image: authShowcase,
                badgeText: '100% Natural',
                ctaText: 'Explore Now',
                link: '/catalog'
            },
            // Promo Section Defaults
            {
                id: 'promo-1',
                section: 'promo',
                title: 'Premium Kashmiri Walnuts',
                subtitle: '100% natural, hand-cracked for maximum freshness.',
                image: bannerMix,
                badgeText: 'FRESH ARRIVAL',
                ctaText: 'Explore Collection'
            },
            {
                id: 'promo-2',
                section: 'promo',
                title: 'Mammoth Almonds (Badam)',
                subtitle: 'The perfect brain-food for your daily morning routine.',
                image: authShowcase,
                badgeText: 'BESTSELLER',
                ctaText: 'Buy Now'
            }
        ];

        if (storedBanners) {
            // Fix existing broken URLs in localStorage
            let hasFixes = false;
            storedBanners = storedBanners.map((b, index) => {
                // Aggressively fix ANY Unsplash URL
                if (b.image && b.image.includes('unsplash.com')) {
                    hasFixes = true;
                    // Alternate between the two local images
                    const newImage = index % 2 === 0 ? bannerMix : authShowcase;
                    return { ...b, image: newImage };
                }
                return b;
            });

            if (hasFixes) {
                localStorage.setItem('farmlyf_banners', JSON.stringify(storedBanners));
            }
            setBanners(storedBanners);
        } else {
            // Default Banners
            setBanners(defaultBanners);
            localStorage.setItem('farmlyf_banners', JSON.stringify(defaultBanners));
        }
    }, []);

    const addBanner = (bannerData) => {
        const newBanner = {
            id: 'bnr-' + Date.now(),
            ...bannerData
        };
        const updatedBanners = [...banners, newBanner];
        setBanners(updatedBanners);
        localStorage.setItem('farmlyf_banners', JSON.stringify(updatedBanners));
        return newBanner;
    };

    const deleteBanner = (id) => {
        const updatedBanners = banners.filter(b => b.id !== id);
        setBanners(updatedBanners);
        localStorage.setItem('farmlyf_banners', JSON.stringify(updatedBanners));
    };

    const updateBanner = (id, updates) => {
        const updatedBanners = banners.map(b => b.id === id ? { ...b, ...updates } : b);
        setBanners(updatedBanners);
        localStorage.setItem('farmlyf_banners', JSON.stringify(updatedBanners));
    };

    const getBannersBySection = (section) => {
        return banners.filter(b => b.section === section);
    };



    return (
        <ShopContext.Provider value={{
            packs,
            products,
            categories, // Parent Categories
            subCategories, // Child SubCategories
            fetchCategories, // Expose this function
            skus,
            getProductById,
            getVariantById,
            getPackById,
            deletePack,
            getCart,
            addToCart,
            removeFromCart,
            updateCartQty,
            clearCart,
            getWishlist,
            toggleWishlist,
            isInWishlist,
            wishlist,
            cart,
            orders,
            placeOrder,
            getOrders,
            getOrderById,
            updateOrderStatus,
            returns,
            createReturnRequest,
            getReturns,
            getReturnById,
            // Product management
            addProduct,
            updateProduct,
            deleteProduct,

            // Coupon functions
            coupons, 
            fetchCoupons: async () => {
                try {
                    const res = await fetch('http://localhost:5000/api/coupons');
                    const data = await res.json();
                    if(Array.isArray(data)) setCoupons(data);
                } catch (error) {
                    console.error("Failed to fetch coupons", error);
                }
            },
            addCoupon: async (couponData) => {
                try {
                    const res = await fetch('http://localhost:5000/api/coupons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(couponData)
                    });
                    if (res.ok) {
                        const newCoupon = await res.json();
                        setCoupons(prev => [newCoupon, ...prev]);
                        return { success: true };
                    } else {
                        const err = await res.json();
                        return { success: false, error: err.message };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            updateCoupon: async (id, updates) => {
                try {
                    const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        setCoupons(prev => prev.map(c => (c.id === id || c._id === id) ? updated : c));
                        return { success: true };
                    } else {
                        return { success: false, error: 'Update failed' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            deleteCoupon: async (id) => {
                try {
                    const res = await fetch(`http://localhost:5000/api/coupons/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        setCoupons(prev => prev.filter(c => c.id !== id && c._id !== id));
                        return { success: true };
                    }
                } catch (error) {
                    console.error(error);
                }
                return { success: false };
            },
            getActiveCoupons: () => {
                const now = new Date();
                return coupons.filter(c =>
                    c.active &&
                    new Date(c.validUntil) > now &&
                    (!c.usageLimit || c.usageCount < c.usageLimit)
                );
            },
            validateCoupon: async (userId, code, cartTotal, cartItems = []) => {
                try {
                    const res = await fetch('http://localhost:5000/api/coupons/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, code, cartTotal, cartItems })
                    });
                    const data = await res.json();
                    return data; 
                } catch (error) {
                    return { valid: false, error: 'Validation service unavailable' };
                }
            },

            // Advanced Features
            addToRecentlyViewed,
            getRecentlyViewed,
            saveForLater: getSaveForLater,
            moveToSaveForLater,
            moveToCartFromSaved,
            removeFromSaved,
            addToSaved,
            getRecommendations,
            // Banner Functions
            banners,
            addBanner,
            deleteBanner,
            updateBanner,
            getBannersBySection
        }}>
            {children}
        </ShopContext.Provider>
    );
};
