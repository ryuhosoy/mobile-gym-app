import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: '#6B4DE6',
      tabBarInactiveTintColor: '#666',
    }}>
      <Tab.Screen
        name="gymSearch"
        component={require('./gymSearch').default}
        options={{
          title: 'ジム検索',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="messages" 
        component={require('./messages').default}
        options={{
          title: 'メッセージ',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="envelope" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
