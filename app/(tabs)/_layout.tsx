import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#6B4DE6",
          tabBarInactiveTintColor: "#666",
        }}
      >
        <Tab.Screen
          name="home"
          component={require("./home").default}
          options={{
            title: "ホーム",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="gymSearch"
          component={require("./gymSearch").default}
          options={{
            title: "ジム検索",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="search" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="profile"
          component={require("./profile").default}
          options={{
            title: "プロフィール",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
        {/* <Tab.Screen
        name="messages" 
        component={require('./messages').default}
        options={{
          title: 'メッセージ',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="envelope" size={24} color={color} />
          ),
        }}
      /> */}
      </Tab.Navigator>
  );
}
