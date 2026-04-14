import { create } from "zustand";

const uk = {
  // ─── Common ───────────────────────────────────────────────────────────────
  common: {
    save: "Зберегти",
    cancel: "Скасувати",
    delete: "Видалити",
    edit: "Редагувати",
    add: "Додати",
    close: "Закрити",
    back: "Назад",
    search: "Пошук",
    loading: "Завантаження...",
    yes: "Так",
    no: "Ні",
    all: "Всі",
    name: "Ім'я",
    phone: "Телефон",
    email: "Електронна пошта",
    notes: "Нотатки",
    noResults: "Результатів не знайдено",
    tapToRetry: "Натисніть, щоб спробувати знову",
    areYouSure: "Ви впевнені?",
    cannotUndo: "Цю дію не можна скасувати.",
    error: "Помилка",
    success: "Успіх",
    optional: "необов'язково",
    camera: "Камера",
    gallery: "Галерея",
    choosePhotoSource: "Додати фото",
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────
  tabs: {
    home: "Головна",
    masters: "Майстри",
    clients: "Клієнти",
    settings: "Налаштування",
  },

  // ─── Auth – Login ─────────────────────────────────────────────────────────
  login: {
    title: "LumiSalon",
    tagline: "Краса, що керується легко.",
    welcomeBack: "З поверненням",
    signInSubtitle: "Увійдіть у свій обліковий запис, щоб продовжити.",
    emailPlaceholder: "Електронна пошта",
    passwordPlaceholder: "Пароль",
    forgotPassword: "Забули пароль?",
    logIn: "Увійти",
    orContinueWith: "або продовжити через",
    continueWithGoogle: "Продовжити через Google",
    noAccount: "Немає облікового запису?",
    signUp: "Зареєструватись",
    invalidCredentials: "Невірний email або пароль.",
  },

  // ─── Auth – Sign Up ───────────────────────────────────────────────────────
  signup: {
    title: "Створити акаунт",
    subtitle: "Заповніть дані нижче, щоб почати.",
    fullName: "Повне ім'я",
    phonePlaceholder: "Номер телефону",
    emailPlaceholder: "Електронна пошта",
    passwordPlaceholder: "Пароль",
    confirmPassword: "Підтвердити пароль",
    createAccount: "Створити акаунт",
    alreadyHaveAccount: "Вже є акаунт?",
    signIn: "Увійти",
    confirmEmail: "Підтвердіть email",
    confirmEmailMessage:
      "Ми надіслали посилання підтвердження на вашу пошту. Будь ласка, підтвердіть акаунт перед входом.",
    registrationFailed: "Реєстрація не вдалася. Спробуйте ще раз.",
  },

  // ─── Auth – Forgot Password ───────────────────────────────────────────────
  forgotPassword: {
    title: "Відновлення пароля",
    resetTitle: "Скинути пароль",
    resetSubtitle:
      "Введіть свою електронну пошту, і ми надішлемо посилання для скидання пароля.",
    emailPlaceholder: "Електронна пошта",
    sendResetLink: "Надіслати посилання",
    checkEmail: "Перевірте пошту",
    emailSentSubtitle:
      "Ми надіслали посилання для скидання пароля на вашу електронну пошту.",
    backToLogin: "Назад до входу",
    sendFailed: "Не вдалося надіслати посилання. Спробуйте ще раз.",
  },

  // ─── Home ─────────────────────────────────────────────────────────────────
  home: {
    allLocations: "Всі локації",
    switchLocation: "Натисніть для зміни локації",
    editProfile: "Редагувати профіль",
    searchPlaceholder: "Пошук процедур...",
    today: "Сьогодні",
    thisWeek: "Цей тиждень",
    totalClients: "Всього клієнтів",
    procedures: "процедур",
    clients: "клієнтів",
    noProcedures: "Процедур ще немає",
    noProceduresHint: "Натисніть + щоб записати першу процедуру",
    addFirstProcedure: "Натисніть + щоб додати першу процедуру",
    filterByLocation: "Фільтр за локацією",
    recentProcedures: "Останні процедури",
    seeAll: "Всі",
    seeAllCount: "Всі ({{count}})",
    showLess: "Згорнути",
  },

  // ─── Masters ──────────────────────────────────────────────────────────────
  masters: {
    title: "Майстри",
    searchPlaceholder: "Пошук майстрів...",
    noMasters: "Майстрів ще немає",
    noMastersHint: "Додайте першого майстра щоб розпочати",
    addMaster: "Додати майстра",
    newMaster: "Новий майстер",
  },

  // ─── Clients ─────────────────────────────────────────────────────────────
  clients: {
    title: "Клієнти",
    searchPlaceholder: "Пошук клієнтів...",
    noClients: "Клієнтів ще немає",
    noClientsHint: "Додайте першого клієнта щоб розпочати",
    addClient: "Додати клієнта",
    newClient: "Новий клієнт",
  },

  // ─── Settings ────────────────────────────────────────────────────────────
  settings: {
    title: "Налаштування",
    preferencesSection: "НАЛАШТУВАННЯ",
    accountSection: "АКАУНТ",
    appearance: "Зовнішній вигляд",
    appIcon: "Іконка застосунку",
    workingHours: "Робочі години",
    notifications: "Сповіщення",
    language: "Мова",
    logOut: "Вийти",
    deleteAccount: "Видалити акаунт",
    logOutConfirmTitle: "Вийти",
    logOutConfirmMessage: "Ви впевнені, що хочете вийти?",
    deleteConfirmTitle: "Видалити акаунт",
    deleteConfirmMessage:
      "Цю дію не можна скасувати. Усі ваші дані будуть остаточно видалені.",
    editProfile: "Редагувати",
  },

  // ─── Appearance ───────────────────────────────────────────────────────────
  appearance: {
    title: "Зовнішній вигляд",
    palette: "ПАЛІТРА",
    mode: "РЕЖИМ",
    light: "Світлий",
    dark: "Темний",
    system: "Системний",
    systemHint:
      'Оберіть "Системний", щоб автоматично відповідати зовнішньому вигляду пристрою.',
    paletteNames: {
      cream: "Вершковий",
      fucsia: "Фуксія",
      light: "Світлий",
      dark: "Темний",
      sage: "Шавлія",
    },
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: {
    title: "Сповіщення",
    allowNotifications: "Дозволити сповіщення",
    allowDesc: "Головний перемикач усіх сповіщень",
    typesSection: "ТИПИ СПОВІЩЕНЬ",
    appointmentReminders: "Нагадування про записи",
    appointmentDesc: "Нагадування перед майбутніми записами",
    newClientAlerts: "Сповіщення про нових клієнтів",
    newClientDesc: "Коли додається новий клієнт",
    dailySummary: "Щоденний підсумок",
    dailyDesc: "Підсумок процедур наприкінці дня",
    marketingUpdates: "Маркетингові оновлення",
    marketingDesc: "Акції та оголошення про нові функції",
    syncHint: "Налаштування сповіщень синхронізуються з вашим акаунтом.",
  },

  // ─── Working Hours ────────────────────────────────────────────────────────
  workingHours: {
    title: "Робочі години",
    cardTitle: "Встановіть розклад",
    cardSubtitle:
      "Натисніть на час, щоб редагувати. Ви отримаєте нагадування за 10 хв до початку і кінця зміни.",
    closed: "Вихідний",
    hint: 'Нагадування спрацьовують за 10 хвилин до початку і кінця зміни. Увімкніть "Нагадування про записи" у Сповіщеннях.',
    days: {
      Monday: "Понеділок",
      Tuesday: "Вівторок",
      Wednesday: "Середа",
      Thursday: "Четвер",
      Friday: "П'ятниця",
      Saturday: "Субота",
      Sunday: "Неділя",
    },
  },

  // ─── Language ─────────────────────────────────────────────────────────────
  language: {
    title: "Мова",
    selectLanguage: "ОБЕРІТЬ МОВУ",
    english: "English",
    ukrainian: "Українська",
    hint: "Застосунок перезавантажиться для застосування нової мови.",
  },

  // ─── Profile Edit ─────────────────────────────────────────────────────────
  profileEdit: {
    title: "Редагувати профіль",
    changePhoto: "Змінити фото",
    fullName: "Повне ім'я",
    phone: "Телефон",
    email: "Електронна пошта",
  },

  // ─── Client Detail ────────────────────────────────────────────────────────
  clientDetail: {
    title: "Клієнт",
    info: "Інформація",
    procedures: "Процедури",
    notes: "Нотатки",
    phone: "Телефон",
    email: "Електронна пошта",
    location: "Локація",
    noProcedures: "Процедур ще немає",
    noNotes: "Нотаток немає.",
    deleteClient: "Видалити клієнта",
    deleteConfirm: "Ви впевнені, що хочете видалити цього клієнта?",
    editClient: "Редагувати клієнта",
  },

  // ─── Client Create / Edit ─────────────────────────────────────────────────
  clientForm: {
    newTitle: "Новий клієнт",
    editTitle: "Редагувати клієнта",
    fullName: "Повне ім'я",
    phone: "Номер телефону",
    email: "Електронна пошта",
    location: "Локація",
    notes: "Нотатки",
    notesPlaceholder: "Будь-які нотатки про клієнта...",
    selectLocation: "Обрати локацію",
    save: "Зберегти клієнта",
  },

  // ─── Master Detail ────────────────────────────────────────────────────────
  masterDetail: {
    title: "Майстер",
    info: "Інформація",
    procedures: "процедур",
    clients: "клієнтів",
    photos: "Фото",
    phone: "Телефон",
    email: "Електронна пошта",
    positions: "Спеціалізації",
    locations: "Локації",
    recentServices: "Останні послуги",
    noProcedures: "Процедур ще немає",
    noPhotos: "Фото ще немає",
    deleteMaster: "Видалити майстра",
    deleteConfirm: "Ви впевнені, що хочете видалити цього майстра?",
  },

  // ─── Master Create / Edit ─────────────────────────────────────────────────
  masterForm: {
    newTitle: "Новий майстер",
    editTitle: "Редагувати майстра",
    fullName: "Повне ім'я",
    phone: "Номер телефону",
    email: "Електронна пошта",
    positions: "Спеціалізації",
    locations: "Локації",
    notes: "Нотатки",
    notesPlaceholder: "Будь-які нотатки про майстра...",
    save: "Зберегти майстра",
  },

  // ─── Procedure Detail ─────────────────────────────────────────────────────
  procedureDetail: {
    title: "Деталі процедури",
    info: "Інформація",
    photos: "Фото",
    notes: "Нотатки",
    client: "Клієнт",
    phone: "Телефон",
    dateTime: "Дата та час",
    master: "Майстер",
    location: "Локація",
    serviceDetails: "Деталі послуги",
    procedureType: "Тип процедури",
    adminNotes: "Нотатки адміністратора",
    noPhotos: "Фото ще не додано",
    noNotes: "Нотаток немає.",
    deleteProcedure: "Видалити процедуру",
    deleteConfirm:
      "Ви впевнені, що хочете видалити цю процедуру? Цю дію не можна скасувати.",
  },

  // ─── Procedure Create / Edit ──────────────────────────────────────────────
  procedureForm: {
    newTitle: "Додати процедуру",
    editTitle: "Редагувати процедуру",
    createTitle: "Створити процедуру",
    client: "Клієнт",
    master: "Майстер",
    location: "Локація",
    dateTime: "Дата та час",
    services: "Послуги",
    positions: "Спеціалізація",
    notes: "Нотатки",
    notesPlaceholder: "Додати нотатки...",
    photos: "Фото",
    addPhoto: "Додати фото",
    addMorePhotos: "Додати ще",
    selectClient: "Обрати клієнта",
    selectMaster: "Обрати майстра",
    selectLocation: "Обрати локацію",
    save: "Зберегти процедуру",
    photoUploadFailed: "Помилка завантаження фото",
    photoUploadFailedMsg: "Не вдалося завантажити фото. Перевірте з'єднання та спробуйте ще раз.",
    saveFailed: "Не вдалося зберегти. Спробуйте ще раз.",
  },

  // ─── Location Create ──────────────────────────────────────────────────────
  locationForm: {
    newTitle: "Нова локація",
    editTitle: "Редагувати локацію",
    name: "Назва локації",
    address: "Адреса",
    addressPlaceholder: "Вулиця, місто",
    addPhoto: "Додати фото",
    save: "Зберегти локацію",
  },

  // ─── Location Sheet ───────────────────────────────────────────────────────
  locationSheet: {
    title: "Обрати локацію",
    filterTitle: "Фільтр за локацією",
    allLocations: "Всі локації",
    addLocation: "Додати локацію",
    noLocations: "Локацій ще немає.",
  },

  // ─── Filter Sheet ─────────────────────────────────────────────────────────
  filterSheet: {
    title: "Фільтри",
    master: "Майстер",
    dateRange: "Діапазон дат",
    dateFrom: "Від",
    dateTo: "До",
    positions: "Спеціалізація",
    clearAll: "Очистити",
    apply: "Застосувати",
  },

  // ─── App Icon ─────────────────────────────────────────────────────────────
  appIcon: {
    title: "Іконка застосунку",
    default: "Стандартна",
    dark: "Темна",
    gold: "Золота",
    minimal: "Мінімальна",
    hint: "Зміна потребує перезапуску застосунку на деяких пристроях.",
  },
} as const;

export default uk;
