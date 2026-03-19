<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Matiere;
use App\Mail\UserCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class TeachersController extends Controller
{
    /**
     * List all teachers with their assigned subjects.
     */
    public function index()
    {
        $roleTeacher = Role::where('name', 'teacher')->first();
        if (!$roleTeacher) {
            return response()->json([], 200);
        }

        $teachers = User::where('role_id', $roleTeacher->id)
            ->with(['matieres.filiere'])
            ->get();

        return response()->json($teachers);
    }

    /**
     * Store a new teacher.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $roleTeacher = Role::where('name', 'teacher')->first();

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleTeacher->id,
        ]);

        // Envoi des identifiants par mail
        try {
            Mail::to($teacher->email)->send(new UserCredentialsMail($teacher->name, $teacher->email, $request->password));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Erreur d'envoi de mail à {$teacher->email}: " . $e->getMessage());
        }

        return response()->json($teacher->load('matieres.filiere'), 201);
    }

    /**
     * Assign a subject to a teacher.
     */
    public function assignMatiere(Request $request, $id)
    {
        $request->validate([
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $teacher = User::findOrFail($id);
        $matiere = Matiere::findOrFail($request->matiere_id);

        $matiere->update(['enseignant_id' => $teacher->id]);

        return response()->json([
            'message' => "Matière {$matiere->name} affectée à {$teacher->name}",
            'teacher' => $teacher->load('matieres.filiere')
        ]);
    }

    /**
     * Unassign a subject from a teacher.
     */
    public function unassignMatiere(Request $request, $id)
    {
        $request->validate([
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $matiere = Matiere::where('id', $request->matiere_id)
            ->where('enseignant_id', $id)
            ->firstOrFail();

        $matiere->update(['enseignant_id' => null]);

        $teacher = User::findOrFail($id);

        return response()->json([
            'message' => "Affectation de {$matiere->name} supprimée",
            'teacher' => $teacher->load('matieres.filiere')
        ]);
    }
}
