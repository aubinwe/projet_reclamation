<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $fillable = ['name', 'niveau'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function matieres()
    {
        return $this->hasMany(Matiere::class);
    }
}
