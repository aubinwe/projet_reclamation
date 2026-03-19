<?php

namespace App\Repositories;

use App\Models\Matiere;
use App\Repositories\Interfaces\MatiereRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MatiereRepository implements MatiereRepositoryInterface
{
    public function getAll(): Collection
    {
        return Matiere::with(['filiere', 'enseignant'])->get();
    }

    public function findById(int $id): ?Matiere
    {
        return Matiere::with(['filiere', 'enseignant'])->find($id);
    }

    public function getByFiliere(int $filiereId): Collection
    {
        return Matiere::with(['filiere', 'enseignant'])
            ->where('filiere_id', $filiereId)
            ->get();
    }

    public function getByEnseignant(int $enseignantId): Collection
    {
        return Matiere::with(['filiere', 'enseignant'])
            ->where('enseignant_id', $enseignantId)
            ->get();
    }

    public function create(array $data): Matiere
    {
        return Matiere::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Matiere::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Matiere::destroy($id);
    }
}
