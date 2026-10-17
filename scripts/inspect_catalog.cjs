const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const skus = ['ATP-TP-27', 'ATP-TP-28', 'ATP-TP-29', 'ATP-TP-42', 'ATP-TP-43', 'ATP-TP-44'];
    const prods = await Product.find({ sku: { $in: skus } });
    for (const p of prods) {
      console.log('===', p.sku, '===');
      console.log('Name:', p.name);
      console.log('Category:', p.category);
      console.log('Images:', JSON.stringify(p.images));
      console.log('Specs:', JSON.stringify(p.specs));
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
