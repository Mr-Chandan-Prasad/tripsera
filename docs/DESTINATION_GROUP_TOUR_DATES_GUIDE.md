# 🗓️ Destination Group Tour Dates - User Guide

## 📋 Overview
This feature allows admins to set specific dates and times for Group Tours when adding or editing destinations. When customers book a Group Tour for a destination, they will see these predefined dates instead of selecting their own date.

## 🎯 How to Use as Admin

### Step 1: Access Admin Panel
1. Go to your website
2. Navigate to Admin Panel
3. Log in with admin credentials

### Step 2: Go to Destinations
1. In the admin panel, click on the **"Destinations"** tab
2. You'll see the destinations management page

### Step 3: Add New Destination with Group Tour Dates
1. Click the **"Add New"** button
2. Fill in the basic destination information:
   - Name (required)
   - Price (required)
   - Description
   - Image URL
   - Location
   - Duration
   - Category
   - Max Capacity

### Step 4: Set Group Tour Dates
1. Scroll down to the **"Group Tour Dates"** section
2. Click **"Add Date"** button
3. Fill in the date details:
   - **Date**: Select the tour date (e.g., March 15, 2024)
   - **Time**: Set the departure time (e.g., 09:00)
   - **Description**: Add a description (e.g., "Morning Group Tour")
   - **Available Slots**: Set how many people can join (e.g., 20)
4. Click **"Add Date"** to add more dates
5. Use the **X** button to remove dates you don't want

### Step 5: Save Destination
1. Click **"Create Destination"** button
2. You'll see a success notification
3. The destination is now saved with Group Tour dates

### Step 6: Edit Existing Destination
1. Find the destination you want to edit
2. Click the **"Edit"** button
3. Modify the Group Tour dates as needed
4. Click **"Update Destination"** to save changes

## 🎯 How Customers Use It

### Step 1: Start Booking
1. Customer goes to the booking system
2. Selects a destination
3. Selects **"Group Tour"** service

### Step 2: Select Tour Date
1. Instead of a date picker, they'll see radio button options
2. Each option shows:
   - Date and time
   - Description
   - Available slots
3. Customer clicks on their preferred date
4. The date is selected

### Step 3: Complete Booking
1. Fill in other booking details
2. Complete the booking process
3. The selected predefined date is used for the tour

## 📱 Example Workflow

### Admin Sets Up Destination with Dates:
```
Admin Panel → Destinations → Add New
Destination: "Goa Beach Paradise"
Group Tour Dates:
- March 15, 2024 at 09:00 - "Morning Group Tour" (20 slots)
- March 20, 2024 at 14:00 - "Afternoon Group Tour" (20 slots)
- March 25, 2024 at 10:00 - "Weekend Special Tour" (25 slots)
```

### Customer Books:
```
Booking System → Select "Goa Beach Paradise" → Select Group Tour
See Options:
☐ March 15, 2024 at 09:00 - Morning Group Tour (20 slots available)
☑ March 20, 2024 at 14:00 - Afternoon Group Tour (20 slots available)
☐ March 25, 2024 at 10:00 - Weekend Special Tour (25 slots available)
```

## 🔧 Technical Details

### Data Storage
- Dates are stored in the destination's `group_tour_dates` field
- Format: `"date|time"` (e.g., "2024-03-15|09:00")
- Each date has: id, date, time, description, available_slots, booked_slots

### Functions Used
- `getDestinationGroupTourDates()` - Customer gets available dates for a destination
- `updateDestinationGroupTourDates()` - Admin updates dates for a destination

## ⚠️ Important Notes

1. **Destination-Based**: Group Tour dates are now tied to destinations, not services
2. **Fallback Message**: If no dates are set, customers see: "No predefined dates available for this destination. Please contact admin to set tour dates."
3. **Form Validation**: All fields (date, time, description) are required when adding new dates
4. **Real-time Updates**: Changes apply immediately without page refresh
5. **No Separate Tab**: Group Tour dates are managed directly in the destination form

## 🎉 Benefits

- ✅ **Integrated Workflow**: Set dates when creating destinations
- ✅ **Organized Tours**: Fixed departure times for better coordination
- ✅ **Admin Control**: You decide when tours run for each destination
- ✅ **Customer Clarity**: Clear options instead of confusion
- ✅ **Slot Management**: Track availability for each date
- ✅ **Professional**: Looks more organized and professional

## 🆘 Troubleshooting

### Problem: "No predefined dates available for this destination"
**Solution**: Admin needs to add dates when creating/editing the destination

### Problem: Can't add new date
**Solution**: Make sure all fields (date, time, description) are filled

### Problem: Dates not showing for customers
**Solution**: Check that the destination has `group_tour_dates` set and the service is Group Tour

### Problem: Form not saving
**Solution**: Make sure all required fields (name, price) are filled

## 📞 Support
If you need help with this feature, check the test file: `tests/html/test-group-tour-predefined-dates.html` for detailed testing instructions.

## 🔄 Migration Notes
- **Old System**: Group Tour dates were managed separately in a dedicated tab
- **New System**: Group Tour dates are managed directly in the destination form
- **Data Migration**: Existing destinations will have sample Group Tour dates added automatically
- **Backward Compatibility**: The system still works with the old service-based approach for existing data
