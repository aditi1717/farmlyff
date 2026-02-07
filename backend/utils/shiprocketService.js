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

      return response.data;
    } catch (error) {
      console.error('Shiprocket AWB Assignment Error:', error.response?.data || error.message);
      throw new Error('Failed to assign AWB');
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

      return response.data;
    } catch (error) {
      console.error('Shiprocket Pickup Generation Error:', error.response?.data || error.message);
      throw new Error('Failed to generate pickup');
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
}

// Export singleton instance
export default new ShiprocketService();
