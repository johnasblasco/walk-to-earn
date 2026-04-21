import { useRouter } from 'expo-router';
import { Eye, EyeOff, Footprints, Lock, Mail } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
    n800: '#1F2937',
    n600: '#4B5563',
    n400: '#9CA3AF',
    n200: '#E5E7EB',
    n100: '#F3F4F6',
    g700: '#047857',
    g600: '#059669',
    g500: '#10B981',
    g200: '#A7F3D0',
    g100: '#D1FAE5',
    g50: '#ECFDF5',
    white: '#FFFFFF',
};

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, rightElement }: any) {
    const [focused, setFocused] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    function handleFocus() {
        setFocused(true);
        Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    }
    function handleBlur() {
        setFocused(false);
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }

    const borderColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.n200, colors.g500],
    });

    return (
        <Animated.View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1.5, borderColor,
            borderRadius: 16,
            backgroundColor: focused ? colors.g50 : colors.n100,
            paddingHorizontal: 14, paddingVertical: 14, gap: 10,
        }}>
            <View style={{ opacity: focused ? 1 : 0.5 }}>{icon}</View>
            <TextInput
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.n800 }}
                placeholder={placeholder}
                placeholderTextColor={colors.n400}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType || 'default'}
                autoCapitalize="none"
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            {rightElement}
        </Animated.View>
    );
}

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;

    function handlePressIn() {
        Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
    }
    function handlePressOut() {
        Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
    }

    function handleLogin() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.replace('/(tabs)');
        }, 1200);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Top accent bar */}
                    <View style={{ height: 5, backgroundColor: colors.g500, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginHorizontal: 44 }} />

                    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 44, paddingBottom: 32 }}>

                        {/* Logo */}
                        <View style={{ alignItems: 'center', marginBottom: 36 }}>
                            <View style={{
                                width: 72, height: 72, borderRadius: 22,
                                backgroundColor: colors.g500,
                                alignItems: 'center', justifyContent: 'center',
                                marginBottom: 20,
                                shadowColor: colors.g500, shadowOpacity: 0.35,
                                shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
                            }}>
                                <Footprints size={34} color="white" strokeWidth={2} />
                            </View>
                            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.n800, letterSpacing: -0.5, marginBottom: 6 }}>
                                Welcome back
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.n400, fontWeight: '500' }}>
                                Sign in to keep earning
                            </Text>
                        </View>

                        {/* Streak nudge */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 8,
                            backgroundColor: colors.g50, borderWidth: 1.5, borderColor: colors.g200,
                            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 28,
                        }}>
                            <Text style={{ fontSize: 18 }}>🔥</Text>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.g700, flex: 1 }}>
                                Your 7-day streak is waiting. Do not break it!
                            </Text>
                        </View>

                        {/* Inputs */}
                        <View style={{ gap: 12 }}>
                            <InputField
                                icon={<Mail size={18} color={colors.g500} strokeWidth={2} />}
                                placeholder="Email address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            <InputField
                                icon={<Lock size={18} color={colors.g500} strokeWidth={2} />}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                rightElement={
                                    <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7}>
                                        {showPassword
                                            ? <EyeOff size={18} color={colors.n400} strokeWidth={2} />
                                            : <Eye size={18} color={colors.n400} strokeWidth={2} />}
                                    </TouchableOpacity>
                                }
                            />
                        </View>

                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 10 }} activeOpacity={0.7}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.g600 }}>Forgot password?</Text>
                        </TouchableOpacity>

                        {/* Sign in button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 28 }}>
                            <Pressable
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                onPress={handleLogin}
                                disabled={loading}
                                style={{
                                    backgroundColor: loading ? colors.g200 : colors.g500,
                                    borderRadius: 18, paddingVertical: 17,
                                    alignItems: 'center',
                                    shadowColor: colors.g500, shadowOpacity: loading ? 0 : 0.3,
                                    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
                                }}
                            >
                                <Text style={{ fontSize: 16, fontWeight: '800', color: 'white', letterSpacing: 0.2 }}>
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </Text>
                            </Pressable>
                        </Animated.View>

                        {/* Divider */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: colors.n200 }} />
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.n400 }}>OR</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: colors.n200 }} />
                        </View>

                        {/* MiniPay */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{
                                marginTop: 16, borderRadius: 18,
                                borderWidth: 1.5, borderColor: colors.n200,
                                paddingVertical: 15,
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                        >
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.g500 }} />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.n800 }}>Continue with MiniPay</Text>
                        </TouchableOpacity>

                        {/* Register link */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 4 }}>
                            <Text style={{ fontSize: 14, color: colors.n400, fontWeight: '500' }}>Need an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/Register')} activeOpacity={0.7}>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.g600 }}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
