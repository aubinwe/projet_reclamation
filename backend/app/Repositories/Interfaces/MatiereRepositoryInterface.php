<?php

namespace App\Repositories\Interfaces;

use App\Models\Matiere;
use Illuminate\Database\Eloquent\Collection;

interface MatiereRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Matiere;
    public function getByFiliere(int $filiereId): Collection;
    public function getByEnseignant(int $enseignantId): Collection;
    public function create(array $data): Matiere;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
