import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import RecoverPasswordApp from "./screens/RecoverPasswordApp";
import ForgotPasswordApp from "./screens/ForgotPasswordApp";
import AccessListPhone from "./screens/AccessListPhone";
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import InfoChat from "./screens/InfoChat";
import * as Linking from "expo-linking";

const Stack = createStackNavigator();

const linking = {
  prefixes: [Linking.createURL("/"), "appchatcnm://"],
  config: {
    screens: {
      Login: "login",
      SignUp: "signup",
      RecoverPasswordApp: "recover-password",
      ForgotPasswordApp: "reset-password/:token",
      PhoneContact: "phone-contact",
      ChatListScreen: "chat-list",
      ChatScreen: "chat/:conversationId",
      EditProfileScreen: "edit-profile",
      InfoChat: "info-chat",
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecoverPasswordApp"
          component={RecoverPasswordApp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasswordApp"
          component={ForgotPasswordApp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PhoneContact"
          component={AccessListPhone}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatListScreen"
          component={ChatListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InfoChat"
          component={InfoChat}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
