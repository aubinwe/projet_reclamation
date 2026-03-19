<?php

namespace App\Http\Controllers;

use App\Models\Matiere;
use App\Repositories\Interfaces\MatiereRepositoryInterface;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    protected $matiereRepository;

    public function __construct(MatiereRepositoryInterface $matiereRepository)
    {
        $this->matiereRepository = $matiereRepository;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($request->has('my') && $user && $user->role->name === 'teacher') {
            return response()->json($this->matiereRepository->getByEnseignant($user->id));
        }

        // Charger les relations filiere et enseignant
        return response()->json(Matiere::with(['filiere', 'enseignant'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
            'enseignant_id' => 'nullable|exists:users,id',
        ]);

        $data = $request->all();
        $user = $request->user();

        // Si c'est un enseignant qui ajoute, on lui assigne d'office la matière
        if ($user->role->name === 'teacher') {
            $data['enseignant_id'] = $user->id;
        }

        $matiere = Matiere::create($data);

        return response()->json($matiere->load('filiere'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Matiere $matiere)
    {
        return response()->json($matiere->load('filiere'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Matiere $matiere)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
            'enseignant_id' => 'nullable|exists:users,id',
        ]);

        $matiere->update($request->all());

        return response()->json($matiere->load(['filiere', 'enseignant']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Matiere $matiere)
    {
        $matiere->delete();

        return response()->json(['message' => 'Matiere deleted successfully']);
    }
}
