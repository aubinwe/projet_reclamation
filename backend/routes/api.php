<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\MatiereController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques (sans authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/login', [AuthController::class, 'login']);

// Routes de référence (Rôles et Filières)
Route::get('/roles', function() {
    return \App\Models\Role::all();
});
Route::get('/filieres', function() {
    return \App\Models\Filiere::all();
});

// Routes protégées (nécessitent un token Bearer valide)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Gestion des demandes / réclamations
    Route::get('demandes', [DemandeController::class, 'index']);
    Route::post('demandes', [DemandeController::class, 'store']);
    Route::get('demandes/{id}', [DemandeController::class, 'show']);
    Route::post('demandes/{id}/valider', [DemandeController::class, 'valider']);
    Route::post('demandes/{id}/rejeter', [DemandeController::class, 'rejeter']);
    Route::post('demandes/{id}/envoyer-au-da', [DemandeController::class, 'envoyerAuDA']);
    Route::post('demandes/{id}/imputer', [DemandeController::class, 'imputer']);
    Route::post('demandes/{id}/corriger', [DemandeController::class, 'corriger']);

    // Gestion des Matières
    Route::apiResource('matieres', MatiereController::class);

    // Gestion des Notes
    Route::apiResource('notes', \App\Http\Controllers\NoteController::class);
    Route::get('matieres/{id}/grades', [\App\Http\Controllers\NoteController::class, 'getGradesByMatiere']);
    Route::get('users/{id}/grades', [\App\Http\Controllers\NoteController::class, 'getStudentGrades']);

    // Gestion des Enseignants
    Route::get('teachers', [\App\Http\Controllers\TeachersController::class, 'index']);
    Route::post('teachers', [\App\Http\Controllers\TeachersController::class, 'store']);
    Route::post('teachers/{id}/assign-matiere', [\App\Http\Controllers\TeachersController::class, 'assignMatiere']);
    Route::post('teachers/{id}/unassign-matiere', [\App\Http\Controllers\TeachersController::class, 'unassignMatiere']);

    // Gestion des Utilisateurs et Notifications
    Route::get('users', [\App\Http\Controllers\UserController::class, 'index']);
    Route::post('users', [\App\Http\Controllers\UserController::class, 'store']);
    Route::delete('users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
    Route::get('users/enseignants', [\App\Http\Controllers\UserController::class, 'getEnseignants']);
    Route::get('notifications', [\App\Http\Controllers\UserController::class, 'getNotifications']);
    Route::post('notifications/{id}/read', [\App\Http\Controllers\UserController::class, 'markNotificationAsRead']);
});
