const mongoose = require('mongoose');

const updates = [
  // 1. CARGO BAR WITH HANDLE (GL-15616)
  {
    sku: 'ATP-TP-14',
    name: 'Adjustable Heavy-Duty Steel Cargo Shoring Bar with Quick-Release Lever Handle (GL-15616)',
    shortDescription: 'Heavy-duty telescoping steel cargo shoring bar supplied complete WITH quick-action ratcheting lever handle and articulated non-slip rubber feet. Universal fit for pantechs, dry freight vans, and containers.',
    description: 'The Aurex GL-15616 is a commercial heavy-duty telescoping cargo shoring bar specifically supplied WITH a heavy-duty quick-release ratcheting lever handle. Unlike bare bars or basic screw-type jacks, the integrated mechanical lever ratchet allows a single operator to apply high-compression clamping force against trailer side walls within seconds, and release instantly with the safety catch. Constructed from heavy-gauge structural steel tubing with heavy zinc passivation. Features articulating non-slip molded rubber foot pads that contour against ribbed or flat walls without damaging composite panelling or refrigerated liners.',
    specifications: [
      { label: 'Part Number', value: 'GL-15616' },
      { label: 'Handle Type', value: 'Quick-action ratcheting compression lever handle (Included)' },
      { label: 'Adjustment Range', value: '2260 mm to 2630 mm (7.4 ft to 8.6 ft)' },
      { label: 'Material', value: 'Heavy structural steel tube with cast lever handle' },
      { label: 'Finish', value: 'Electro-zinc plated anti-corrosion' },
      { label: 'Foot Pads', value: 'Heavy-duty articulated pivoting rubber pads' },
      { label: 'Working Rating', value: 'Heavy commercial load blocking & bracing' },
      { label: 'Compliance', value: 'Meets NHVR Load Restraint Guide 2018 requirements' },
      { label: 'Applications', value: 'Pantech trucks, shipping containers, dry freight semi-trailers' }
    ],
    images: [
      { url: '/images/products/ATP-TP-14-handle.jpg', publicId: 'local-tp14-handle', alt: 'Cargo Bar with Quick-Release Lever Handle', isPrimary: true },
      { url: '/images/products/ATP-TP-14-schematic.png', publicId: 'local-tp14-schematic', alt: 'Cargo Bar Mechanical Schematic Diagram' },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476764/aurex_truck_parts/products/ATP-TP-14.jpg', publicId: 'cloud-tp14', alt: 'Cargo Bar Full View' }
    ]
  },

  // 2. F-TRACK END FITTING WITH STRAP (GL-19120)
  {
    sku: 'ATP-TP-16',
    name: 'Steel F-Track Cargo Shoring Beam End Fitting with Webbing Strap (GL-19120)',
    shortDescription: 'Heavy-duty zinc plated steel end fitting supplied complete WITH high-tensile 50mm polyester webbing strap loop. Plugs directly into standard Series F track slots.',
    description: 'Manufactured by Ganland (Part GL-19120), this heavy-duty stamped steel end fitting is supplied WITH an integrated high-strength 50mm polyester webbing strap (strip) loop. Specifically engineered to snap securely into vertical and horizontal Series F track slots on dry freight pantechs and logistics trailers. Provides a rigid, high-load anchor point for tie-down straps, ratchet assemblies, and custom cargo netting to prevent pallet shifting under heavy highway braking.',
    specifications: [
      { label: 'Part Number', value: 'GL-19120' },
      { label: 'Strap Inclusions', value: '50 mm heavy-duty polyester webbing strap / strip loop (Included)' },
      { label: 'Track Compatibility', value: 'Standard Series F Track (19mm - 25mm slot)' },
      { label: 'Material', value: 'Stamped high-tensile carbon steel' },
      { label: 'Finish', value: 'Heavy zinc passivated anti-rust coating' },
      { label: 'Working Load Limit', value: '450 kg (Lashing Capacity: 900 kg)' },
      { label: 'Applications', value: 'Pantech tie-downs, internal logistics straps, furniture restraint' }
    ],
    images: [
      { url: '/images/products/ATP-TP-16-strap.png', publicId: 'local-tp16-strap', alt: 'Steel F-Track End Fitting with Webbing Strap', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476765/aurex_truck_parts/products/ATP-TP-16.jpg', publicId: 'cloud-tp16', alt: 'Steel End Fitting' }
    ]
  },

  // 3. TRACK END FITTING WITH STRAP & HOOK (GL-19117)
  {
    sku: 'ATP-TP-17',
    name: 'Heavy-Duty Spring-Loaded Track End Fitting with Webbing Strap & Hook (GL-19117)',
    shortDescription: 'Industrial spring-loaded steel track end fitting supplied complete WITH reinforced webbing strap and forged steel snap hook. Positive click-lock engagement for logistics rails.',
    description: 'The Aurex GL-19117 is an industrial spring-loaded steel end fitting supplied complete WITH heavy-duty reinforced webbing strap (strip) and a forged steel clevis snap hook. Designed for instant snap-in locking into commercial logistics tracks (E-Track, Q-Track, and universal rails). Features an internal tempered coil spring that locks the heavy steel plunger dog firmly into track apertures, resisting road vibration and preventing accidental disengagement during transport.',
    specifications: [
      { label: 'Part Number', value: 'GL-19117' },
      { label: 'Strap & Hook', value: 'Heavy-duty webbing strap with forged steel clevis hook (Included)' },
      { label: 'Track System', value: 'E-Track, Q-Track, and universal logistics tracks' },
      { label: 'Material', value: 'Forged & stamped structural carbon steel' },
      { label: 'Finish', value: 'Zinc electro-plated' },
      { label: 'Mechanism', value: 'Spring-loaded quick-release pull ring' },
      { label: 'Applications', value: 'Multi-point cargo lashing, tie-down strap anchors' }
    ],
    images: [
      { url: '/images/products/ATP-TP-17-strap.jpg', publicId: 'local-tp17-strap', alt: 'Track End Fitting with Strap & Hook', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476765/aurex_truck_parts/products/ATP-TP-17.jpg', publicId: 'cloud-tp17', alt: 'End Fitting Assembly' }
    ]
  },

  // 4. 27MM STEEL CAM LOCK WITH LATCH (GL-11113)
  {
    sku: 'ATP-TP-01',
    name: '27mm Heavy-Duty Cam Door Lock Kit Zinc Plated (GL-11113) - Left & Right Hand Available',
    shortDescription: 'Commercial 27mm rear door locking gear kit complete with dual cams, heavy-duty keepers, forged lever handle, and anti-rattle mounting brackets. High-tensile zinc plated for Australian commercial freight.',
    description: 'The Aurex GL-11113 Cam Door Lock Kit is an industry-standard rear door locking mechanism engineered specifically for Australian commercial dry freight pantechs, refrigerated vans, and heavy-duty box trailers. Designed to accommodate standard 27mm (OD) pipe, this heavy-duty assembly provides positive locking engagement that resists extreme vibration and torsional chassis flex during linehaul transport. Available in matched Left-Hand (200L) and Right-Hand (200R) configurations. Features forged steel cams and heavy cast keepers with a >7µm zinc-nickel passivated coating providing exceptional corrosion resistance against road salts and coastal weathering. Includes an ergonomic lever handle with an integrated padlock eyelet and anti-rattle nylon mounting brackets for smooth, silent operation.',
    specifications: [
      { label: 'Pipe Diameter', value: '27 mm OD (Outer Diameter)' },
      { label: 'Material', value: 'High-tensile forged & stamped carbon steel' },
      { label: 'Surface Finish', value: 'Electro-galvanised zinc plated (>7µm passivation)' },
      { label: 'Handing Options', value: 'Left-Hand (LH) and Right-Hand (RH) sets available' },
      { label: 'Kit Inclusions', value: '2x Cams, 2x Keepers, 3x Mounting Brackets, 1x Lever Handle, 1x Handle Keeper' },
      { label: 'Assembly Weight', value: '5.4 kg (excluding pipe)' },
      { label: 'Locking Type', value: 'Over-center compression cam with padlock hole' },
      { label: 'Applications', value: 'Pantech trucks, curtainsider rear doors, logistics dry freight boxes' }
    ],
    images: [
      { url: '/images/products/ATP-TP-01-gl11113.jpg', publicId: 'local-tp01-gl11113', alt: '27mm Cam Door Lock Kit GL-11113', isPrimary: true },
      { url: '/images/products/ATP-TP-01-schematic.png', publicId: 'local-tp01-schematic', alt: '27mm Cam Door Lock CAD Dimensional Schematic' },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476761/aurex_truck_parts/products/ATP-TP-01.jpg', publicId: 'cloud-tp01', alt: 'Cam Lock Hardware' }
    ]
  },

  // 5. 27MM STEEL CAM LOCK WITHOUT LATCH (GL-11113-NL)
  {
    sku: 'ATP-TP-02',
    name: '27mm Steel Cam Door Locking Gear Assembly (Without Handle/Latch) (GL-11113-NL)',
    shortDescription: 'Replacement 27mm pipe cam lock hardware assembly including dual heavy-duty locking cams, chassis keepers, and pivot brackets. Supplied WITHOUT handle/latch for custom handle installations.',
    description: 'Engineered as a direct workshop replacement sub-assembly, this 27mm Cam Door Lock set provides the critical upper and lower locking points for truck and semi-trailer rear barn doors. Manufactured from high-tensile stamped steel with heavy-duty zinc protective plating, it includes two high-leverage cams, two frame-mounting keepers, and reinforced split-bracket assemblies. Supplied specifically WITHOUT the lower operating handle/latch to allow fleet workshops to retain existing custom linkages or install specialized security handles.',
    specifications: [
      { label: 'Pipe Diameter', value: '27 mm OD' },
      { label: 'Material', value: 'High-grade carbon structural steel' },
      { label: 'Finish', value: 'Heavy zinc passivated anti-rust coating' },
      { label: 'Configuration', value: 'Supplied without handle / without latch' },
      { label: 'Inclusions', value: '2x Top/Bottom Cams, 2x Weld/Bolt-on Keepers, 3x Heavy Pipe Brackets' },
      { label: 'Applications', value: 'Workshop repairs, custom body builds, replacement cam points' }
    ]
  },

  // 6. STEEL HANDLE WITHOUT MOUNTING BASE (GL-14175B)
  {
    sku: 'ATP-TP-22',
    name: 'Zinc Plated Tubular Steel Grab Handle L330 x H50mm (Without Mounting Base) (GL-14175B)',
    shortDescription: 'Commercial 330mm heavy-duty tubular steel grab handle (50mm standoff) supplied WITHOUT separate mounting base. Ideal for direct weld-on or bolt-through coaming installations.',
    description: 'The GL-14175B is a rugged, cost-effective heavy-duty tubular steel grab handle measuring 330mm long with a 50mm clearance standoff. Supplied in bare tubular configuration WITHOUT separate mounting base plates, designed for direct weld-on or bolt-through attachment onto truck coaming rails, tipper tailgates, and heavy industrial plant equipment. Electro-zinc plated to withstand harsh Australian quarry and highway environments.',
    specifications: [
      { label: 'Part Number', value: 'GL-14175B' },
      { label: 'Total Length (L)', value: '330 mm' },
      { label: 'Standoff Height (H)', value: '50 mm' },
      { label: 'Mounting Style', value: 'Tubular ends (without separate mounting base plates)' },
      { label: 'Material', value: 'High-tensile tubular carbon steel' },
      { label: 'Finish', value: 'Zinc electro-plated' },
      { label: 'Applications', value: 'Tipper bodies, flatbed coaming rails, mining access steps' }
    ]
  },

  // 7. FLUSH PADDLE LOCK (GL-12140)
  {
    sku: 'ATP-TP-20',
    name: 'Flush Recessed Zinc Alloy Paddle Toolbox Lock with Dual Keys (GL-12140)',
    shortDescription: 'Recessed flush paddle latch lock in durable zinc alloy with stainless steel face. Features a sealed key barrel, dual keys, and pre-fitted waterproof foam gasket.',
    images: [
      { url: '/images/products/ATP-TP-20-paddle.png', publicId: 'local-tp20-paddle', alt: 'Flush Paddle Toolbox Lock GL-12140', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476765/aurex_truck_parts/products/ATP-TP-20.jpg', publicId: 'cloud-tp20', alt: 'Toolbox Lock Assembly' }
    ]
  },

  // 8. GUANGZHOU CANVAS STAND - 1250mm WIDTH (ATP-TP-13)
  {
    sku: 'ATP-TP-13',
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 1250x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (1250mm Width x 1600mm Height). Heavy structural tubular steel with baked black powder coating. Suits narrow bodies and drop-deck transitions.',
    description: 'Manufactured by Guangzhou Caiyuan Hardware to precision engineering drawings, this 1250mm wide by 1600mm high canvas roof stand provides structural stabilization for commercial curtainsider (tautliner) bodies. Built from heavy 32mm OD structural tubular steel (2.5mm wall thickness) with welded base mounting plates and high-adhesion black powder coat finish. Part of the Caiyuan Canvas Stand series available in 1250mm, 1995mm, and 2045mm widths.',
    specifications: [
      { label: 'Width (W)', value: '1250 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Tube Dimensions', value: '32 mm OD x 2.5 mm wall thickness' },
      { label: 'Material', value: 'Heavy structural carbon steel' },
      { label: 'Surface Finish', value: 'Baked electrostatic powder coat (Gloss Black)' },
      { label: 'Series Options', value: 'Available in 1250mm, 1995mm, and 2045mm widths' },
      { label: 'Mounting', value: 'Welded base plates with pre-drilled M12 fixing holes' },
      { label: 'Applications', value: 'Narrow rigid curtainsiders, drop-deck goose-neck sections, service bodies' }
    ]
  },

  // 9. GUANGZHOU CANVAS STAND - 1995mm WIDTH (ATP-TP-11)
  {
    sku: 'ATP-TP-11',
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 1995x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (1995mm Width x 1600mm Height). Standard Australian semitrailer width. Heavy tubular steel with black powder coating.',
    description: 'Manufactured by Guangzhou Caiyuan Hardware, this 1995mm wide by 1600mm high canvas roof arch stand is engineered for standard Australian commercial curtainsider semi-trailers and rigid truck bodies. Fabricated from heavy 32mm OD structural steel tubing with precision mandrel bends and durable black powder coating. Resists roof sagging, tarp flapping, and harsh wind buffeting on highway freight routes. Part of the Caiyuan Canvas Stand series available in 1250mm, 1995mm, and 2045mm widths.',
    specifications: [
      { label: 'Width (W)', value: '1995 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Tube Dimensions', value: '32 mm OD x 2.5 mm wall thickness' },
      { label: 'Material', value: 'Heavy structural carbon steel' },
      { label: 'Surface Finish', value: 'Baked electrostatic powder coat (Gloss Black)' },
      { label: 'Series Options', value: 'Available in 1250mm, 1995mm, and 2045mm widths' },
      { label: 'Mounting', value: 'Welded base plates with pre-drilled M12 fixing holes' },
      { label: 'Applications', value: 'Standard commercial tautliners, linehaul trailers, rigid curtainsiders' }
    ]
  },

  // 10. GUANGZHOU CANVAS STAND - 2045mm WIDTH (ATP-TP-12)
  {
    sku: 'ATP-TP-12',
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 2045x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (2045mm Width x 1600mm Height). Wide high-cube trailer width. Heavy tubular steel with weather-resistant black powder coating.',
    description: 'The widest model in the Guangzhou Caiyuan Canvas Stand series, measuring 2045mm wide by 1600mm high. Specifically designed for maximum-width 2.5m commercial semi-trailers, high-cube tautliners, and B-double lead trailers. Constructed from heavy-wall 32mm OD structural carbon steel with reinforced gussets and an architectural black powder-coated protective finish. Part of the Caiyuan Canvas Stand series available in 1250mm, 1995mm, and 2045mm widths.',
    specifications: [
      { label: 'Width (W)', value: '2045 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Tube Dimensions', value: '32 mm OD x 2.5 mm wall thickness' },
      { label: 'Material', value: 'Heavy structural carbon steel' },
      { label: 'Surface Finish', value: 'Baked electrostatic powder coat (Gloss Black)' },
      { label: 'Series Options', value: 'Available in 1250mm, 1995mm, and 2045mm widths' },
      { label: 'Mounting', value: 'Welded base plates with pre-drilled M12 fixing holes' },
      { label: 'Applications', value: 'High-cube tautliners, 2.5m wide semi-trailers, B-double lead units' }
    ]
  },

  // 11. GUANGZHOU DN16MM PADDLE LATCH (ATP-TP-19)
  {
    sku: 'ATP-TP-19',
    name: 'Heavy-Duty DN16mm 304 Stainless Steel Flush Paddle Handle Latch (A20-01S-06)',
    shortDescription: 'Precision flush-mount paddle latch manufactured from solid Grade 304 stainless steel with mirror polish. Designed for DN16mm locking rods, with key lock barrel and weather seal.',
    description: 'Manufactured by Guangzhou Caiyuan Hardware (Part A20-01S-06), this heavy-duty flush paddle handle latch is crafted from marine-grade 304 stainless steel with a high-shine mirror polish. Specifically sized to drive standard DN16mm locking rods or multi-point latching bars. Features a heavy-duty key lock cylinder with spring shutter, four rear mounting studs, and an internal return spring.',
    specifications: [
      { label: 'Part Number', value: 'A20-01S-06' },
      { label: 'Rod Size Compatibility', value: 'DN16mm standard locking rods' },
      { label: 'Material', value: 'AISI 304 Marine-Grade Stainless Steel' },
      { label: 'Finish', value: 'Mirror buffed polish' },
      { label: 'Mounting', value: 'Flush recessed mount with 4 rear fixing studs' },
      { label: 'Locking', value: 'Key-locking with water-resistant keyway shutter' },
      { label: 'Applications', value: 'Truck toolboxes, service body doors, generator compartments, canopy hatches' }
    ]
  }
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aurex');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  console.log(`Applying updates for ${updates.length} products...`);
  for (const item of updates) {
    const updateObj = {
      name: item.name,
      shortDescription: item.shortDescription,
    };
    if (item.description) updateObj.description = item.description;
    if (item.specifications) updateObj.specifications = item.specifications;
    if (item.images) updateObj.images = item.images;

    const res = await Product.updateOne({ sku: item.sku }, { $set: updateObj });
    console.log(`✓ Updated ${item.sku} (${res.matchedCount} matched): ${item.name}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
