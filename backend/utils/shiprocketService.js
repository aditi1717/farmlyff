import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if Shiprocket credentials are configured
   */
  isConfigured() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

    // Check if credentials exist and are not placeholders
    return email && 
           password && 
           pickupLocation &&
           !email.includes('your_') &&
           !password.includes('your_') &&
           !pickupLocation.includes('your_');
  }

  /**
   * Authenticate with Shiprocket and get JWT token
   * Token is valid for 10 days (240 hours)
   */
  async authenticate() {
    // Check if Shiprocket is configured
    if (!this.isConfigured()) {
      throw new Error('Shiprocket credentials not configured. Please update .env file.');
    }

    try {
      // Check if we have a valid token
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      this.token = response.data.token;
      // Set expiry to 9 days to refresh before actual expiry
      this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);

      return this.token;
    } catch (error) {
      console.error('Shiprocket Authentication Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  /**
   * Get headers with authentication token
   */
  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Create order in Shiprocket
   * @param {Object} orderData - Order details from our database
   * @returns {Object} Shiprocket order response
   */
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders();

      // Transform our order data to Shiprocket format
      const shiprocketOrder = {
        order_id: orderData.id,
        order_date: new Date(orderData.date).toISOString().split('T')[0], // yyyy-mm-dd
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
        channel_id: '', // Will use default custom channel
        comment: `Order from ${orderData.paymentMethod.toUpperCase()}`,
        billing_customer_name: orderData.shippingAddress.fullName,
        billing_last_name: '',
        billing_address: orderData.shippingAddress.address,
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.pincode,
        billing_state: orderData.shippingAddress.state,
        billing_country: 'India',
        billing_email: orderData.userEmail || 'customer@farmlyf.com',
        billing_phone: orderData.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.id,
          units: item.qty,
          selling_price: item.price,
          discount: 0,
        })),
        payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: orderData.amount,
        length: 10, // Default dimensions in cm
        breadth: 10,
        height: 10,
        weight: 0.5, // Default weight in kg
      };

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
        shiprocketOrder,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create order in Shiprocket');
    }
  }

  /**
   * Assign AWB (Air Waybill) number to order
   * @param {Number} shipmentId - Shiprocket shipment ID
   * @param {Number} courierId - Optional courier company ID
   * @returns {Object} AWB assignment response
   */
  async assignAWB(shipmentId, courierId = null) {
    try {
      const headers = await this.getHeaders();

      const payload = {
        shipment_id: shipmentId,
      };

      if (courierId) {
        payload.courier_id = courierId;
      }

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
        payload,
        { headers }
      );

      // Log the full response for debugging
      console.log('Shiprocket AWB Response:', JSON.stringify(response.data, null, 2));

      // Log successful AWB assignment
      if (response.data?.response?.data?.awb_code) {
        console.log(`AWB assigned for shipment ${shipmentId}: ${response.data.response.data.awb_code}`);
      }

      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error('Shiprocket AWB Assignment Error:', errorDetails);
      throw new Error(errorDetails?.message || 'Failed to assign AWB');
    }
  }

  /**
   * Generate pickup request for shipment
   * @param {Number} shipmentId - Shiprocket shipment ID
   * @returns {Object} Pickup generation response
   */
  async generatePickup(shipmentId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
        { shipment_id: shipmentId },
        { headers }
      );

      // Log successful pickup generation
      if (response.data) {
        console.log(`Pickup generated for shipment ${shipmentId}`);
      }

      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error('Shiprocket Pickup Generation Error:', errorDetails);
      throw new Error(errorDetails?.message || 'Failed to generate pickup');
    }
  }

  /**
   * Track shipment by AWB code
   * @param {String} awbCode - AWB tracking number
   * @returns {Object} Tracking details
   */
  async trackShipment(awbCode) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Get tracking details by Shiprocket order ID
   * @param {Number} orderId - Shiprocket order ID
   * @returns {Object} Tracking details
   */
  async trackByOrderId(orderId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/shipment/${orderId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Cancel order in Shiprocket
   * @param {Number} shiprocketOrderId - Shiprocket order ID
   * @returns {Object} Cancellation response
   */
  async cancelOrder(shiprocketOrderId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/cancel`,
        { ids: [shiprocketOrderId] },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Order Cancellation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to cancel order in Shiprocket');
    }
  }

  /**
   * Create a return order in Shiprocket for reverse pickup
   * @param {Object} returnData - Return request details
   * @param {Object} originalOrder - Original order with shipping address
   * @returns {Object} Shiprocket return order response
   */
  async createReturnOrder(returnData, originalOrder) {
    try {
      const headers = await this.getHeaders();

      // Transform to Shiprocket return order format
      const shiprocketReturnOrder = {
        order_id: returnData.id, // Our return ID
        order_date: new Date(returnData.requestDate || Date.now()).toISOString().split('T')[0],
        channel_id: '',
        pickup_customer_name: originalOrder.shippingAddress?.fullName || originalOrder.userName,
        pickup_last_name: '',
        pickup_address: originalOrder.shippingAddress?.address,
        pickup_city: originalOrder.shippingAddress?.city,
        pickup_state: originalOrder.shippingAddress?.state,
        pickup_country: 'India',
        pickup_pincode: originalOrder.shippingAddress?.pincode,
        pickup_email: originalOrder.userEmail || 'customer@farmlyf.com',
        pickup_phone: originalOrder.shippingAddress?.phone,
        pickup_isd_code: '91',
        shipping_customer_name: process.env.SHIPROCKET_SELLER_NAME || 'FarmlyF',
        shipping_last_name: '',
        shipping_address: process.env.SHIPROCKET_SELLER_ADDRESS || 'Warehouse Address',
        shipping_city: process.env.SHIPROCKET_SELLER_CITY || 'Mumbai',
        shipping_state: process.env.SHIPROCKET_SELLER_STATE || 'Maharashtra',
        shipping_country: 'India',
        shipping_pincode: process.env.SHIPROCKET_SELLER_PINCODE || '400001',
        shipping_email: process.env.SHIPROCKET_SELLER_EMAIL || 'returns@farmlyf.com',
        shipping_phone: process.env.SHIPROCKET_SELLER_PHONE || '9999999999',
        order_items: returnData.items.map(item => ({
          name: item.name,
          sku: item.id || item.productId,
          units: item.qty,
          selling_price: item.price,
          discount: 0,
          qc_enable: true, // Enable quality check for returns
        })),
        payment_method: 'Prepaid', // Returns are always prepaid
        sub_total: returnData.refundAmount || returnData.items.reduce((sum, i) => sum + (i.price * i.qty), 0),
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      };

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/return`,
        shiprocketReturnOrder,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Return Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create return order in Shiprocket');
    }
  }
}

// Export singleton instance
export default new ShiprocketService();
