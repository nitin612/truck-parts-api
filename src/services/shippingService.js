/**
 * Commercial Truck Parts Freight & Carrier Service
 */

const calculateFreightRates = ({ totalWeightKg = 5, postalCode = '2000', hasForklift = true }) => {
  const isHeavyPallet = totalWeightKg > 40;

  const rates = [
    {
      id: 'STANDARD',
      title: 'Standard Commercial Freight (Road Express)',
      carrier: 'Toll Express / TNT',
      estimatedDays: '2-4 Business Days',
      price: Math.max(25, Math.round((20 + (totalWeightKg * 1.5)) * 100) / 100),
      isHeavyPallet: false
    },
    {
      id: 'EXPRESS_COURIER',
      title: 'Urgent Breakdown Freight (Air / Priority Road)',
      carrier: 'StarTrack Express',
      estimatedDays: '1-2 Business Days',
      price: Math.max(45, Math.round((35 + (totalWeightKg * 3.2)) * 100) / 100),
      isHeavyPallet: false
    }
  ];

  if (isHeavyPallet) {
    rates.push({
      id: 'HEAVY_FREIGHT_PALLET',
      title: hasForklift ? 'Heavy Pallet Freight (Forklift Unload)' : 'Heavy Pallet Freight (Tail-Lift Truck Required)',
      carrier: 'Northline / Direct Freight Express',
      estimatedDays: '2-5 Business Days',
      price: hasForklift ? 160 + (totalWeightKg * 0.7) : 220 + (totalWeightKg * 0.7),
      isHeavyPallet: true
    });
  }

  rates.push({
    id: 'DEPOT_PICKUP',
    title: 'Warehouse Counter Pickup (Free)',
    carrier: 'Customer Pickup',
    estimatedDays: 'Ready in 2 Hours',
    price: 0,
    isHeavyPallet: false
  });

  return rates;
};

const trackShipment = (carrier, trackingNumber) => {
  return {
    carrier: carrier || 'Toll Express',
    trackingNumber: trackingNumber || 'N/A',
    status: 'IN_TRANSIT',
    events: [
      { timestamp: new Date(Date.now() - 86400000), location: 'Central Logistics Hub Sydney', description: 'Consignment Collected & Scanned' },
      { timestamp: new Date(Date.now() - 43200000), location: 'En Route Distribution Hub', description: 'In Transit to Regional Depot' },
      { timestamp: new Date(), location: 'Local Transport Depot', description: 'Sorted for Next Run' }
    ]
  };
};

module.exports = {
  calculateFreightRates,
  trackShipment
};
