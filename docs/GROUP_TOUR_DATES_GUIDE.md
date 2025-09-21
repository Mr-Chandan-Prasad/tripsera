# 🗓️ Group Tour Predefined Dates - User Guide

## 📋 Overview
This feature allows admins to set specific dates and times for Group Tours, so customers can choose from predefined options instead of selecting their own dates. This ensures organized group departures.

## 🎯 How to Use as Admin

### Step 1: Access Admin Panel
1. Go to your website
2. Navigate to Admin Panel
3. Log in with admin credentials

### Step 2: Go to Group Tour Dates
1. In the admin panel, click on the **"Group Tour Dates"** tab
2. You'll see the Group Tour Date Management page

### Step 3: Manage Dates for Group Tour
1. Find the Group Tour service card
2. Click the **"Manage Dates"** button
3. A modal will open with date management options

### Step 4: Add New Dates
1. In the modal, scroll down to "Add New Date" section
2. Fill in the form:
   - **Date**: Select the tour date (e.g., March 15, 2024)
   - **Time**: Set the departure time (e.g., 09:00)
   - **Description**: Add a description (e.g., "Spring Special Tour")
   - **Available Slots**: Set how many people can join (e.g., 25)
3. Click **"Add Date"** button
4. You'll see a success notification
5. The new date appears in the "Current Dates" list

### Step 5: Remove Dates (Optional)
1. In the "Current Dates" list, find the date you want to remove
2. Click the **X** button next to that date
3. Confirm the removal
4. The date will be removed from the list

### Step 6: Close Modal
1. Click **"Close"** button to exit the date management modal
2. Your changes are automatically saved

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

### Admin Sets Up Dates:
```
Admin Panel → Group Tour Dates → Manage Dates
Add Date: March 15, 2024 at 09:00 - "Spring Special Tour" (25 slots)
Add Date: March 20, 2024 at 14:00 - "Afternoon Tour" (20 slots)
Add Date: March 25, 2024 at 10:00 - "Weekend Tour" (30 slots)
```

### Customer Books:
```
Booking System → Select Destination → Select Group Tour
See Options:
☐ March 15, 2024 at 09:00 - Spring Special Tour (25 slots available)
☑ March 20, 2024 at 14:00 - Afternoon Tour (20 slots available)
☐ March 25, 2024 at 10:00 - Weekend Tour (30 slots available)
```

## 🔧 Technical Details

### Data Storage
- Dates are stored in localStorage
- Format: `"date|time"` (e.g., "2024-03-15|09:00")
- Each date has: id, date, time, description, available_slots, booked_slots

### Functions Used
- `updateGroupTourPredefinedDates()` - Admin updates dates
- `getGroupTourPredefinedDates()` - Customer gets available dates

## ⚠️ Important Notes

1. **Only for Group Tours**: This feature only works for services marked as `is_group_tour: true`
2. **Fallback Message**: If no dates are set, customers see: "No predefined dates available. Please contact admin to set tour dates."
3. **Form Validation**: All fields (date, time, description) are required when adding new dates
4. **Real-time Updates**: Changes apply immediately without page refresh

## 🎉 Benefits

- ✅ **Organized Tours**: Fixed departure times for better coordination
- ✅ **Admin Control**: You decide when tours run
- ✅ **Customer Clarity**: Clear options instead of confusion
- ✅ **Slot Management**: Track availability for each date
- ✅ **Professional**: Looks more organized and professional

## 🆘 Troubleshooting

### Problem: "No predefined dates available"
**Solution**: Admin needs to add dates in the Group Tour Dates section

### Problem: Can't add new date
**Solution**: Make sure all fields (date, time, description) are filled

### Problem: Dates not showing for customers
**Solution**: Check that the service is marked as Group Tour (`is_group_tour: true`)

### Problem: Modal not opening
**Solution**: Refresh the page and try again

## 📞 Support
If you need help with this feature, check the test file: `tests/html/test-group-tour-predefined-dates.html` for detailed testing instructions.
