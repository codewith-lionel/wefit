# Sample Data Guide

This application comes pre-loaded with sample data for demonstration purposes.

## Pre-loaded Accounts

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Email**: admin@wefit.com
- **Access**: Full system access

### Trainer Account
- **Username**: trainer1
- **Password**: trainer123
- **Email**: trainer@wefit.com
- **Access**: View members, create plans
- **Details**:
  - Name: John Doe
  - Specialization: Strength Training
  - Experience: 5 years

### Member Account
- **Username**: member1
- **Password**: member123
- **Email**: member@wefit.com
- **Access**: View personal data
- **Details**:
  - Name: Jane Smith
  - Plan: Monthly Basic
  - Trainer: John Doe

## Pre-loaded Membership Plans

### 1. Monthly Basic
- Duration: 1 month
- Price: ₹999
- Features: Gym access, Locker facility

### 2. Quarterly Premium
- Duration: 3 months
- Price: ₹2,499
- Features: Gym access, Trainer support, Diet plan, Progress tracking

### 3. Yearly Elite
- Duration: 12 months
- Price: ₹8,999
- Features: All premium features, Personal trainer, Nutrition counseling, Free merchandise

## How to Add Your Own Data

### Adding Members

1. Login as admin
2. Go to "Members" section
3. Click "Add Member"
4. Fill in the form:
   - Name (required)
   - Email
   - Phone
   - Address
   - Date of Birth
   - Gender
   - Emergency Contact
   - Select Plan
   - Assign Trainer
   - Set Status (Active/Inactive/Expired)

### Adding Trainers

1. Go to "Trainers" section
2. Click "Add Trainer"
3. Enter details:
   - Name (required)
   - Email
   - Phone
   - Specialization (e.g., Yoga, CrossFit, Cardio)
   - Years of Experience
   - Status

### Creating Membership Plans

1. Go to "Plans" section
2. Click "Add Plan"
3. Define plan:
   - Name
   - Duration (in months)
   - Price
   - Description
   - Features (comma-separated)
   - Status

### Recording Payments

1. Go to "Payments" section
2. Click "Add Payment"
3. Fill details:
   - Select Member
   - Select Plan
   - Amount (auto-filled based on plan)
   - Payment Method (Cash/Card/UPI/Bank Transfer)
   - Start Date
   - End Date (auto-calculated)
   - Status (Paid/Pending/Failed)
   - Notes

### Marking Attendance

1. Go to "Attendance" section
2. Click "Mark Attendance"
3. Select member
4. Add notes (optional)

Or use QR Code:
1. Click on member name to generate QR
2. Scan QR code to check-in

### Creating Announcements

1. Go to "Announcements" section
2. Click "New Announcement"
3. Enter:
   - Title
   - Content
   - Type (General/Offer/Event/Maintenance)
   - Target Audience (All/Members/Trainers)

## Bulk Data Import (Future Feature)

Coming soon:
- CSV import for members
- Excel import for payments
- Bulk trainer addition

## Resetting to Default Data

To reset to sample data:
1. Close the application
2. Delete the database file:
   ```
   C:\Users\[YourUsername]\AppData\Roaming\wefit-gym-management\wefit.db
   ```
3. Restart the application
4. Sample data will be recreated automatically

## Data Validation

The system validates:
- Required fields
- Email formats
- Phone numbers
- Numeric values (prices, ages)
- Date formats
- Unique usernames

## Best Practices

1. **Complete Profiles**: Fill all member information for better tracking
2. **Regular Updates**: Keep contact information current
3. **Consistent Naming**: Use standard formats for names
4. **Photo Upload**: Add photos for easy identification (coming soon)
5. **Notes Fields**: Use notes to record special requirements

## Export Options

Export your data:
- **Members PDF**: Complete member list
- **Members Excel**: Detailed spreadsheet
- **Payment Reports**: Financial summaries

Access from:
- Members page: Export buttons
- Payments page: Export PDF option

Files save to: `Downloads` folder

---

**Tip**: Start with sample data to understand the system, then gradually replace with your actual gym data.
