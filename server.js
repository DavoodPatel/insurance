// server.js
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const util = require('util');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_test_pJmYPmKKs1w1Ct',
  key_secret: 'dt96M10JbbxVZoQvtju3lZ8K',
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const query = util.promisify(pool.query).bind(pool);

app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      payment_capture: 1,
    });
    res.json({ orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating order');
  }
});

app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM packages');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/add/package', async (req, res) => {
  const { id, name, description, price, package_type } = req.body;
  try {
    await pool.execute(
      'INSERT INTO packages (id, name, description, price, package_type) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, price, package_type]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding package:', err);
    res.status(500).json({ success: false, message: 'Server error while adding package' });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM packages WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





app.post('/api/patient/save-package', async (req, res) => {
  console.log('\n🟢 [STEP 1] API Hit: /api/patient/save-package');
  const {
    mobile_no,
    package_name,
    package_type,
    package_amount,
    payment_mode,
  } = req.body;

  console.log('📥 Received request body:', req.body);

  if (!mobile_no || !package_name || !package_type || !package_amount || !payment_mode) {
    console.warn('🚨 Missing required fields.');
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  console.log('✅ [STEP 2] Required fields validated.');

  try {
    console.log(`🔍 [STEP 3] Checking existence of mobile_no: ${mobile_no.trim()}`);
    const [rows] = await pool.query(
      'SELECT id FROM patients WHERE mobile_no = ?',
      [mobile_no.trim()]
    );

    if (rows.length === 0) {
      console.warn('⚠️ [STEP 3] No patient found.');
      return res.status(404).json({ message: 'Patient not found.' });
    }

    console.log('✅ [STEP 3] Patient exists:', rows[0]);

    console.log('🛠 [STEP 4] Updating patient package...');
    const [result] = await pool.query(
      `UPDATE patients
       SET package_name = ?, package_type = ?, package_amount = ?, payment_mode = ?
       WHERE mobile_no = ?`,
      [
        package_name.trim(),
        package_type,
        package_amount,
        payment_mode,
        mobile_no.trim(),
      ]
    );

    if (result.affectedRows === 0) {
      console.warn('⚠️ [STEP 4] Update query ran but no rows affected.');
      return res.status(500).json({ message: 'Update failed.' });
    }

    console.log('✅ [STEP 4] Package and payment updated successfully.');
    return res.status(200).json({ message: 'Package and payment saved successfully.' });

  } catch (err) {
    console.error('❌ [ERROR] SQL or server error:', err.message || err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});







app.get('/api/payments', async (req, res) => {
  const { method } = req.query;
  if (!method || !['cash', 'online'].includes(method)) {
    return res.status(400).json({ message: 'Invalid or missing payment method' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT name, mobile_no, package_name, package_type, package_amount, created_at
       FROM patients
       WHERE payment_mode = ?
       ORDER BY created_at DESC`,
      [method]
    );
    const results = rows.map(row => ({
      patient_name: row.name,
      mobile_no: row.mobile_no,
      package_name: row.package_name || 'N/A',
      package_type: row.package_type || 'N/A',
      amount: row.package_amount || 'N/A',
      created_at: row.created_at,
    }));
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching payments:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

app.delete('/api/patients/:mobile_no', async (req, res) => {
  const mobileNo = req.params.mobile_no;

  try {
    // Delete from insurance_claims first
    await pool.query('DELETE FROM insurance_claims WHERE mobile_no = ?', [mobileNo]);

    // Then delete from patients
    const [result] = await pool.query('DELETE FROM patients WHERE mobile_no = ?', [mobileNo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient and claims deleted' });
  } catch (error) {
    console.error('Backend error:', error);
    res.status(500).json({ message: 'Failed to delete patient and claims' });
  }
});


app.get('/api/hr', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hr');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching HRs:', err);
    res.status(500).json({ message: 'Failed to fetch HRs' });
  }
});

app.delete('/api/hr/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM hr WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'HR not found' });
    }
    res.json({ message: 'HR deleted successfully' });
  } catch (err) {
    console.error('Error deleting HR:', err);
    res.status(500).json({ message: 'Failed to delete HR' });
  }
});

app.get('/api/patient/by-mobile/:mobile_no', async (req, res) => {
  const { mobile_no } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM patients WHERE mobile_no = ?', [mobile_no]);
    if (rows.length === 0) {
      return res.json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, patient: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/hr/refer-patient-dashboard', async (req, res) => {
  const {
    mobile_no, name, referred_by, father_name, mother_name, address,
    no_of_others, others_names,
  } = req.body;

  if (!mobile_no || !name || !referred_by || !address) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  }

  try {
    const sql = `INSERT INTO patients (mobile_no, name, created_at, referred_by, father_name, mother_name, address, no_of_others, others_names) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`;
    const values = [mobile_no, name, referred_by, father_name, mother_name, address, no_of_others, JSON.stringify(others_names || [])];
    await pool.query(sql, values);
    return res.status(201).json({ success: true, message: 'Patient referred and saved successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Patient with this mobile number already exists.' });
    }
    console.error('Database insert error:', err);
    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
});

app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM doctor WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, doctor: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/hr/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM hr WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, hr: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/hr/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existing] = await pool.query('SELECT * FROM hr WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    await pool.query('INSERT INTO hr (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.status(201).json({ message: 'HR created successfully' });
  } catch (err) {
    console.error('Error creating HR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/patients/referred-by/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT name, mobile_no, package_name, package_amount, created_at
       FROM patients
       WHERE referred_by = ?
       ORDER BY created_at DESC`,
      [name]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching referred patients:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/claim-insurance', async (req, res) => {
  const { mobile_no, name, hospital_name, amount, date, description } = req.body;

  console.log('\n🟢 [CLAIM API HIT]');
  console.log('📥 Received data:', req.body);

  // Step 1: Input validation
  if (!mobile_no || !name || !hospital_name || !amount || !date || !description) {
    console.warn('🚫 Missing required fields.');
    return res.status(400).json({ message: '⚠️ All fields are required' });
  }

  try {
    // Step 2: Check if patient exists
    console.log(`🔍 Checking if patient exists with mobile_no: ${mobile_no}`);
    const [rows] = await pool.query('SELECT id FROM patients WHERE mobile_no = ?', [mobile_no]);

    if (rows.length === 0) {
      console.warn(`❌ Patient with mobile_no ${mobile_no} does not exist`);
      return res.status(404).json({ message: '❌ Patient does not exist. Claim cannot be submitted.' });
    }

    console.log('✅ Patient exists. Proceeding to insert claim.');

    // Step 3: Insert claim into insurance_claims table
    const [insertResult] = await pool.query(
      `INSERT INTO insurance_claims (mobile_no, name, hospital_name, amount, date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mobile_no, name, hospital_name, parseFloat(amount), date, description]
    );

    console.log(`✅ Claim inserted successfully (claim ID: ${insertResult.insertId})`);
    return res.status(201).json({ message: '✅ Claim submitted successfully!' });

  } catch (error) {
    console.error('❌ Error during claim submission:', error.message || error);
    return res.status(500).json({ message: '❌ Internal server error. Please try again.' });
  }
});

//claim history access
app.get('/api/claim-history/:mobile_no', async (req, res) => {
  const { mobile_no } = req.params;

  try {
    // Fetch patient info
    const [patientRows] = await pool.query(
      'SELECT * FROM patients WHERE mobile_no = ?',
      [mobile_no]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientRows[0];

    // Fetch claim history
    const [claimRows] = await pool.query(
      'SELECT * FROM insurance_claims WHERE mobile_no = ? ORDER BY submitted_at DESC',
      [mobile_no]
    );

    res.json({
      patient,
      claims: claimRows,
    });
  } catch (err) {
    console.error('❌ Error fetching claim history:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




const twilio = require('twilio');
const accountSid = 'AC29f11cb1f3228ef69529443283d61b0a';
const authToken = '7940502c2da456fb79ea15360e0cdc57';
const twilioPhone = '+19034763056';
const client = twilio(accountSid, authToken); // ✅ FIXED

app.post('/api/send-sms', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Format dates
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const startDate = `${dd}-${mm}-${yyyy}`;

  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const dd2 = String(nextYear.getDate()).padStart(2, '0');
  const mm2 = String(nextYear.getMonth() + 1).padStart(2, '0');
  const yyyy2 = nextYear.getFullYear();
  const endDate = `${dd2}-${mm2}-${yyyy2}`;

  const message = `Thank you for your purchase!

Your medical insurance has been successfully registered and is active from ${startDate} to ${endDate}.
We appreciate your trust in the Medical Insurance Portal.

If you have any questions or need assistance, feel free to reach out.

Warm regards,
Medical Insurance Portal Team`;

  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });

    res.json({ message: 'SMS sent successfully!' });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});


app.post('/api/send-sms/add-members', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  const message = `✅ Additional members have been successfully added to your insurance.

If you have any queries, feel free to contact our support.

Thank you,
Medical Insurance Portal Team`;

  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });

    res.json({ message: 'SMS sent successfully for added members!' });
  } catch (error) {
    console.error('❌ Twilio error:', error);
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

//Searching patient for update
app.get('/api/patients/:mobile_no', async (req, res) => {
  const { mobile_no } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM patients WHERE mobile_no = ?', [mobile_no]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//upadting others
app.post('/api/patient/add-others', async (req, res) => {
  const { mobile_no, names, total_amount, payment_mode } = req.body;

  if (!mobile_no || !Array.isArray(names) || names.length === 0 || !payment_mode) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Get existing patient
    const [existing] = await pool.query('SELECT * FROM patients WHERE mobile_no = ?', [mobile_no]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = existing[0];

    // 2. Merge with previous values if already present
    const existingNames = patient.others_names ? patient.others_names.split(',').map(s => s.trim()) : [];
    const newNames = names.map(name => name.trim());
    const combinedNames = [...existingNames, ...newNames];
    const noOfOthers = combinedNames.length;

    // 3. Update package amount
    const updatedAmount = parseFloat(patient.package_amount || 0) + (newNames.length * 150);

    // 4. Update patient record
    await pool.query(
      `UPDATE patients SET 
        others_names = ?, 
        no_of_others = ?, 
        package_amount = ?, 
        payment_mode = ? 
        WHERE mobile_no = ?`,
      [combinedNames.join(', '), noOfOthers, updatedAmount, payment_mode, mobile_no]
    );

    res.status(200).json({ message: '✅ Patient updated with new members' });
  } catch (err) {
    console.error('❌ Error updating patient:', err);
    res.status(500).json({ message: 'Failed to update patient' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
