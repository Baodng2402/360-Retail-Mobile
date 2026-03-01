export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTP: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Rentals: undefined;
  Orders: undefined;
  Inventory: undefined;
  ProfileStack: undefined;
};

export type RentalsStackParamList = {
  POS: undefined;
  Checkout: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
  SalesReport: undefined;
};
