const Product = require('../models/Product');
const Brand = require('../models/Brand');

const handleAssistantChat = async (userMessage, history = []) => {
  const query = userMessage.toLowerCase();
  
  // Search products in MongoDB matching user query
  let matchedProducts = [];
  try {
    matchedProducts = await Product.find({
      status: 'PUBLISHED',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { oemPartNumber: { $regex: query, $options: 'i' } },
        { alternatePartNumbers: { $regex: query, $options: 'i' } },
        { 'fitments.make': { $regex: query, $options: 'i' } },
        { 'fitments.model': { $regex: query, $options: 'i' } }
      ]
    }).limit(4).select('name sku oemPartNumber pricing images condition dimensions');
  } catch (err) {
    console.error('Chat AI query error:', err.message);
  }

  let replyText = '';
  let recommendations = [];

  if (matchedProducts.length > 0) {
    replyText = `I found ${matchedProducts.length} matching heavy truck parts for your query: "${userMessage}". Here are the top matches from our catalog with current availability:`;
    recommendations = matchedProducts.map(p => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      oem: p.oemPartNumber,
      price: p.pricing.sellingPrice,
      image: p.images?.[0]?.url || '',
      condition: p.condition
    }));
  } else if (query.includes('vin') || query.includes('chassis')) {
    replyText = `For exact VIN / Chassis part verification, you can submit an online RFQ with your 17-digit VIN number or contact our heavy parts desk directly. Our specialists will cross-reference the OEM parts catalog to ensure 100% fitment.`;
  } else if (query.includes('freight') || query.includes('shipping') || query.includes('pallet')) {
    replyText = `We ship nationwide using specialized heavy road freight (Toll, TNT, Northline). Standard orders over $500 (under 25kg) qualify for free freight. Heavy palletized engines/axles include tail-lift delivery options.`;
  } else if (query.includes('warranty') || query.includes('guarantee')) {
    replyText = `All our commercial truck parts are covered by a minimum 12-Month / 100,000 km manufacturer warranty against manufacturing defects.`;
  } else {
    replyText = `Welcome to Aurex Truck Parts Support! I can help you find OEM replacement parts by Truck Make (Kenworth, Mack, Volvo, Scania, Freightliner, Isuzu), Part SKU, OEM Number, or cross-reference. How can I assist your fleet today?`;
  }

  return {
    reply: replyText,
    products: recommendations
  };
};

module.exports = {
  handleAssistantChat
};
