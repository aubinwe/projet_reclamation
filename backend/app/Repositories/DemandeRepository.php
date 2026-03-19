<?php

namespace App\Repositories;

use App\Models\Demande;
use App\Repositories\Interfaces\DemandeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class DemandeRepository implements DemandeRepositoryInterface
{
    public function getAll(): Collection
    {
        return Demande::with(['user', 'matiere', 'enseignant'])->get();
    }

    public function getByUser(int $userId): Collection
    {
        return Demande::with(['user', 'matiere', 'enseignant'])
            ->where('user_id', $userId)
            ->get();
    }

    public function getByEnseignant(int $enseignantId): Collection
    {
        return Demande::with(['user', 'matiere', 'enseignant'])
            ->where('enseignant_id', $enseignantId)
            ->get();
    }

    public function getByStatus(string $status): Collection
    {
        return Demande::with(['user', 'matiere', 'enseignant'])
            ->where('statut', $status)
            ->get();
    }

    public function findById(int $id): ?Demande
    {
        return Demande::with(['user', 'matiere', 'enseignant'])->find($id);
    }

    public function create(array $data): Demande
    {
        return Demande::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Demande::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Demande::destroy($id);
    }

    public function updateStatus(int $id, string $status): bool
    {
        return $this->update($id, ['statut' => $status]);
    }
}
