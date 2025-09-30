# Barangay San Miguel MCIS - Mobile App

![Mobile App Mockup](https://i.imgur.com/L1n7btr.png)

This is the official mobile application for the **Barangay San Miguel Maternal and Childcare Inventory System**. This application is designed to enhance prenatal and childcare resource management through digital innovation, empowering Barangay Health Workers (BHWs), Barangay Nutrition Scholars (BNSs), and mothers in the community. The app provides a user-friendly interface for managing patient records, appointments, and inventory directly from the field.

## 📖 About The Project

This project addresses the challenges faced by healthcare providers in Barangay San Miguel, who traditionally rely on manual, paper-based methods for patient record-keeping and inventory management. These outdated practices often lead to disorganized service delivery, resource allocation issues, and missed opportunities for preventative care.

The mobile application provides a robust, role-based solution that digitizes these workflows. It allows BHWs and BNSs to access and update patient data during field visits, even in areas with limited internet connectivity, and provides a dedicated portal for mothers to engage with their healthcare journey.

## ✨ Key Features

* **Role-Based Dashboards:** Separate, tailored interfaces for Barangay Health Workers (BHWs), Barangay Nutrition Scholars (BNSs), and Maternal users, each with a unique color theme and relevant quick-access tools.
* **Comprehensive Record Management:**
    * **BHWs:** Manage detailed maternal patient records, including personal, obstetrical, medical, and social histories.
    * **BNSs:** Manage child health records with a focus on nutritional status, measurements, and immunization history.
    * **Mothers:** View their own health records and their children's records directly in the app.
* **Appointment Request System:** A complete workflow where mothers can request appointments from their mobile device. BHWs then receive a notification and can approve the request, sending a confirmation back to the mother.
* **Real-Time Notification System:** A fully functional in-app notification center with an unread counter. Alerts are automatically generated for:
    * Low or critical inventory levels.
    * New appointment requests from patients.
    * Confirmed or missed appointments.
    * Patients who are due for a check-up.
* **Inventory Management:** Separate modules for BHWs and BNSs to track stock levels of essential medical supplies, with automated status updates for "Low" and "Critical" stock.
* **QR Code Integration:** BHWs and BNSs can use the phone's camera to scan a patient's QR code, instantly retrieving their record to view or edit in the field.
* **Profile & Settings Management:** Users can edit their profile information, upload a new avatar, and manage notification preferences.

## 🛠️ Technology Stack

* **Framework:** React Native
* **Platform:** Expo
* **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
* **Navigation:** React Navigation (`@react-navigation/native`)
* **Animation:** React Native Reanimated
* **UI Components:** React Native SVG, `@react-native-picker/picker`
* **Device APIs:** `expo-camera`, `expo-image-picker`, `expo-file-system`, `expo-sharing`

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

* Node.js (LTS version)
* npm or yarn
* Expo Go app on your physical device (iOS or Android)
* A Supabase project set up with the correct database schema and RLS policies.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://your-repository-link.git
    cd your-project-folder
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    * Create a new file in the root of the project named `.env`.
    * Add your Supabase project credentials. You can find these in your Supabase Dashboard under `Project Settings > API`.

    **.env file:**
    ```env
    EXPO_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Update the Supabase client:**
    * Open `src/services/supabase.js` and ensure it's configured to use the environment variables.

    **src/services/supabase.js:**
    ```javascript
    import { createClient } from '@supabase/supabase-js';
    import 'react-native-url-polyfill/auto';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
    ```

5.  **Run the application:**
    ```sh
    npx expo start
    ```
    Scan the QR code that appears in your terminal with the Expo Go app on your phone.

## 📂 Project Structure

```
San-Miguel-MCIS-Mobile/
├── src/
│   ├── assets/         # Images, logos, and fonts
│   ├── components/     # Reusable components (BHW, BNS, common, layout)
│   ├── context/        # Global state management (Auth, Notifications, Header)
│   ├── navigation/     # App navigation stacks and tab bars (AppNavigator, AuthNavigator)
│   ├── screens/        # Top-level screen components (Login, Settings, etc.)
│   └── services/       # Backend services (supabase.js, activityLogger.js)
├── App.js              # The root component of the application
└── ...                 # Other configuration files
```

## 👥 Authors

* **Brizo, Ria Joy T.**
* **Chang, Franz Meinard N.**
* **Lanuza, Rodrigo M. III**
* **Pagkaliwangan, Kyla Mae G.**
* **Pasco, Jiro Antero M.**
