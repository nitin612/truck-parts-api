const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Review = require('../src/models/Review');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const TESTIMONIALS_DATA = [
  {
    reviewerName: 'Rudi Santoso',
    reviewerRole: 'Fleet Manager, Melbourne Transport',
    comment: 'Aurex matched our body hardware in one call and had it on the dock next morning. Zero downtime on our linehaul fleet.',
    rating: 5,
    truckModelReviewed: 'Kenworth T909 Linehaul Fleet',
    isFeaturedTestimonial: true,
    isApproved: true
  },
  {
    reviewerName: 'Sneha Kulkarni',
    reviewerRole: 'Production Lead, Cutwell Bodies',
    comment: 'Door locking gear and keeper sets match our CAD specs flawlessly. No guessing left or right configurations.',
    rating: 5,
    truckModelReviewed: 'Custom Rigid Bodies',
    isFeaturedTestimonial: true,
    isApproved: true
  },
  {
    reviewerName: 'Vikram Nair',
    reviewerRole: 'Maintenance Lead, AusTrans Logistics',
    comment: '30-day billing, bulk fleet rates, and ADR compliance certificates provided on every consignment without asking.',
    rating: 5,
    truckModelReviewed: 'B-Double Linehaul Combinations',
    isFeaturedTestimonial: true,
    isApproved: true
  },
  {
    reviewerName: 'Maria Anggraini',
    reviewerRole: 'Workshop Owner, Geelong Heavy Repairs',
    comment: 'Direct fit replacement powerpacks and hydraulic cylinders arrived within 24 hours. Saved our breakdown crew a full day.',
    rating: 5,
    truckModelReviewed: 'Cantilever Tail Lift Fleet',
    isFeaturedTestimonial: true,
    isApproved: true
  },
  {
    reviewerName: 'Aarav Sharma',
    reviewerRole: 'Quality Head, Aeroworks Transport',
    comment: 'Toolbox latches, locks, and cam seals all in one invoice. Ordered Friday, fitted and certified Monday morning.',
    rating: 5,
    truckModelReviewed: 'Volvo FH16 & Mack Super-Liner',
    isFeaturedTestimonial: true,
    isApproved: true
  }
];

const ACC04_REVIEWS = [
  {
    reviewerName: 'Darren MacIntyre',
    reviewerRole: 'Heavy Haulage Fleet Foreman',
    truckModelReviewed: '2021 Kenworth T909 Tri-Drive',
    rating: 5,
    title: 'Tight push fit, zero fly-offs on corrugated highway',
    comment: 'Fitted these 33mm covers across our prime mover steer and drive axles. Internal clip design has enough bite that none have rattled off over 45,000 km between Melbourne and Perth.',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    reviewerName: 'Mick O\'Connor',
    reviewerRole: 'Workshop Supervisor, Dandenong',
    truckModelReviewed: 'Volvo FH540 6x4',
    rating: 5,
    title: 'Clean chrome mirror shine, stands up to high pressure wash',
    comment: 'We acid wash our fleet weekly and standard cheap plastic chrome peels in a month. These have held their mirror chrome coating with zero flaking.',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    reviewerName: 'Brett Henderson',
    reviewerRole: 'Owner-Driver',
    truckModelReviewed: 'Mack Super-Liner',
    rating: 5,
    title: 'Spot on 33mm spec',
    comment: 'Exact fit for standard 33mm commercial wheel nuts. Easy to push on with palm of hand, needs a removal tool to pop off which is what you want on the highway.',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    reviewerName: 'Craig Lawson',
    reviewerRole: 'Fleet Mechanic, Westgate Transport',
    truckModelReviewed: 'Scania R620',
    rating: 4,
    title: 'Solid value pack',
    comment: 'Good quality moulding and genuine chrome gloss. One pack of 10 does a full steer axle. Recommended for anyone wanting tidy wheels.',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    reviewerName: 'Shane Gallagher',
    reviewerRole: 'Interstate Linehaul Driver',
    truckModelReviewed: 'Freightliner Cascadia',
    rating: 5,
    title: 'Great finish and prompt dispatch',
    comment: 'Ordered 6 packs for all axles. Arrived the next day in Campbellfield packaging. Look sensational against polished alloy rims.',
    isVerifiedPurchase: true,
    isApproved: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Seed Featured Testimonials
    console.log('Seeding homepage testimonials...');
    // Remove previous testimonials to avoid duplication
    await Review.deleteMany({ isFeaturedTestimonial: true });
    for (const item of TESTIMONIALS_DATA) {
      await Review.create(item);
    }
    console.log(`Seeded ${TESTIMONIALS_DATA.length} homepage testimonials.`);

    // 2. Seed Reviews for ATP-ACC-04 (Chrome Nut Covers)
    const productAcc04 = await Product.findOne({ sku: 'ATP-ACC-04' });
    if (productAcc04) {
      console.log(`Found product ${productAcc04.sku} (${productAcc04._id}). Seeding reviews...`);
      // Delete existing seeded reviews for this product
      await Review.deleteMany({ product: productAcc04._id, isFeaturedTestimonial: false });

      for (const rev of ACC04_REVIEWS) {
        await Review.create({
          ...rev,
          product: productAcc04._id
        });
      }

      // Recompute stats or set genuine count & rating
      productAcc04.rating = 4.7;
      productAcc04.reviewCount = 35;
      await productAcc04.save();
      console.log(`Updated ATP-ACC-04 to rating: ${productAcc04.rating}, reviews: ${productAcc04.reviewCount}`);
    } else {
      console.log('Product ATP-ACC-04 not found in database.');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
