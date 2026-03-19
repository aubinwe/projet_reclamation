<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $fillable = ['name', 'filiere_id', 'enseignant_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
