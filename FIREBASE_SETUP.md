# Firebase Setup Instructions

## Important: Deploy Firestore Security Rules

The user creation issue is likely due to missing Firestore Security Rules. Follow these steps to fix it:

### Step 1: Deploy Firestore Security Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the content from `firestore.rules` file in this project
6. Click **Publish**

### Step 2: Verify the Rules are Working

After deploying the rules, try creating a new account:

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Try signing up with a new account
4. You should see logs like:
   - `[Auth] Starting user registration...`
   - `[Auth] User account created: <user-id>`
   - `[Auth] Creating profile document...`
   - `[Auth] Profile document created successfully!`

### Step 3: Check Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Check the **Data** tab
3. You should see a `profiles` collection with a document for each user

## Security Rules Explanation

The `firestore.rules` file contains security rules that:

- Allow users to create their own profile when signing up
- Allow users to read/update only their own profile
- Allow anyone to read active business cards
- Allow only card owners to create/update/delete their cards
- Allow anyone to submit contact shares
- Allow card owners to read analytics and shared contacts
- Prevent unauthorized access to all other data

## Common Issues

### Issue: "Missing or insufficient permissions"

**Solution**: Make sure you've deployed the Firestore Security Rules from the `firestore.rules` file.

### Issue: Profile document not created

**Solution**:
1. Check browser console for error messages
2. Verify Firestore Security Rules are deployed
3. Check that the Firebase configuration in `.env` is correct

### Issue: "PERMISSION_DENIED" error

**Solution**: The security rules are either not deployed or incorrectly configured. Redeploy the rules from the Firebase Console.

## Testing

After deploying the rules, you can test by:

1. Creating a new account
2. Checking the browser console for success messages
3. Verifying the profile document exists in Firestore Database
4. Testing card creation and other features

## Need Help?

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Verify your Firebase project configuration in `.env`
3. Make sure Firebase Authentication and Firestore Database are enabled in your Firebase project
4. Check that you have the correct permissions in your Firebase project
