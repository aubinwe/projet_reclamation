<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Mail\UserCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    /**
     * Liste de tous les utilisateurs
     */
    public function index()
    {
        $users = User::with(['role', 'filiere'])->get();
        return response()->json($users);
    }

    /**
     * Création d'un nouvel utilisateur par le DA
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role_id' => $request->role_id,
            'filiere_id' => $request->filiere_id,
        ]);
        
        // Envoi des identifiants par mail
        try {
            Mail::to($user->email)->send(new UserCredentialsMail($user->name, $user->email, $request->password));
        } catch (\Exception $e) {
            // Log error but don't stop the process
            \Illuminate\Support\Facades\Log::error("Erreur d'envoi de mail à {$user->email}: " . $e->getMessage());
        }

        return response()->json($user->load('role', 'filiere'), 201);
    }

    /**
     * Récupérer la liste des enseignants
     */
    public function getEnseignants()
    {
        $roleEnseignant = Role::where('name', 'teacher')->first();
        if (!$roleEnseignant) {
            return response()->json([], 200);
        }

        $enseignants = User::where('role_id', $roleEnseignant->id)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json($enseignants);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting yourself
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    /**
     * Récupérer les notifications de l'utilisateur connecté
     */
    public function getNotifications(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markNotificationAsRead(Request $request, $id)
    {
        // ... (existing code or just use the whole file replacement)
        $notification = $request->user()->notifications()->where('id', $id)->first();
        
        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Notification marquée comme lue']);
    }
}
