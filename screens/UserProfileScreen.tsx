import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const getUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem('@user_profile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
  }
};

export const deleteUserProfile = async () => {
  try {
    await AsyncStorage.removeItem('@user_profile');
  } catch (error) {
    console.error('Error deleting user profile:', error);
  }
};
