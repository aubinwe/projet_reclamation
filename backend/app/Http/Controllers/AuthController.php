<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'filiere_id' => $request->filiere_id,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        try {
            \Illuminate\Support\Facades\Mail::to($user)->send(new \App\Mail\AccountCreated($user));
        } catch (\Exception $e) {
            // Log email error but don't fail registration
            \Illuminate\Support\Facades\Log::error('Failed to send welcome email: ' . $e->getMessage());
        }

        return response()->json([
            'user' => $user->load('role', 'filiere'),
            'token' => $token,
        ]);
    }

    /**
     * Connexion de l'utilisateur et génération du token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'role_name' => 'required|string|exists:roles,name',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects ou rôle invalide'],
            ]);
        }

        $user = Auth::user();

        // Vérifier si le rôle choisi correspond au rôle réel de l'utilisateur
        if ($user->role->name !== $request->role_name) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects ou rôle invalide'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role', 'filiere'),
            'token' => $token,
        ]);
    }

    /**
     * Envoi du lien de réinitialisation de mot de passe.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            // Laravel gèrera l'envoi s'il est configuré
            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json(['message' => 'Lien de réinitialisation envoyé avec succès !']);
            }

            return response()->json(['message' => 'Impossible d\'envoyer le lien (vérifiez si l\'email existe).'], 400);
        } catch (\Exception $e) {
            // Capturer les erreurs SMTP (ex: mauvais mot de passe d'application)
            return response()->json([
                'message' => 'Erreur technique lors de l\'envoi du mail : ' . $e->getMessage(),
                'detail' => 'Vérifiez la configuration SMTP dans votre fichier .env'
            ], 500);
        }
    }

    /**
     * Réinitialisation du mot de passe avec le token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mot de passe réinitialisé avec succès !'])
            : response()->json(['message' => 'Impossible de réinitialiser le mot de passe (jeton invalide).'], 400);
    }

    /**
     * Déconnexion (révocation du token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Récupération des informations de l'utilisateur connecté.
     */
    public function user(Request $request)
    {
        return response()->json($request->user()->load('role', 'filiere'));
    }
}
