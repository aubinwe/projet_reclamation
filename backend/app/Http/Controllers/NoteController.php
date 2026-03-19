<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Si l'utilisateur est un enseignant, on retourne les notes de ses matières
        if ($user->role->name === 'teacher') {
            // C'est un peu complexe car on veut souvent voir les notes PAR matière.
            // On va peut-être laisser le frontend appeler show() ou une méthode spécifique pour ça.
            // Pour l'instant, on peut retourner toutes les notes données par cet enseignant (via les matières).
            $matieresIds = $user->matieres->pluck('id');
            return Note::whereIn('matiere_id', $matieresIds)->with(['user', 'matiere'])->get();
        }

        // Si c'est la scolarité ou un admin, on retourne tout
        if ($user->role->name === 'registrar' || $user->role->name === 'admin') {
            $query = Note::with(['user', 'matiere']);
            
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            return $query->get();
        }

        return response()->json(['message' => 'Non autorisé'], 403);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'matiere_id' => 'required|exists:matieres,id',
            'note' => 'required|numeric|min:0|max:20',
            'commentaire' => 'nullable|string'
        ]);

        // Vérification des droits (un enseignant ne peut noter que ses matières)
        $user = Auth::user();
        if ($user->role->name === 'teacher') {
            $matiere = Matiere::find($request->matiere_id);
            if ($matiere->enseignant_id !== $user->id) {
                return response()->json(['message' => 'Vous n\'enseignez pas cette matière.'], 403);
            }
        }

        // On utilise updateOrCreate pour faciliter la saisie (si on retape, ça met à jour)
        $note = Note::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'matiere_id' => $request->matiere_id,
            ],
            [
                'note' => $request->note,
                'commentaire' => $request->commentaire
            ]
        );

        return response()->json($note, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Note::with(['user', 'matiere'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $note = Note::findOrFail($id);
        
        $request->validate([
            'note' => 'numeric|min:0|max:20',
            'commentaire' => 'nullable|string'
        ]);

        // Vérification : Seule la scolarité peut modifier une note existante sans contrainte, 
        // ou l'enseignant de la matière concernée.
        $user = Auth::user();
        $isScolarite = $user->role->name === 'registrar' || $user->role->name === 'admin';
        $isEnseignantDeLaMatiere = $user->role->name === 'teacher' && $note->matiere->enseignant_id === $user->id;

        if (!$isScolarite && !$isEnseignantDeLaMatiere) {
             return response()->json(['message' => 'Non autorisé'], 403);
        }

        $note->update($request->only(['note', 'commentaire']));

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       // Optionnel pour l'instant
    }

    /**
     * Get grades for a specific subject (Matiere)
     * Includes all eligible students (based on Filiere) and their current grades if any.
     */
    public function getGradesByMatiere($matiereId)
    {
        $matiere = Matiere::findOrFail($matiereId);
        $user = Auth::user();

        // Sécurité
        if ($user->role->name === 'teacher' && $matiere->enseignant_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // 1. Récupérer tous les étudiants de la filière de la matière
        $students = User::whereHas('role', function($q) {
                            $q->where('name', 'student');
                        })
                        ->where('filiere_id', $matiere->filiere_id)
                        ->get();

        // 2. Récupérer les notes existantes pour cette matière
        $notes = Note::where('matiere_id', $matiereId)->get()->keyBy('user_id');

        // 3. Fusionner pour le frontend
        $result = $students->map(function ($student) use ($notes) {
            $note = $notes->get($student->id);
            return [
                'student' => $student,
                'note' => $note ? $note->note : null,
                'commentaire' => $note ? $note->commentaire : null,
                'note_id' => $note ? $note->id : null, 
            ];
        });

        return response()->json([
            'matiere' => $matiere,
            'grades' => $result
        ]);
    }

    /**
     * Get all grades for a specific student
     */
    public function getStudentGrades($userId)
    {
        $student = User::with(['filiere', 'role'])->findOrFail($userId);

        // Vérification que c'est bien un étudiant ?
        // if ($student->role->name !== 'Etudiant' ...) 

        // 1. Récupérer les matières de sa filière
        if (!$student->filiere_id) {
             return response()->json([
                'student' => $student,
                'grades' => []
            ]);
        }

        $matieres = Matiere::where('filiere_id', $student->filiere_id)->get();

        // 2. Récupérer ses notes existantes
        $notes = Note::where('user_id', $userId)->get()->keyBy('matiere_id');

        // 3. Fusionner
        $result = $matieres->map(function ($matiere) use ($notes) {
            $note = $notes->get($matiere->id);
            return [
                'matiere' => $matiere,
                'note' => $note ? $note->note : null,
                'commentaire' => $note ? $note->commentaire : null,
                'note_id' => $note ? $note->id : null,
            ];
        });

        return response()->json([
            'student' => $student,
            'grades' => $result
        ]);
    }
}
