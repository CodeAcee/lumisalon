const en = {
  // ─── Common ───────────────────────────────────────────────────────────────
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    back: "Back",
    search: "Search",
    loading: "Loading...",
    yes: "Yes",
    no: "No",
    all: "All",
    name: "Name",
    phone: "Phone",
    email: "Email",
    notes: "Notes",
    noResults: "No results found",
    areYouSure: "Are you sure?",
    cannotUndo: "This action cannot be undone.",
    error: "Error",
    success: "Success",
    optional: "optional",
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────
  tabs: {
    home: "Home",
    masters: "Masters",
    clients: "Clients",
    settings: "Settings",
  },

  // ─── Auth – Login ─────────────────────────────────────────────────────────
  login: {
    title: "LumiSalon",
    tagline: "Beauty, effortlessly managed.",
    welcomeBack: "Welcome back",
    signInSubtitle: "Sign in to your account to continue.",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    forgotPassword: "Forgot password?",
    logIn: "Log In",
    orContinueWith: "or continue with",
    continueWithGoogle: "Continue with Google",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
  },

  // ─── Auth – Sign Up ───────────────────────────────────────────────────────
  signup: {
    title: "Create Account",
    subtitle: "Fill in the details below to get started.",
    fullName: "Full Name",
    phonePlaceholder: "Phone Number",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    confirmPassword: "Confirm Password",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
  },

  // ─── Auth – Forgot Password ───────────────────────────────────────────────
  forgotPassword: {
    title: "Forgot Password",
    resetTitle: "Reset Password",
    resetSubtitle:
      "Enter your email address and we'll send you a link to reset your password.",
    emailPlaceholder: "Email Address",
    sendResetLink: "Send Reset Link",
    checkEmail: "Check your email",
    emailSentSubtitle: "We sent a password reset link to your email address.",
    backToLogin: "Back to Login",
  },

  // ─── Home ─────────────────────────────────────────────────────────────────
  home: {
    allLocations: "All Locations",
    searchPlaceholder: "Search procedures...",
    today: "Today",
    thisWeek: "This Week",
    totalClients: "Total Clients",
    procedures: "procedures",
    clients: "clients",
    noProcedures: "No procedures yet",
    addFirstProcedure: "Tap + to add your first procedure",
    filterByLocation: "Filter by Location",
    recentProcedures: "Recent Procedures",
  },

  // ─── Masters ──────────────────────────────────────────────────────────────
  masters: {
    title: "Masters",
    searchPlaceholder: "Search masters...",
    noMasters: "No masters found",
    addMaster: "Add Master",
    newMaster: "New Master",
  },

  // ─── Clients ─────────────────────────────────────────────────────────────
  clients: {
    title: "Clients",
    searchPlaceholder: "Search clients...",
    noClients: "No clients found",
    addClient: "Add Client",
    newClient: "New Client",
  },

  // ─── Settings ────────────────────────────────────────────────────────────
  settings: {
    title: "Settings",
    preferencesSection: "PREFERENCES",
    accountSection: "ACCOUNT",
    appearance: "Appearance",
    appIcon: "App Icon",
    workingHours: "Working Hours",
    notifications: "Notifications",
    language: "Language",
    logOut: "Log Out",
    deleteAccount: "Delete Account",
    logOutConfirmTitle: "Log Out",
    logOutConfirmMessage: "Are you sure you want to log out?",
    deleteConfirmTitle: "Delete Account",
    deleteConfirmMessage:
      "This action cannot be undone. All your data will be permanently deleted.",
    editProfile: "Edit",
  },

  // ─── Appearance ───────────────────────────────────────────────────────────
  appearance: {
    title: "Appearance",
    palette: "PALETTE",
    mode: "MODE",
    light: "Light",
    dark: "Dark",
    system: "System",
    systemHint:
      'Choose "System" to automatically match your device appearance.',
    paletteNames: {
      cream: "Cream",
      fucsia: "Fucsía",
      light: "Light",
      dark: "Dark",
      sage: "Sage",
    },
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: {
    title: "Notifications",
    allowNotifications: "Allow Notifications",
    allowDesc: "Master toggle for all notifications",
    typesSection: "NOTIFICATION TYPES",
    appointmentReminders: "Appointment Reminders",
    appointmentDesc: "Get reminded before upcoming appointments",
    newClientAlerts: "New Client Alerts",
    newClientDesc: "When a new client is added",
    dailySummary: "Daily Summary",
    dailyDesc: "End-of-day recap of procedures",
    marketingUpdates: "Marketing Updates",
    marketingDesc: "Promotions and feature announcements",
    syncHint: "Notification preferences are synced with your account.",
  },

  // ─── Working Hours ────────────────────────────────────────────────────────
  workingHours: {
    title: "Working Hours",
    cardTitle: "Set Your Schedule",
    cardSubtitle:
      "Tap a time to edit. You'll get a reminder 10 min before your shift starts and ends each day.",
    closed: "Closed",
    hint: 'Reminders fire 10 minutes before your shift starts and ends. Enable "Appointment Reminders" in Notifications to activate.',
    days: {
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Sunday: "Sunday",
    },
  },

  // ─── Language ─────────────────────────────────────────────────────────────
  language: {
    title: "Language",
    selectLanguage: "SELECT LANGUAGE",
    english: "English",
    ukrainian: "Ukrainian",
    hint: "The app will restart to apply the new language.",
  },

  // ─── Profile Edit ─────────────────────────────────────────────────────────
  profileEdit: {
    title: "Edit Profile",
    changePhoto: "Change Photo",
    fullName: "Full Name",
    phone: "Phone",
    email: "Email",
  },

  // ─── Client Detail ────────────────────────────────────────────────────────
  clientDetail: {
    title: "Client",
    info: "Info",
    procedures: "Procedures",
    notes: "Notes",
    phone: "Phone",
    email: "Email",
    location: "Location",
    noProcedures: "No procedures yet",
    noNotes: "No notes for this client.",
    deleteClient: "Delete Client",
    deleteConfirm: "Are you sure you want to delete this client?",
    editClient: "Edit Client",
  },

  // ─── Client Create / Edit ─────────────────────────────────────────────────
  clientForm: {
    newTitle: "New Client",
    editTitle: "Edit Client",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email",
    location: "Location",
    notes: "Notes",
    notesPlaceholder: "Any notes about this client...",
    selectLocation: "Select Location",
    save: "Save Client",
  },

  // ─── Master Detail ────────────────────────────────────────────────────────
  masterDetail: {
    title: "Master",
    info: "Info",
    procedures: "procedures",
    clients: "clients",
    photos: "Photos",
    phone: "Phone",
    email: "Email",
    positions: "Positions",
    locations: "Locations",
    recentServices: "Recent Services",
    noProcedures: "No procedures yet",
    noPhotos: "No photos yet",
    deleteMaster: "Delete Master",
    deleteConfirm: "Are you sure you want to delete this master?",
  },

  // ─── Master Create / Edit ─────────────────────────────────────────────────
  masterForm: {
    newTitle: "New Master",
    editTitle: "Edit Master",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email",
    positions: "Specializations",
    locations: "Locations",
    notes: "Notes",
    notesPlaceholder: "Any notes about this master...",
    save: "Save Master",
  },

  // ─── Procedure Detail ─────────────────────────────────────────────────────
  procedureDetail: {
    title: "Procedure Details",
    info: "Info",
    photos: "Photos",
    notes: "Notes",
    client: "Client",
    phone: "Phone",
    dateTime: "Date & Time",
    master: "Master",
    location: "Location",
    serviceDetails: "Service Details",
    procedureType: "Procedure Type",
    adminNotes: "Administrator Notes",
    noPhotos: "No photos added yet",
    noNotes: "No notes for this procedure.",
    deleteProcedure: "Delete Procedure",
    deleteConfirm:
      "Are you sure you want to delete this procedure? This action cannot be undone.",
  },

  // ─── Procedure Create / Edit ──────────────────────────────────────────────
  procedureForm: {
    newTitle: "New Procedure",
    editTitle: "Edit Procedure",
    client: "Client",
    master: "Master",
    location: "Location",
    dateTime: "Date & Time",
    services: "Services",
    positions: "Position",
    notes: "Notes",
    notesPlaceholder: "Add notes...",
    photos: "Photos",
    addPhoto: "Add Photo",
    selectClient: "Select Client",
    selectMaster: "Select Master",
    selectLocation: "Select Location",
    save: "Save Procedure",
  },

  // ─── Location Create ──────────────────────────────────────────────────────
  locationForm: {
    newTitle: "New Location",
    editTitle: "Edit Location",
    name: "Location Name",
    address: "Address",
    addressPlaceholder: "Street, City",
    addPhoto: "Add Photo",
    save: "Save Location",
  },

  // ─── Location Sheet ───────────────────────────────────────────────────────
  locationSheet: {
    title: "Select Location",
    filterTitle: "Filter by Location",
    allLocations: "All Locations",
    addLocation: "Add Location",
    noLocations: "No locations yet.",
  },

  // ─── Filter Sheet ─────────────────────────────────────────────────────────
  filterSheet: {
    title: "Filters",
    master: "Master",
    dateRange: "Date Range",
    dateFrom: "From",
    dateTo: "To",
    positions: "Position",
    clearAll: "Clear All",
    apply: "Apply Filters",
  },

  // ─── App Icon ─────────────────────────────────────────────────────────────
  appIcon: {
    title: "App Icon",
    default: "Default",
    dark: "Dark",
    gold: "Gold",
    minimal: "Minimal",
    hint: "Change requires app restart on some devices.",
  },
} as const;

export type TranslationKeys = typeof en;
export default en;
