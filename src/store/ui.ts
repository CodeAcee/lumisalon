import { create } from 'zustand';

interface UIState {
  // Password visibility toggles
  loginPasswordVisible: boolean;
  signupPasswordVisible: boolean;
  signupConfirmPasswordVisible: boolean;

  // Modal states
  masterSelectModalOpen: boolean;
  clientSelectModalOpen: boolean;
  serviceSelectModalOpen: boolean;
  addServiceModalOpen: boolean;
  addClientModalOpen: boolean;

  // Image viewer
  imageViewerOpen: boolean;
  imageViewerIndex: number;
  imageViewerImages: string[];

  // Actions
  toggleLoginPassword: () => void;
  toggleSignupPassword: () => void;
  toggleSignupConfirmPassword: () => void;
  setMasterSelectModalOpen: (open: boolean) => void;
  setClientSelectModalOpen: (open: boolean) => void;
  setServiceSelectModalOpen: (open: boolean) => void;
  setAddServiceModalOpen: (open: boolean) => void;
  setAddClientModalOpen: (open: boolean) => void;
  openImageViewer: (images: string[], index: number) => void;
  closeImageViewer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loginPasswordVisible: false,
  signupPasswordVisible: false,
  signupConfirmPasswordVisible: false,
  masterSelectModalOpen: false,
  clientSelectModalOpen: false,
  serviceSelectModalOpen: false,
  addServiceModalOpen: false,
  addClientModalOpen: false,
  imageViewerOpen: false,
  imageViewerIndex: 0,
  imageViewerImages: [],

  toggleLoginPassword: () =>
    set((s) => ({ loginPasswordVisible: !s.loginPasswordVisible })),
  toggleSignupPassword: () =>
    set((s) => ({ signupPasswordVisible: !s.signupPasswordVisible })),
  toggleSignupConfirmPassword: () =>
    set((s) => ({ signupConfirmPasswordVisible: !s.signupConfirmPasswordVisible })),
  setMasterSelectModalOpen: (open) => set({ masterSelectModalOpen: open }),
  setClientSelectModalOpen: (open) => set({ clientSelectModalOpen: open }),
  setServiceSelectModalOpen: (open) => set({ serviceSelectModalOpen: open }),
  setAddServiceModalOpen: (open) => set({ addServiceModalOpen: open }),
  setAddClientModalOpen: (open) => set({ addClientModalOpen: open }),
  openImageViewer: (images, index) =>
    set({ imageViewerOpen: true, imageViewerImages: images, imageViewerIndex: index }),
  closeImageViewer: () =>
    set({ imageViewerOpen: false, imageViewerImages: [], imageViewerIndex: 0 }),
}));
