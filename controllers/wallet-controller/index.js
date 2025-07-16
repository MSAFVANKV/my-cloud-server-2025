import axios from 'axios';


const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const basicAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');



export const withdrawMyWallet = async (req, res) => {
    const { amount, accountHolder, accountNumber, ifscCode } = req.body;

    console.log(req.body,'req.body');
    

    if (!amount || !accountHolder || !accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
  
    try {
      // Step 1: Add contact
      const contactRes = await axios.post(
        'https://api.razorpay.com/v1/contacts',
        {
          name: accountHolder,
          type: 'employee',
          reference_id: `user_${Date.now()}`,
          email: 'user@example.com',
          contact: '9999999999',
        },
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        }
      );
      console.log(contactRes,'contactRes');

  
      const contactId = contactRes.data.id;
  
      // Step 2: Add fund account
      const fundRes = await axios.post(
        'https://api.razorpay.com/v1/fund_accounts',
        {
          contact_id: contactId,
          account_type: 'bank_account',
          bank_account: {
            name: accountHolder,
            ifsc: ifscCode,
            account_number: accountNumber,
          },
        },
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        }
      );

      console.log(fundRes,'fundRes');
      
  
      const fundAccountId = fundRes.data.id;
  
      // Step 3: Initiate Payout
      const payoutRes = await axios.post(
        'https://api.razorpay.com/v1/payouts',
        {
          account_number: 'YOUR_RAZORPAYX_ACCOUNT_NO', // get this from RazorpayX
          fund_account_id: fundAccountId,
          amount: amount * 100, // INR in paise
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `payout_${Date.now()}`,
          narration: 'Wallet withdrawal',
        },
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        }
      );
  
      res.json({ success: true, message: 'Payout initiated.', data: payoutRes.data });
    } catch (error) {
      console.error(error?.response?.data || error.message);
      res.status(500).json({ success: false, message: 'Withdrawal failed.' });
    }
}