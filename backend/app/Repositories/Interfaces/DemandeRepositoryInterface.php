<?php

namespace App\Repositories\Interfaces;

use App\Models\Demande;
use Illuminate\Database\Eloquent\Collection;

interface DemandeRepositoryInterface
{
    public function getAll(): Collection;

    public function getByUser(int $userId): Collection;

    public function getByEnseignant(int $enseignantId): Collection;

    public function getByStatus(string $status): Collection;

    public function findById(int $id): ?Demande;

    public function create(array $data): Demande;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;

    public function updateStatus(int $id, string $status): bool;
}
