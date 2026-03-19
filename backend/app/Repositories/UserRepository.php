<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function getAll(): Collection
    {
        return User::with(['role', 'filiere'])->get();
    }

    public function findById(int $id): ?User
    {
        return User::with(['role', 'filiere'])->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::with(['role', 'filiere'])->where('email', $email)->first();
    }

    public function getByRole(string $roleName): Collection
    {
        return User::with(['role', 'filiere'])
            ->whereHas('role', function ($query) use ($roleName) {
                $query->where('name', $roleName);
            })
            ->get();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return User::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return User::destroy($id);
    }
}
