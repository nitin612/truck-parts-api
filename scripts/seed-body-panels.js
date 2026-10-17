const mongoose = require('mongoose');
require('dotenv').config();

const PRODUCTS_DATA = [
  {
    sku: 'ATP-BP-01',
    oem: 'VNFHP432320',
    name: 'FRP Honeycomb Side Panel 4300x2300x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '4300 x 2300 x 20mm (9.89 m²)',
    area: '9.89 m²',
    marketPrice: 1249.00,
    aurexPrice: 1210.00,
    shortDescription: 'Ultra-lightweight high-strength FRP honeycomb composite side wall panel (4300x2300x20mm, 9.89m²). High-gloss UV-stabilised gelcoat face over polypropylene honeycomb core for dry freight pantechs.',
    description: 'Commercial grade FRP (Fiberglass Reinforced Plastic) polypropylene honeycomb side panel engineered specifically for Australian truck and van bodybuilders. Measuring 4300mm long by 2300mm wide at 20mm thickness, this panel provides 9.89m² of seamless surface area. The high-gloss gelcoat exterior delivers superior UV resistance and weather durability against harsh Australian sun, while the non-corrosive thermoplastic honeycomb core delivers significant weight savings over traditional steel or plywood walls without sacrificing torsional rigidity.',
    parameters: 'Dimensions: 4300 x 2300 x 20mm | Area: 9.89m² | Core: Polypropylene Honeycomb (8mm cell) | Facing: 1.5mm - 2.0mm High-Gloss White Woven Roving Gelcoat (RAL 9016) | Density: 80 kg/m³ | Weight: ~7.5 kg/m²',
    technicalSpec: 'Continuous structural sandwich panel offering superior impact damping, high flexural strength, rot-proof and waterproof construction for commercial rigid pantech bodies and dry freight vans.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS 4256.3 & ISO 845 Compliance',
    fit: 'Suits rigid pantechs, dry freight bodies, and delivery trucks up to 4.3m length'
  },
  {
    sku: 'ATP-BP-02',
    oem: 'VNFHP242320',
    name: 'FRP Honeycomb Front Panel 2400x2300x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2400 x 2300 x 20mm (5.52 m²)',
    area: '5.52 m²',
    marketPrice: 699.00,
    aurexPrice: 678.00,
    shortDescription: 'High-strength aerodynamic FRP honeycomb composite front bulkhead panel (2400x2300x20mm, 5.52m²). Seamless gelcoat face with structural PP honeycomb core for commercial truck bodies.',
    description: 'Heavy-duty front bulkhead composite panel for commercial rigid trucks and trailers. Sized at 2400mm width by 2300mm height at 20mm thickness (5.52m²), this structural FRP sandwich panel is designed to withstand front cargo shifting loads and headboard air pressure during high-speed highway haulage. Rot-proof, chemical resistant, and easily bonded to aluminium front corner caps.',
    parameters: 'Dimensions: 2400 x 2300 x 20mm | Area: 5.52m² | Core: Polypropylene Honeycomb | Finish: Gelcoat White (RAL 9016) | Weight: ~41.4 kg | High frontal impact resistance',
    technicalSpec: 'Engineered front bulkhead panel for rigid truck bodies, pantechs and box trailers with high strength-to-weight ratio and seamless clean finish.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS 4256.3 Compliance',
    fit: 'Suits truck front headboards, bulkheads, and van front walls'
  },
  {
    sku: 'ATP-BP-03',
    oem: 'VNFHP241220',
    name: 'FRP Honeycomb Door Panel 2400x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2400 x 1200 x 20mm (2.88 m²)',
    area: '2.88 m²',
    marketPrice: 365.00,
    aurexPrice: 354.00,
    shortDescription: 'Precision-cut lightweight FRP honeycomb door panel (2400x1200x20mm, 2.88m²). Ideal for rear barn doors, side access doors, and service body panels.',
    description: 'Precision manufactured 2400 x 1200 x 20mm FRP honeycomb panel specifically engineered for commercial vehicle rear barn doors and side access portals. Lightweight construction reduces door hinge fatigue and operator lifting strain while maintaining rigid flat alignment against rubber weather seals.',
    parameters: 'Dimensions: 2400 x 1200 x 20mm | Area: 2.88m² | Weight: ~21.6 kg | Core: PP Honeycomb | Double-sided High-Gloss White Gelcoat | Thermal acoustic damping',
    technicalSpec: 'Commercial van and truck rear door infill panel with excellent flexural rigidity, waterproof edge compatibility, and high impact resistance.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits standard height commercial van rear barn doors and side doors'
  },
  {
    sku: 'ATP-BP-04',
    oem: 'VNFHP281220',
    name: 'FRP Honeycomb Door Panel 2800x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2800 x 1200 x 20mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 425.00,
    aurexPrice: 412.00,
    shortDescription: 'Commercial standard high-reach FRP honeycomb rear barn door panel (2800x1200x20mm, 3.36m²). Suits tall pantechs and curtain-sider rear doors.',
    description: 'High-reach 2800mm long by 1200mm wide 20mm FRP honeycomb panel tailored for high-cube delivery pantechs and curtain-sider rear barn doors. Seamless gelcoat facing provides a smooth canvas for fleet signwriting and livery while resisting weathering and chemical washdowns.',
    parameters: 'Dimensions: 2800 x 1200 x 20mm | Area: 3.36m² | Weight: ~25.2 kg | Finish: Gloss White Gelcoat | High rigidity against wind buffeting',
    technicalSpec: 'High-cube pantech rear barn door structural panel, compatible with 27mm and 34mm cam-locks and continuous PVC edge seals.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits high-cube pantechs, refrigerated vans, and trailer barn doors'
  },
  {
    sku: 'ATP-BP-05',
    oem: 'VNFHP321220',
    name: 'FRP Honeycomb Door Panel 3200x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '3200 x 1200 x 20mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 485.00,
    aurexPrice: 470.00,
    shortDescription: 'Extra-tall commercial FRP honeycomb door panel (3200x1200x20mm, 3.84m²). Designed for jumbo freight bodies, semi-trailers, and drop-deck vans.',
    description: 'Heavy transport extra-tall 3200 x 1200 x 20mm FRP honeycomb door panel. Sized for interstate linehaul semi-trailers, drop-deck pantechs, and oversize commercial bodies requiring continuous single-sheet door height without horizontal seams.',
    parameters: 'Dimensions: 3200 x 1200 x 20mm | Area: 3.84m² | Weight: ~28.8 kg | Double-sided White Gelcoat | Zero rot, zero water absorption',
    technicalSpec: 'Full-height semi-trailer and maxi-cube van rear door panel, zero rotting, corrosion-free, and high torsional damping under interstate road vibration.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits semi-trailer rear barn doors, maxi-cube vans, and drop-deck trailers'
  },
  {
    sku: 'ATP-BP-06',
    oem: 'VNFHP281230',
    name: 'FRP Honeycomb Panel 2800x1200x30mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2800 x 1200 x 30mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 465.00,
    aurexPrice: 451.00,
    shortDescription: 'Heavy-duty 30mm reinforced FRP honeycomb composite panel (2800x1200x30mm, 3.36m²). Increased stiffness and thermal acoustic insulation for heavy freight floors, bulkheads and partitions.',
    description: 'Upgraded 30mm thickness structural FRP honeycomb panel. Engineered for applications demanding greater span deflection resistance, heavy cargo impact containment, and higher acoustic and thermal damping than standard 20mm panels.',
    parameters: 'Dimensions: 2800 x 1200 x 30mm | Area: 3.36m² | Thickness: 30mm | Heavy PP Honeycomb Core | Enhanced load bearing and bending stiffness',
    technicalSpec: 'High-rigidity composite panel for internal freight division, mezzanine partition walls, heavy doors, and premium cargo body lining.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits internal freight partitions, heavy-duty barn doors, and mezzanine floors'
  },
  {
    sku: 'ATP-BP-07',
    oem: 'VNFHP321230',
    name: 'FRP Honeycomb Panel 3200x1200x30mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '3200 x 1200 x 30mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 529.00,
    aurexPrice: 513.00,
    shortDescription: 'Extra-long 30mm heavy-duty FRP honeycomb composite panel (3200x1200x30mm, 3.84m²). Maximum rigidity for heavy-duty commercial transport applications.',
    description: 'Continuous 3200mm extra-long 30mm heavy-duty FRP honeycomb sandwich panel. Maximum flexural modulus and load distribution for full-height commercial truck dividers, heavy rear doors, and specialty vehicle construction.',
    parameters: 'Dimensions: 3200 x 1200 x 30mm | Area: 3.84m² | Thickness: 30mm | High span deflection resistance | Impact absorbing thermoplastic matrix',
    technicalSpec: 'Extended-length heavy structural panel for commercial transport body building, intermodal containers, and specialized equipment bodies.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits full-height semi-trailer partitions, heavy equipment bodies, and cargo walls'
  },
  {
    sku: 'ATP-BP-08',
    oem: 'VNFPP241220',
    name: 'FRP Plywood Panel 2400x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '2400 x 1200 x 20mm (2.88 m²)',
    area: '2.88 m²',
    marketPrice: 435.00,
    aurexPrice: 422.00,
    shortDescription: 'High-impact FRP faced hardwood plywood panel (2400x1200x20mm, 2.88m²). Traditional rugged construction combining waterproof phenolic marine plywood with continuous FRP skins.',
    description: 'Rugged FRP-faced structural hardwood plywood panel combining the extreme puncture resistance of cross-laminated timber with the seamless, waterproof, and chemical-resistant barrier of high-tensile fiberglass skins. Excellent screw and fastener retention across all surface areas.',
    parameters: 'Dimensions: 2400 x 1200 x 20mm | Area: 2.88m² | Core: Waterproof Phenolic Bonded Hardwood Plywood | Facing: 1.5mm Woven Roving Gelcoat FRP | Superior screw-holding strength',
    technicalSpec: 'Heavy impact forklift and cargo-resistant composite plywood panel for side walls, rear doors, and front bulkheads of commercial dry freight transport.',
    certification: 'AS/NZS 2269 (Structural Plywood) & AS/NZS ISO 9001 Certified Approved',
    fit: 'Suits forklift-loaded pantechs, general freight bodies, and heavy rear doors'
  },
  {
    sku: 'ATP-BP-09',
    oem: 'VNFPP281220',
    name: 'FRP Plywood Panel 2800x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '2800 x 1200 x 20mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 499.00,
    aurexPrice: 484.00,
    shortDescription: 'Commercial standard FRP plywood door and body panel (2800x1200x20mm, 3.36m²). Direct replacement for MaxiPARTS CV2502M and Australian commercial pantechs.',
    description: 'Commercial benchmark 2800 x 1200 x 20mm FRP plywood panel. Engineered to match OEM specifications (MaxiPARTS CV2502M equivalent) for commercial truck rear barn doors. Enables direct through-bolting of heavy cam-lock brackets, hinges, and retainers without internal crush spacers.',
    parameters: 'Dimensions: 2800 x 1200 x 20mm | Area: 3.36m² | Thickness: 20mm | Core: Phenolic Marine Grade Hardwood Plywood | High screw retention & bolt pull-out resistance',
    technicalSpec: 'High-strength door panel engineered for heavy vehicle rear barn doors, capable of holding bolted cam-lock hardware with superior screw-holding retention.',
    certification: 'AS/NZS 2269 & AS/NZS ISO 9001 Certified Approved',
    fit: 'Suits rear barn doors for MaxiPARTS, Freighter, Vawdrey, and custom body pantechs'
  },
  {
    sku: 'ATP-BP-10',
    oem: 'VNFPP321220',
    name: 'FRP Plywood Panel 3200x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '3200 x 1200 x 20mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 569.00,
    aurexPrice: 552.00,
    shortDescription: 'Extended-height heavy commercial FRP plywood panel (3200x1200x20mm, 3.84m²). Designed for jumbo dry-freight semi-trailers and B-double bodies.',
    description: 'Extended 3.2m continuous FRP plywood panel designed for full-height semi-trailer rear doors and heavy-duty front bulkheads. Combines high tensile modulus hardwood core with durable exterior white gelcoat to withstand severe freight shifting and forklift mast strikes.',
    parameters: 'Dimensions: 3200 x 1200 x 20mm | Area: 3.84m² | Thickness: 20mm | Phenolic Hardwood Core | High shear strength and torsional resistance',
    technicalSpec: 'Heavy transport composite side and door wall panel with maximum bending modulus and severe weather resistance for Australian highway routes.',
    certification: 'AS/NZS 2269 & AS/NZS ISO 9001 Certified Approved',
    fit: 'Suits jumbo semi-trailers, B-double rear doors, and heavy freight bulkheads'
  },
  {
    sku: 'ATP-BP-11',
    oem: 'VNFXPS4200211520',
    name: 'FRP XPS Insulated Side Panel 4200x2115x20mm',
    sub: 'FRP XPS Insulated Panels',
    dimensions: '4200 x 2115 x 20mm (8.89 m²)',
    area: '8.89 m²',
    marketPrice: 1390.00,
    aurexPrice: 1348.00,
    shortDescription: 'Premium thermal insulated FRP extruded polystyrene (XPS) side panel (4200x2115x20mm, 8.89m²). Engineered for refrigerated truck bodies, chiller vans, and cold-chain transport.',
    description: 'High-performance thermal composite panel constructed with closed-cell Extruded Polystyrene (XPS) foam core vacuum-bonded between high-gloss, food-grade fiberglass skins. Offers outstanding thermal insulation (k = 0.028 W/m·K) with zero thermal bridges and virtually zero water absorption, making it the premier choice for refrigerated pantechs, chiller trucks, and food transport bodies.',
    parameters: 'Dimensions: 4200 x 2115 x 20mm | Area: 8.89m² | Core: High-Density Closed-Cell XPS (38 kg/m³) | Thermal Conductivity: 0.028 W/m·K | Water Absorption: <0.2% | Food-Grade Gelcoat Finish',
    technicalSpec: 'Continuous vacuum-bonded sandwich panel with zero thermal bridges, water absorption < 0.2%, USDA/HACCP food-grade gelcoat finish for meat, dairy and produce haulage.',
    certification: 'HACCP Food Safety Certified Compliant; AS/NZS 4859.1 (Thermal Insulation Materials) Approved',
    fit: 'Suits refrigerated truck bodies, chiller vans, cold storage boxes, and food transport'
  },
  {
    sku: 'ATP-BP-12',
    oem: 'VNFXPS22502115',
    name: 'FRP XPS Insulated Front Panel 2250x2115x20mm',
    sub: 'FRP XPS Insulated Panels',
    dimensions: '2250 x 2115 x 20mm (4.76 m²)',
    area: '4.76 m²',
    marketPrice: 745.00,
    aurexPrice: 722.00,
    shortDescription: 'Insulated FRP XPS front bulkhead panel (2250x2115x20mm, 4.76m²). Built to support refrigeration condenser units (Thermo King / Carrier) with high thermal insulation.',
    description: 'Heavy insulated front bulkhead panel engineered for refrigerated truck and trailer bodies. Designed with high-density XPS core to insulate against engine heat while providing a rigid mounting foundation for nose-mount refrigeration units (Thermo King, Carrier Transicold) and aerodynamic nose cones.',
    parameters: 'Dimensions: 2250 x 2115 x 20mm | Area: 4.76m² | Core: High-Density Closed-Cell XPS | Thermal Conductivity: 0.028 W/m·K | Food-safe anti-bacterial interior skin',
    technicalSpec: 'Structural front refrigerated panel with internal perimeter reinforcement for nose-mount fridge units and aerodynamic front caps.',
    certification: 'HACCP Food Safety Compliant; AS/NZS 4859.1 & AS/NZS ISO 9001 Approved',
    fit: 'Suits front bulkhead of refrigerated trucks, Thermo King / Carrier nose-mounts'
  },
  {
    sku: 'ATP-BP-13',
    oem: 'VNPVCDSH2026',
    name: 'PVC Door Seal 20mm x 5M',
    sub: 'Door Seals',
    dimensions: '20mm x 5M',
    area: '5.0 Metres',
    marketPrice: 48.50,
    aurexPrice: 47.00,
    shortDescription: 'Commercial flexible co-extruded PVC weather and dust seal 20mm x 5.0m for van and truck body doors. Direct fit for Vanguard bodies.',
    description: 'Commercial grade flexible PVC door seal engineered for sealing truck body and van rear barn doors against rain, road dust, and highway air penetration. Extruded from virgin UV-stabilised PVC compound with high tear strength and elasticity across -30°C to +70°C.',
    parameters: 'Profile Width: 20mm | Length: 5.0m | Flexible co-extruded PVC with sealing flap | UV & Ozone Stabilized | Temperature: -30°C to +70°C',
    technicalSpec: 'Flexible co-extruded PVC weather and dust seal for van and commercial vehicle side and rear barn doors.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; AS 3958 Compliance',
    fit: 'Suits pantechs, van rear doors, and truck body perimeter sealing'
  }
];

async function seedProducts() {
  await mongoose.connect('mongodb://127.0.0.1:27017/aurex');
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Brand = mongoose.model('Brand', new mongoose.Schema({}, { strict: false }));

  const cat = await Category.findOne({ slug: 'body-panels' });
  if (!cat) throw new Error('Body Panels category not found!');

  let brand = await Brand.findOne({ name: /Aurex/i });
  const brandId = brand ? brand._id : cat._id;

  for (const item of PRODUCTS_DATA) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.sku.toLowerCase()}`;
    const productDoc = {
      name: item.name,
      sku: item.sku,
      oemPartNumber: item.oem,
      brand: brandId,
      brandName: 'Aurex Panels',
      category: cat._id,
      categories: [cat._id],
      categorySlug: 'body-panels',
      sub: item.sub,
      pricing: {
        mrp: item.marketPrice,
        sellingPrice: item.aurexPrice,
        tradePrice: Math.round(item.aurexPrice * 0.9),
        isPOA: true,
        discountType: 'PERCENTAGE',
        discountValue: 3
      },
      status: 'PUBLISHED',
      isBuyable: false,
      isFeatured: true,
      stockStatus: 'Enquiry only',
      lead: 'Custom Quote / Ex-Stock VIC',
      fit: item.fit,
      shortDescription: item.shortDescription,
      description: item.description,
      desc: item.description,
      images: [
        {
          url: `/images/products/${item.sku}.webp`,
          publicId: `aurex_truck_parts/products/${item.sku}`,
          alt: item.name,
          sortOrder: 0,
          isPrimary: true
        }
      ],
      imageUrl: `/images/products/${item.sku}.webp`,
      specs: {
        Dimensions: item.dimensions,
        'Surface Area': item.area,
        'Market Benchmark Price': `$${item.marketPrice.toFixed(2)} AUD`,
        'Aurex Fleet Price': `$${item.aurexPrice.toFixed(2)} AUD (~3% below market)`,
        'Product Parameter': item.parameters,
        'Technical Specification': item.technicalSpec,
        Certification: item.certification,
        'Australian Standard': item.certification
      },
      specifications: [
        { label: 'Dimensions', value: item.dimensions },
        { label: 'Surface Area', value: item.area },
        { label: 'Market Benchmark', value: `$${item.marketPrice.toFixed(2)} AUD` },
        { label: 'Aurex Target Price', value: `$${item.aurexPrice.toFixed(2)} AUD (~3% below market)` },
        { label: 'Product Parameter', value: item.parameters },
        { label: 'Technical Specification', value: item.technicalSpec },
        { label: 'Certification', value: item.certification },
        { label: 'Australian Standard', value: item.certification }
      ],
      badges: [
        { label: 'Enquiry Only', type: 'warning' },
        { label: '~3% Below Market', type: 'success' }
      ],
      slug,
      rating: 4.8,
      reviewCount: 15
    };

    await Product.findOneAndUpdate(
      { sku: item.sku },
      { $set: productDoc },
      { upsert: true, new: true }
    );
    console.log(`Seeded ${item.sku}: ${item.name} ($${item.aurexPrice} vs $${item.marketPrice})`);
  }

  // Update category count
  cat.count = PRODUCTS_DATA.length;
  await cat.save();

  console.log(`Successfully seeded ${PRODUCTS_DATA.length} Body Panels products in MongoDB!`);
  await mongoose.disconnect();
}

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
