const fs = require('fs');
const content = fs.readFileSync('src/components/nutrition/tabs/CartTab.tsx', 'utf8');
if (content.includes('address: `[Paiement : ${paymentMethod}] - ${finalAddress}`')) {
  console.log('Payment method is correctly prepended to address.');
} else {
  console.log('Payment method is NOT prepended to address!');
}
