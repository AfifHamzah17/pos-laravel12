<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                // Regex: Minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial (@$!%*?&)
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ],
        ], [
            'password.regex' => 'Password harus mengandung kombinasi huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&).'
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Registrasi akun berhasil! Silakan login.',
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            return response()->json([
                'status'  => 'success',
                'message' => 'Login berhasil! Selamat datang ' . $user->name,
                'user'    => $user
            ]);
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Email atau password salah!'
        ], 401);
    }
}