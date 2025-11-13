import { Stack } from 'expo-router'
import React from 'react'

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" 
        options={{
          title: "Profile",
          headerShown: true
        }}/>
    </Stack>
  )
}